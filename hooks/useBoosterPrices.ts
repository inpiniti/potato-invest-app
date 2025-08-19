import { useEffect, useRef, useMemo } from 'react';
import { useBoosterStore } from '../stores/booster';
import { useAuthStore } from '../stores/auth';
import { useKIWebSocket } from './useKIWebSocket';
import { create } from 'zustand';

// HDFSCNT0 실시간 해외지수/종목 (예시) 필드 목록 (caret ^ 구분)
const FIELD_KEYS = [
  'RSYM','SYMB','ZDIV','TYMD','XYMD','XHMS','KYMD','KHMS','OPEN','HIGH','LOW','LAST','SIGN','DIFF','RATE','PBID','PASK','VBID','VASK','EVOL','TVOL','TAMT','BIVL','ASVL','STRN','MTYP'
];

// Debug 플래그 (필요 시 false 로 변경)
const DBG = true;

type BoosterTick = {
  last: number;
  rate: number;
  updatedAt: number;
  prevLast?: number;
  raw?: Record<string,string>; // 원문 필요 시
};

type BoosterPriceState = {
  prices: Record<string, BoosterTick>;
  update: (ticker: string, data: BoosterTick) => void;
  bulkRemove: (tickers: string[]) => void;
  clearAll: () => void;
};

export const useBoosterPriceStore = create<BoosterPriceState>((set) => ({
  prices: {},
  update: (ticker, data) => set((s) => {
    const cur = s.prices[ticker];
    const changed = !cur || cur.last !== data.last || cur.rate !== data.rate;
    if (!changed) return s; // 값 동일 시 불필요 업데이트 차단
  if (DBG) console.log('[RT] store update', ticker, 'last', data.last, 'rate', data.rate);
    return {
      prices: {
        ...s.prices,
        [ticker]: {
          last: data.last,
            rate: data.rate,
            updatedAt: Date.now(),
            prevLast: cur ? (cur.last !== data.last ? cur.last : cur.prevLast) : undefined,
            raw: data.raw,
        }
      }
    };
  }),
  bulkRemove: (tickers) => set((s) => {
    if (!tickers.length) return s;
    const clone = { ...s.prices };
    tickers.forEach(t => delete clone[t]);
    return { prices: clone };
  }),
  clearAll: () => set({ prices: {} })
}));

// 구독/해제 메시지 (실제 프로토콜 적용 시 교체). tr_type: 1=등록, 2=해제
function buildHDFSCNT0Message(approvalKey: string, tr_key: string, tr_type: '1'|'2') {
  return JSON.stringify({
    header: {
      approval_key: approvalKey,
      custtype: 'P',
      tr_type,
      'content-type': 'utf-8'
    },
    body: { input: { tr_id: 'HDFSCNT0', tr_key } }
  });
}

// caret 구분 문자열 → 레코드 파싱
function parseCaretMessage(raw: string): Record<string,string> | null {
  if (!raw.includes('^')) return null;
  const parts = raw.split('^');
  const rec: Record<string,string> = {};
  FIELD_KEYS.forEach((k,i) => { rec[k] = parts[i] || ''; });
  return rec;
}

// ticker 변환: 서버 tr_key 가 DNAS + SYMBOL 형태라면 역으로 제거
function extractTicker(symbolish: string) {
  return symbolish?.startsWith('DNAS') ? symbolish.slice(4) : symbolish;
}

