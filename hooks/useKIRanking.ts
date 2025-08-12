import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from 'stores/auth';
import {
  getPriceFluct,
  getVolumeSurge,
  getVolumePower,
  getUpdownRate,
  getNewHighLow,
  getTradeVol,
  getTradePbmn,
  getTradeGrowth,
  getTradeTurnover,
  getMarketCap,
  type RankingResponse,
} from '../lib/kiApi';

function toArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v == null) return [] as T[];
  return [v as T];
}

function mergeOutputs(res?: RankingResponse) {
  if (!res) return [] as any[];
  // Most KI ranking APIs return the list in output2, with output1 being summary/header.
  // Prefer output2 when present; fall back to output/output1 only if needed.
  const { output2, output, output1 } = res as any;
  let rows: any[] = [];
  if (Array.isArray(output2)) rows = output2;
  else if (Array.isArray(output)) rows = output;
  else if (Array.isArray(output1)) rows = output1;
  else if (output2 != null) rows = toArray(output2);
  else if (output != null) rows = toArray(output);
  else if (output1 != null) rows = toArray(output1);

  if (__DEV__ && !Array.isArray(output2)) {
    console.log('[KI][mergeOutputs] output2 not array, using fallback', {
      keys: Object.keys(res || {}),
      types: {
        output2: typeof output2,
        output: typeof output,
        output1: typeof output1,
      },
      length: Array.isArray(rows) ? rows.length : 0,
    });
  }
  return rows as any[];
}

function pickName(row: any): string {
  return (
    row?.name ||
    row?.knam ||
    row?.hts_kor_isnm ||
    row?.ovrs_item_name ||
    row?.rsym ||
    row?.symb ||
    row?.symbol ||
    ''
  );
}

function pickSymbol(row: any): string {
  return (
    row?.symb ||
    row?.rsym ||
    row?.ovrs_item_cd ||
    row?.ovrs_prod_cd ||
    row?.symbol ||
    row?.tckr ||
    row?.ticker ||
    ''
  );
}

function pickPrice(row: any): string {
  const v = row?.last || row?.stck_prpr || row?.price || row?.ovrs_prpr || row?.prpr;
  return v != null ? String(v) : '';
}

function pickChangeRate(row: any): { text: string; positive: boolean } {
  const v = row?.rate ?? row?.chgrate ?? row?.updnrate ?? row?.ovrs_updn_rate;
  if (v == null) return { text: '', positive: false };
  const num = typeof v === 'string' ? parseFloat(v) : Number(v);
  return { text: `${num}%`, positive: num >= 0 };
}

export type NormalizedRow = {
  ticker: string;
  name: string;
  price: string;
  changeText: string;
  changePositive: boolean;
  raw: any;
};

function normalizeRows(rows: any[]): NormalizedRow[] {
  const arr = toArray(rows);
  const mapped = arr.map((r) => {
    const { text, positive } = pickChangeRate(r);
    return {
      ticker: pickSymbol(r),
      name: `${pickSymbol(r)} (${pickName(r)})`,
      price: pickPrice(r),
      changeText: text,
      changePositive: positive,
      raw: r,
    };
  });
  if (__DEV__) {
    console.log('[KI][normalizeRows] len', mapped.length);
  }
  return mapped;
}

const ONE_MIN = 60_000;

export function usePriceFluctRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'price-fluct', env],
    queryFn: async () =>
      getPriceFluct({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        GUBN: '1', // 급등
        MIXN: '0', // 1분전 기준
        VOL_RANG: '0', // 전체
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

export function useVolumeSurgeRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'volume-surge', env],
    queryFn: async () =>
      getVolumeSurge({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

export function useVolumePowerRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'volume-power', env],
    queryFn: async () =>
      getVolumePower({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        NDAY: '0',
        VOL_RANG: '0',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

// 상승/하락률 순위
export function useUpRateRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'updown-rate', 'up', env],
    queryFn: async () =>
      getUpdownRate({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        NDAY: '0',
        GUBN: '1', // 상승
        VOL_RANG: '0',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

export function useDownRateRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'updown-rate', 'down', env],
    queryFn: async () =>
      getUpdownRate({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        NDAY: '0',
        GUBN: '0', // 하락
        VOL_RANG: '0',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

// 신고/신저가 (gubn: 1 신고, 0 신저; gubn2: 1 돌파유지, 0 일시돌파)
export function useNewHighRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'new-highlow', 'high', env],
    queryFn: async () =>
      getNewHighLow({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        MIXN: '0',
        VOL_RANG: '0',
        GUBN: '1',
        GUBN2: '1',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

export function useNewLowRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'new-highlow', 'low', env],
    queryFn: async () =>
      getNewHighLow({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        MIXN: '0',
        VOL_RANG: '0',
        GUBN: '0',
        GUBN2: '1',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

// 거래량 순위
export function useTradeVolRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'trade-vol', env],
    queryFn: async () =>
      getTradeVol({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        NDAY: '0',
        VOL_RANG: '0',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

// 거래대금 순위
export function useTradePbmnRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'trade-pbmn', env],
    queryFn: async () =>
      getTradePbmn({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        NDAY: '0',
        VOL_RANG: '0',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

// 거래 증가율 순위
export function useTradeGrowthRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'trade-growth', env],
    queryFn: async () =>
      getTradeGrowth({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        NDAY: '0',
        VOL_RANG: '0',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

// 거래 회전율 순위
export function useTradeTurnoverRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'trade-turnover', env],
    queryFn: async () =>
      getTradeTurnover({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        NDAY: '0',
        VOL_RANG: '0',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}

// 시가총액 순위
export function useMarketCapRanking() {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'ranking', 'market-cap', env],
    queryFn: async () =>
      getMarketCap({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: 'NAS',
        VOL_RANG: '0',
      }),
    enabled: Boolean(tokens.accessToken && appKey && secretKey),
    refetchInterval: ONE_MIN,
    select: (res) => normalizeRows(mergeOutputs(res)),
  });
}
