import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from 'stores/auth';
import {
  getOverseasBalance,
  getOverseasPeriodProfit,
  getOverseasExecutions,
  splitAccountParts,
  type MergedTradingData,
} from '../lib/kiApi';

// 화면 포커스 시 수동 refetch, 간격 갱신 비활성화

function parseMerged(res: any): MergedTradingData {
  return res?._merged || { summary: null, rows: [] };
}

export function useOverseasBalance(options?: { exchange?: string; currency?: string; cursorFk?: string; cursorNk?: string; forceReal?: boolean }) {
  const { account, env: storedEnv, appKey, secretKey, tokens } = useAuthStore();
  const effectiveEnv = options?.forceReal ? 'real' : storedEnv;
  return useQuery({
    queryKey: ['ki', 'trading', 'balance', effectiveEnv, account, options?.exchange, options?.currency, options?.cursorFk, options?.cursorNk],
    queryFn: async () => {
      const { cano, acntPrdtCd } = splitAccountParts(account);
      return getOverseasBalance({
        env: effectiveEnv,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        cano,
        acntPrdtCd,
        extraQuery: {
          OVRS_EXCG_CD: options?.exchange, // 실전 NAS / 모의 NASD 등 호출부에서 직접 지정 가능
          TR_CRCY_CD: options?.currency,
          CTX_AREA_FK200: options?.cursorFk,
            CTX_AREA_NK200: options?.cursorNk,
        },
      });
    },
    enabled: Boolean(tokens.accessToken && appKey && secretKey && account),
  refetchInterval: false,
    select: parseMerged,
  });
}

export function useOverseasPeriodProfit(range?: { start: string; end: string; exchange?: string; currency?: string }) {
  const { account, env, appKey, secretKey, tokens } = useAuthStore();
  const { start, end } = range || defaultDateRange();
  return useQuery({
    queryKey: ['ki', 'trading', 'period-profit', env, account, start, end],
    queryFn: async () => {
      const { cano, acntPrdtCd } = splitAccountParts(account);
      return getOverseasPeriodProfit({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        cano,
        acntPrdtCd,
        startDate: start,
        endDate: end,
        extraQuery: {
          OVRS_EXCG_CD: range?.exchange,
          TR_CRCY_CD: range?.currency,
        },
      });
    },
    enabled: Boolean(tokens.accessToken && appKey && secretKey && account && start && end),
  refetchInterval: false,
    select: parseMerged,
  });
}

export function useOverseasExecutions(range?: { start?: string; end?: string; exchange?: string; currency?: string }) {
  const { account, env, appKey, secretKey, tokens } = useAuthStore();
  const start = range?.start;
  const end = range?.end;
  return useQuery({
    queryKey: ['ki', 'trading', 'executions', env, account, start, end],
    queryFn: async () => {
      const { cano, acntPrdtCd } = splitAccountParts(account);
      return getOverseasExecutions({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        cano,
        acntPrdtCd,
        startDate: start,
        endDate: end,
        extraQuery: {
          OVRS_EXCG_CD: range?.exchange,
          TR_CRCY_CD: range?.currency,
        },
      });
    },
    enabled: Boolean(tokens.accessToken && appKey && secretKey && account),
  refetchInterval: false,
    select: parseMerged,
  });
}

function defaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);
  return { start: fmtYmd(start), end: fmtYmd(end) };
}

function fmtYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}
