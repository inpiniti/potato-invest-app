// 단순화 + 기존 컴포넌트 호환 (useBoosterPriceStore 재도입)
import { useBoosterStore } from '../stores/booster';
import { useAuthStore } from '../stores/auth';
import { useState, useEffect, useRef } from 'react';
import { create } from 'zustand';

const FIELD_KEYS = [
  'RSYM',
  'SYMB',
  'ZDIV',
  'TYMD',
  'XYMD',
  'XHMS',
  'KYMD',
  'KHMS',
  'OPEN',
  'HIGH',
  'LOW',
  'LAST',
  'SIGN',
  'DIFF',
  'RATE',
  'PBID',
  'PASK',
  'VBID',
  'VASK',
  'EVOL',
  'TVOL',
  'TAMT',
  'BIVL',
  'ASVL',
  'STRN',
  'MTYP',
];

export type BoosterTick = {
  last: number;
  rate: number;
  updatedAt: number;
  prevLast?: number;
  raw?: Record<string, string>;
};

type BoosterPriceState = {
  prices: Record<string, BoosterTick>;
  update: (ticker: string, last: number, rate: number, raw: Record<string, string>) => void;
  clear: () => void;
};

export const useBoosterPriceStore = create<BoosterPriceState>((set) => ({
  prices: {},
  update: (ticker, last, rate, raw) =>
    set((s) => {
      const cur = s.prices[ticker];
      if (cur && cur.last === last && cur.rate === rate) return s;
      return {
        prices: {
          ...s.prices,
          [ticker]: {
            last,
            rate,
            updatedAt: Date.now(),
            prevLast: cur ? (cur.last !== last ? cur.last : cur.prevLast) : undefined,
            raw,
          },
        },
      };
    }),
  clear: () => set({ prices: {} }),
}));

export type RealTimeRecord = Record<string, Record<string, string>>;

function extractTicker(sym: string) {
  return sym?.startsWith('DNAS') ? sym.slice(4) : sym;
}

// 사용: const { data } = useBoosterPrices();  (symbols 미전달 시 booster store items 기준)
export function useBoosterPrices(symbols?: string[]) {
  const [data, setData] = useState<RealTimeRecord>({});
  const socketRef = useRef<WebSocket | null>(null);
  const prevSymbolsRef = useRef<string[]>([]);
  const { tokens } = useAuthStore();
  const approvalKey = tokens.approvalKey;
  const boosterItems = useBoosterStore((s) => s.items);
  const activeSymbols = symbols && symbols.length ? symbols : boosterItems.map((i) => i.ticker);
  const updateStore = useBoosterPriceStore((s) => s.update);

  // 최초 연결 (approvalKey 변하면 재연결)
  useEffect(() => {
    if (!approvalKey) return;
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket('ws://ops.koreainvestment.com:21000');
    } catch (e) {
      if (__DEV__) console.warn('[Booster][WS][create-fail]', e);
      return () => {};
    }
    socketRef.current = socket;
    if (__DEV__) console.log('[Booster][WS][connecting]');

    socket.onopen = () => {
      if (__DEV__) console.log('[Booster][WS][open]');
      if (!activeSymbols.length) return;
      activeSymbols.forEach((sym) => {
        const msg = {
          header: {
            approval_key: approvalKey,
            tr_type: '1',
            custtype: 'P',
            'content-type': 'utf-8',
          },
          body: { input: { tr_id: 'HDFSCNT0', tr_key: `DNAS${sym}` } },
        };
        try {
          socket!.send(JSON.stringify(msg));
          if (__DEV__) console.log('[Booster][SUB][init]', sym);
        } catch (e) {
          console.log('[Booster][WS][send-fail]', e);
        }
      });
      prevSymbolsRef.current = activeSymbols.slice();
    };

    socket.onmessage = (event) => {
      console.log('[Booster][WS][message]', event.data);
      const raw = event.data;
      if (typeof raw !== 'string' || !raw.includes('^')) return;
      const parts = raw.split('^');
      const parsed: Record<string, string> = {};
      FIELD_KEYS.forEach((k, i) => {
        parsed[k] = parts[i] || '';
      });
      const sym = parsed['SYMB'] || parsed['RSYM'];
      if (!sym) return;
      const ticker = extractTicker(sym);
      setData((prev: RealTimeRecord) => ({ ...prev, [ticker]: parsed }));
      const last = Number(parsed['LAST']) || 0;
      const rate = Number(parsed['RATE']) || 0;
      updateStore(ticker, last, rate, parsed);
    };

    socket.onerror = (err) => {
      if (__DEV__) console.warn('[Booster][WS][error]', err);
    };
    socket.onclose = () => {
      if (__DEV__) console.log('[Booster][WS][close]');
    };
    return () => {
      try {
        socket?.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvalKey]);

  // 심볼 diff 처리
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (!approvalKey) return;
    const prev = prevSymbolsRef.current;
    const added = activeSymbols.filter((s: string) => !prev.includes(s));
    const removed = prev.filter((s: string) => !activeSymbols.includes(s));
    if (!added.length && !removed.length) return;
    const send = (tr_key: string, tr_type: '1' | '2') => {
      const msg = {
        header: { approval_key: approvalKey, tr_type, custtype: 'P', 'content-type': 'utf-8' },
        body: { input: { tr_id: 'HDFSCNT0', tr_key } },
      };
      try {
        socket.send(JSON.stringify(msg));
      } catch {}
    };
    added.forEach((sym: string) => {
      send(`DNAS${sym}`, '1');
      if (__DEV__) console.log('[Booster][SUB][add]', sym);
    });
    removed.forEach((sym: string) => {
      send(`DNAS${sym}`, '2');
      if (__DEV__) console.log('[Booster][SUB][remove]', sym);
    });
    prevSymbolsRef.current = activeSymbols.slice();
  }, [activeSymbols, approvalKey]);

  return { data };
}

export default useBoosterPrices;