export function useBoosterPrices() {
  const items = useBoosterStore(s => s.items); // raw items
  // tickers 배열 안정화: 정렬 + 메모이제이션 (순서변경 없이 추가/삭제 감지 용도)
  const tickers = useMemo(() => {
    return items.map(i => i.ticker);
  }, [items]);
  const tickersKey = useMemo(() => tickers.join('|'), [tickers]);
  const { tokens } = useAuthStore();
  const { getConnectionInfo } = useKIWebSocket();

  const wsRef = useRef<WebSocket | null>(null);
  const openedRef = useRef(false);
  const prevTickersRef = useRef<string[]>([]);
  const pendingRef = useRef<string[]>([]); // 소켓 오픈 전 대기 구독
  const approvalKeyRef = useRef<string | null>(null);
  const updateFnRef = useRef(useBoosterPriceStore.getState().update);
  const bulkRemoveRef = useRef(useBoosterPriceStore.getState().bulkRemove);
  const lastEmitRef = useRef<Record<string, number>>({});

  // 최신 actions ref 동기화 (참조 안정화)
  useEffect(() => {
    updateFnRef.current = useBoosterPriceStore.getState().update;
    bulkRemoveRef.current = useBoosterPriceStore.getState().bulkRemove;
  if (DBG) console.log('[RT] sync action refs');
  });

  // 소켓 생성/해제 (approvalKey 변경 시 재연결)
  useEffect(() => {
    const approvalKey = tokens.approvalKey;
    if (!approvalKey) return; // 로그인 전
    // 이미 동일 키로 열려있으면 skip
    if (wsRef.current && approvalKeyRef.current === approvalKey) return;
  if (DBG) console.log('[RT] (re)connect websocket, approvalKey:', approvalKey);
    // 기존 소켓 정리
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
      openedRef.current = false;
      pendingRef.current = [];
    }
    approvalKeyRef.current = approvalKey;
    const { url } = getConnectionInfo();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      openedRef.current = true;
      if (DBG) console.log('[RT] socket open, resubscribe all tickers', tickers);
      // 기존 티커 모두 재구독
      prevTickersRef.current = [];
      tickers.forEach(t => pendingRef.current.push(t));
      // pending 처리
      const key = approvalKeyRef.current!;
      pendingRef.current.forEach(t => {
        try { ws.send(buildHDFSCNT0Message(key, `DNAS${t}`, '1')); if (DBG) console.log('[RT] SUB(open)', t); } catch {}
      });
      pendingRef.current = [];
    };

    ws.onmessage = (ev) => {
      const raw = ev.data;
      if (typeof raw !== 'string') return;
      const rec = parseCaretMessage(raw);
      if (!rec) return; // JSON 체계 등은 무시
      const sym = rec['SYMB'] || rec['RSYM'];
      if (!sym) return;
      const ticker = extractTicker(sym);
      // 필드 추출
      const lastStr = rec['LAST'];
      const rateStr = rec['RATE'];
      const last = Number(lastStr) || 0;
      const rate = Number(rateStr) || 0;
      // 티커별 스로틀 (200ms)
      const now = Date.now();
      const lastEmit = lastEmitRef.current[ticker] || 0;
      if (now - lastEmit < 200) return;
      lastEmitRef.current[ticker] = now;
  if (DBG) console.log('[RT] recv', ticker, 'last', last, 'rate', rate);
      updateFnRef.current(ticker, { last, rate, updatedAt: now, raw: rec });
    };

    ws.onclose = () => {
      openedRef.current = false;
      wsRef.current = null;
    };
    ws.onerror = () => {};

    return () => {
      try { ws.close(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens.approvalKey]);

  // 구독 diff (tickers 변경 시에만 수행) — store 가격 업데이트와 독립
  useEffect(() => {
    if (!openedRef.current || !approvalKeyRef.current) return;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const prev = prevTickersRef.current;
    const cur = tickers;
    const added = cur.filter(t => !prev.includes(t));
    const removed = prev.filter(t => !cur.includes(t));
  if (DBG && (added.length || removed.length)) console.log('[RT] diff added', added, 'removed', removed);
    const key = approvalKeyRef.current;
    if (added.length) {
      added.forEach(t => {
    try { ws.send(buildHDFSCNT0Message(key!, `DNAS${t}`, '1')); if (DBG) console.log('[RT] SUB(diff)', t); } catch {}
      });
    }
    if (removed.length) {
      removed.forEach(t => {
    try { ws.send(buildHDFSCNT0Message(key!, `DNAS${t}`, '2')); if (DBG) console.log('[RT] UNSUB(diff)', t); } catch {}
      });
      // 가격 스토어도 제거
      bulkRemoveRef.current(removed);
    }
    prevTickersRef.current = cur;
  }, [tickersKey, tickers]);

  // 반환 없음 (사이드이펙트 훅)
}
