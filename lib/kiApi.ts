import type { Env } from '../stores/auth';

const HOSTS = {
  real: 'https://openapi.koreainvestment.com:9443',
  demo: 'https://openapi.koreainvestment.com:9443',
} as const;

const json = (body: unknown) => JSON.stringify(body);

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const started = Date.now();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const dur = Date.now() - started;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (__DEV__) {
      console.log('[KI][HTTP][ERROR]', {
        url,
        status: res.status,
        statusText: res.statusText,
        durMs: dur,
        body: text.slice(0, 500),
      });
    }
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  const jsonBody = (await res.json()) as T;
  if (__DEV__) {
    console.log('[KI][HTTP][OK]', { url, status: res.status, durMs: dur });
  }
  return jsonBody;
}

export type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number; // seconds
};

export type ApprovalResponse = {
  approval_key: string;
};

export async function issueAccessToken(opts: {
  env: Env;
  appkey: string;
  appsecret: string;
}): Promise<TokenResponse> {
  console.log('opts.env', opts.env);
  const base = HOSTS[opts.env];
  console.log('base', base);
  return await http<TokenResponse>(`${base}/oauth2/tokenP`, {
    method: 'POST',
    body: json({
      grant_type: 'client_credentials',
      appkey: opts.appkey,
      appsecret: opts.appsecret,
    }),
  });
}

export async function issueApprovalKey(opts: {
  env: Env;
  appkey: string;
  secretkey: string;
}): Promise<ApprovalResponse> {
  const base = HOSTS[opts.env];
  return await http<ApprovalResponse>(`${base}/oauth2/Approval`, {
    method: 'POST',
    body: json({
      grant_type: 'client_credentials',
      appkey: opts.appkey,
      secretkey: opts.secretkey,
    }),
  });
}

// ===== Overseas ranking endpoints =====

type CommonHeader = {
  env: Env;
  appkey: string;
  appsecret: string;
  accessToken: string;
  trId: string; // e.g., HHDFS76260000
  custtype?: 'P' | 'B';
};

function buildHeaders(h: CommonHeader): Record<string, string> {
  return {
    'content-type': 'application/json; charset=utf-8',
    authorization: `Bearer ${h.accessToken}`,
    appkey: h.appkey,
    appsecret: h.appsecret,
    tr_id: h.trId,
    custtype: h.custtype ?? 'P',
  };
}

function mask(v?: string | null) {
  if (!v) return v || '';
  if (v.length <= 8) return v[0] + '***';
  return v.slice(0, 4) + '***' + v.slice(-3);
}

function maskHeaders(h: Record<string, string>): Record<string, string> {
  const clone: Record<string, string> = { ...h };
  if (clone.authorization)
    clone.authorization = 'Bearer ' + mask(clone.authorization.replace(/^Bearer\s+/i, ''));
  if (clone.appkey) clone.appkey = mask(clone.appkey);
  if (clone.appsecret) clone.appsecret = mask(clone.appsecret);
  return clone;
}

function truncateObj(obj: any, maxLen = 1500) {
  try {
    const s = JSON.stringify(obj);
    if (s.length <= maxLen) return obj;
    return JSON.parse(s.slice(0, maxLen));
  } catch {
    return obj;
  }
}

// YYYYMMDD 포맷 유틸 (기간손익 기본 endDate 계산용)
function fmtYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) usp.append(k, String(v));
  });
  return usp.toString();
}

export type RankingItem = Record<string, any>;
export type RankingResponse = {
  output?: RankingItem[];
  output1?: RankingItem[];
  output2?: RankingItem[];
  [k: string]: any;
};

export async function getOverseasRanking(opts: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  trId: string;
  path: string; // "/uapi/overseas-stock/v1/ranking/..."
  query: Record<string, string | number | undefined>;
}): Promise<RankingResponse> {
  const base = HOSTS[opts.env];
  const headers = buildHeaders({
    env: opts.env,
    appkey: opts.appkey,
    appsecret: opts.appsecret,
    accessToken: opts.accessToken,
    trId: opts.trId,
  });
  // Common required placeholders KEYB/AUTH are documented as blank for ranking APIs
  const q = toQuery({ KEYB: '', AUTH: '', ...opts.query });
  const url = `${base}${opts.path}?${q}`;
  if (__DEV__) {
    // Avoid logging secrets
    console.log('[KI][GET]', {
      env: opts.env,
      trId: opts.trId,
      path: opts.path,
      query: opts.query,
      url,
    });
  }
  const res = await http<RankingResponse>(url, { method: 'GET', headers });
  if (__DEV__) {
    console.log('[KI][RES]', {
      trId: opts.trId,
      headers: maskHeaders(headers),
      keys: Object.keys(res || {}),
      sample: truncateObj(
        (res as any)?.output2?.[0] || (res as any)?.output?.[0] || (res as any)?.output1?.[0]
      ),
      outputTypes: {
        output: Array.isArray((res as any)?.output) ? 'array' : typeof (res as any)?.output,
        output1: Array.isArray((res as any)?.output1) ? 'array' : typeof (res as any)?.output1,
        output2: Array.isArray((res as any)?.output2) ? 'array' : typeof (res as any)?.output2,
      },
    });
  }
  return res;
}

// Concrete helpers with sensible defaults (NASDAQ, 개인)
export async function getPriceFluct(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string; // 거래소 코드
  GUBN?: '0' | '1'; // 0 급락, 1 급등
  MIXN?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: 'HHDFS76260000',
    path: '/uapi/overseas-stock/v1/ranking/price-fluct',
    query: {
      EXCD: params.EXCD ?? 'NAS',
      GUBN: params.GUBN ?? '1',
      MIXN: params.MIXN ?? '0',
      VOL_RANG: params.VOL_RANG ?? '0',
    },
  });
}

export async function getVolumeSurge(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: 'HHDFS76270000',
    path: '/uapi/overseas-stock/v1/ranking/volume-surge',
    query: { EXCD: params.EXCD ?? 'NAS' },
  });
}

export async function getVolumePower(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
  NDAY?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: 'HHDFS76280000',
    path: '/uapi/overseas-stock/v1/ranking/volume-power',
    query: {
      EXCD: params.EXCD ?? 'NAS',
      NDAY: params.NDAY ?? '0',
      VOL_RANG: params.VOL_RANG ?? '0',
    },
  });
}

// Remaining endpoints helpers
export async function getUpdownRate(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
  NDAY?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  GUBN?: '0' | '1'; // 0 하락, 1 상승
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: RANKING_ENDPOINTS['updown-rate'].trId,
    path: RANKING_ENDPOINTS['updown-rate'].path,
    query: {
      EXCD: params.EXCD ?? 'NAS',
      NDAY: params.NDAY ?? '0',
      GUBN: params.GUBN ?? '1',
      VOL_RANG: params.VOL_RANG ?? '0',
    },
  });
}

export async function getNewHighLow(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
  MIXN?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
  GUBN?: '0' | '1'; // 0 신저, 1 신고
  GUBN2?: '0' | '1'; // 0 일시돌파, 1 돌파유지
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: RANKING_ENDPOINTS['new-highlow'].trId,
    path: RANKING_ENDPOINTS['new-highlow'].path,
    query: {
      EXCD: params.EXCD ?? 'NAS',
      MIXN: params.MIXN ?? '0',
      VOL_RANG: params.VOL_RANG ?? '0',
      GUBN: params.GUBN ?? '1',
      GUBN2: params.GUBN2 ?? '1',
    },
  });
}

export async function getTradeVol(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
  NDAY?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: RANKING_ENDPOINTS['trade-vol'].trId,
    path: RANKING_ENDPOINTS['trade-vol'].path,
    query: {
      EXCD: params.EXCD ?? 'NAS',
      NDAY: params.NDAY ?? '0',
      VOL_RANG: params.VOL_RANG ?? '0',
    },
  });
}

export async function getTradePbmn(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
  NDAY?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
  PRC1?: string;
  PRC2?: string;
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: RANKING_ENDPOINTS['trade-pbmn'].trId,
    path: RANKING_ENDPOINTS['trade-pbmn'].path,
    query: {
      EXCD: params.EXCD ?? 'NAS',
      NDAY: params.NDAY ?? '0',
      VOL_RANG: params.VOL_RANG ?? '0',
      PRC1: params.PRC1,
      PRC2: params.PRC2,
    },
  });
}

export async function getTradeGrowth(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
  NDAY?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: RANKING_ENDPOINTS['trade-growth'].trId,
    path: RANKING_ENDPOINTS['trade-growth'].path,
    query: {
      EXCD: params.EXCD ?? 'NAS',
      NDAY: params.NDAY ?? '0',
      VOL_RANG: params.VOL_RANG ?? '0',
    },
  });
}

export async function getTradeTurnover(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
  NDAY?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: RANKING_ENDPOINTS['trade-turnover'].trId,
    path: RANKING_ENDPOINTS['trade-turnover'].path,
    query: {
      EXCD: params.EXCD ?? 'NAS',
      NDAY: params.NDAY ?? '0',
      VOL_RANG: params.VOL_RANG ?? '0',
    },
  });
}

export async function getMarketCap(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD?: string;
  VOL_RANG?: '0' | '1' | '2' | '3' | '4' | '5' | '6';
}) {
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: RANKING_ENDPOINTS['market-cap'].trId,
    path: RANKING_ENDPOINTS['market-cap'].path,
    query: {
      EXCD: params.EXCD ?? 'NAS',
      VOL_RANG: params.VOL_RANG ?? '0',
    },
  });
}

// ===== Daily price (기간별 시세) =====
// Spec (사용자 제공): tr_id HHDFS76240000, AUTH '', EXCD, SYMB, GUBN '0', BYMD '', MODP '0'
export type DailyPriceRow = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  [k: string]: any;
};

export type DailyPriceResponse = {
  output1?: any;
  output2?: any[];
  output?: any[];
  rt_cd?: string;
  msg_cd?: string;
  msg1?: string;
  [k: string]: any;
};

export async function getDailyPrices(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  EXCD: string;
  SYMB: string;
  GUBN?: string;
  BYMD?: string;
  MODP?: string;
  count?: number;
}): Promise<DailyPriceRow[]> {
  const base = HOSTS[params.env];
  const trId = 'HHDFS76240000';
  const headers = buildHeaders({
    env: params.env,
    appkey: params.appkey,
    appsecret: params.appsecret,
    accessToken: params.accessToken,
    trId,
  });
  const q = toQuery({
    AUTH: '',
    EXCD: params.EXCD,
    SYMB: params.SYMB,
    GUBN: params.GUBN ?? '0',
    BYMD: params.BYMD ?? '',
    MODP: params.MODP ?? '0',
  });
  const url = `${base}/uapi/overseas-price/v1/quotations/dailyprice?${q}`;
  if (__DEV__)
    console.log('[KI][GET][dailyprice]', { url, q, trId, headers: maskHeaders(headers) });
  let res: DailyPriceResponse;
  try {
    res = await http<DailyPriceResponse>(url, { method: 'GET', headers });
  } catch (e: any) {
    if (__DEV__) console.log('[KI][ERR][dailyprice][http]', e?.message || e);
    throw e;
  }
  const rawRows = (res as any)?.output2 || (res as any)?.output || [];
  const rowCount = Array.isArray(rawRows) ? rawRows.length : 0;
  if (__DEV__) {
    console.log('[KI][RES][dailyprice]', {
      trId,
      rowCount,
      rt_cd: res?.rt_cd,
      msg_cd: res?.msg_cd,
      msg1: res?.msg1,
      keys: Object.keys(res || {}),
      sample: truncateObj(rawRows?.[0] || res),
    });
    if (!rowCount) {
      console.log('[KI][RES][dailyprice][empty-debug]', {
        headers: maskHeaders(headers),
        q,
        hasOutput1: !!res?.output1,
        hasOutput2: !!res?.output2,
        raw: truncateObj(res),
      });
    }
  }
  const mapped: DailyPriceRow[] = (Array.isArray(rawRows) ? rawRows : []).map((r: any) => ({
  // 한국투자 해외 일봉 응답 필드 (샘플): xymd, open, high, low, clos, tvol, tamt, diff, rate, sign
  date: r?.xymd || '',
  open: parseFloat(r?.open) || 0,
  high: parseFloat(r?.high) || 0,
  low: parseFloat(r?.low) || 0,
  close: parseFloat(r?.clos) || 0,
  volume: parseFloat(r?.tvol) || 0,
  raw: r,
  }));
  mapped.sort((a, b) => a.date.localeCompare(b.date));
  return params.count ? mapped.slice(-params.count) : mapped;
}
// Generic mapping to allow adding more endpoints later when TR IDs are confirmed
export const RANKING_ENDPOINTS = {
  'updown-rate': {
    path: '/uapi/overseas-stock/v1/ranking/updown-rate',
    trId: 'HHDFS76290000',
  },
  'new-highlow': {
    path: '/uapi/overseas-stock/v1/ranking/new-highlow',
    trId: 'HHDFS76300000',
  },
  'trade-vol': {
    path: '/uapi/overseas-stock/v1/ranking/trade-vol',
    trId: 'HHDFS76310010',
  },
  'trade-pbmn': {
    path: '/uapi/overseas-stock/v1/ranking/trade-pbmn',
    trId: 'HHDFS76320010',
  },
  'trade-growth': {
    path: '/uapi/overseas-stock/v1/ranking/trade-growth',
    trId: 'HHDFS76330000',
  },
  'trade-turnover': {
    path: '/uapi/overseas-stock/v1/ranking/trade-turnover',
    trId: 'HHDFS76340000',
  },
  'market-cap': {
    path: '/uapi/overseas-stock/v1/ranking/market-cap',
    trId: 'HHDFS76350100',
  },
} as const;

export async function getGenericRanking(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  kind: keyof typeof RANKING_ENDPOINTS;
  EXCD?: string;
  extraQuery?: Record<string, string | number | undefined>;
}) {
  const cfg = RANKING_ENDPOINTS[params.kind];
  if (!cfg.trId) {
    throw new Error(`TR ID for ${params.kind} is not set. Please update lib/kiApi.ts`);
  }
  return getOverseasRanking({
    env: params.env,
    accessToken: params.accessToken,
    appkey: params.appkey,
    appsecret: params.appsecret,
    trId: cfg.trId,
    path: cfg.path,
    query: { EXCD: params.EXCD ?? 'NAS', ...(params.extraQuery || {}) },
  });
}

// ===== Overseas trading inquiries (잔고 / 기간손익 등) =====

export type OverseasBalanceResponse = {
  output1?: any; // 요약(총 평가손익 등) - 문서 상 output1, output2 혼합 형태 대비
  output2?: any[]; // 종목별 잔고 리스트
  [k: string]: any;
};

export type OverseasPeriodProfitResponse = {
  output1?: any; // 요약(누적 손익 등)
  output2?: any[]; // 일자별 / 종목별 손익 리스트 (문서 구조에 따라 상이)
  [k: string]: any;
};

function mergeTradingOutputs(res: { output1?: any; output2?: any }): { summary: any; rows: any[] } {
  if (!res) return { summary: null, rows: [] };
  const summary = res.output1 ?? (Array.isArray(res.output2) ? null : undefined);
  let rows: any[] = [];
  if (Array.isArray(res.output2)) rows = res.output2;
  else if (Array.isArray(res.output1))
    rows = res.output1; // 혹시 반대로 오는 경우 방어
  else if (res.output2 != null) rows = [res.output2];
  else if (res.output1 != null && Array.isArray(res.output1) === false) rows = [res.output1];
  return { summary, rows };
}

/** 파라미터로 전달된 계좌 문자열에서 CANO(8자리) / ACNT_PRDT_CD(2자리) 분리.
 * 예) 12345678-01 또는 1234567801 형태 모두 지원 (단순 추정 구현)
 */
export function splitAccountParts(account: string): { cano: string; acntPrdtCd: string } {
  if (!account) return { cano: '', acntPrdtCd: '' };
  const cleaned = account.replace(/[^0-9]/g, '');
  const cano = cleaned.slice(0, 8);
  const acntPrdtCd = cleaned.slice(8, 10) || '01';
  return { cano, acntPrdtCd };
}

// NOTE: 실제 TR ID 는 최신 문서 확인 필요. 아래 값들은 placeholder 로 남기며, 사용자 제공 시 교체하십시오.
export const TRADING_TR_IDS = {
  balance: 'PLACEHOLDER_TR_ID_BALANCE', // e.g., HHDFS76200200 (확인 필요)
  periodProfit: 'PLACEHOLDER_TR_ID_PERIOD_PROFIT',
  executions: 'PLACEHOLDER_TR_ID_EXECUTIONS',
} as const;

// 해외잔고 조회 기본 쿼리 파라미터 (문서 기준 필수 + 권장). 실제 필요 항목은 최신 문서를 확인하십시오.
// - OVRS_EXCG_CD: 해외거래소 (예: NASD, NYSE, AMEX 등) 공란 시 전체 (계좌권한 따라 상이)
// - TR_CRCY_CD: 거래통화 (USD 등)
// - AFHR_FLPR_YN: 시간외포함 여부 (N 기본)
// - FUND_STTL_ICLD_YN: 펀드결제분포함 여부 (Y 권장)
// - FNCG_AMT_AUTO_RDPT_YN: 융자금액자동상환 여부 (N 기본)
// - PRCS_DVSN_CD: 처리구분 (00 기본)
// - CTX_AREA_FK200 / CTX_AREA_NK200: 페이징 커서 (첫 조회는 공란)
export async function getOverseasBalance(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  cano: string; // 계좌번호 8자리
  acntPrdtCd: string; // 상품 코드 2자리 (일반 01)
  trId?: string; // override 가능
  extraQuery?: Partial<Record<string, string | undefined>>; // OVRS_EXCG_CD, CTX_AREA_FK200 등 override
}): Promise<OverseasBalanceResponse & { _merged?: { summary: any; rows: any[] } }> {
  const base = HOSTS[params.env];
  // 실전: TTTS3012R / 모의: VTTS3012R (문서 기준 잔고 조회 TR)
  const trId = params.trId || 'TTTS3012R';
  const headers = buildHeaders({
    env: params.env,
    appkey: params.appkey,
    appsecret: params.appsecret,
    accessToken: params.accessToken,
    trId,
  });
  // 필수(Y) 파라미터만 구성: CANO, ACNT_PRDT_CD, OVRS_EXCG_CD, TR_CRCY_CD, CTX_AREA_FK200, CTX_AREA_NK200
  // 실전 env: 나스닥 단일코드 NAS (미국전체), 모의 env: 나스닥 NASD (문서 표기)
  const defaultExchange = 'NAS';
  const defaultQuery: Record<string, string | undefined> = {
    CANO: params.cano,
    ACNT_PRDT_CD: params.acntPrdtCd,
    OVRS_EXCG_CD: defaultExchange,
    TR_CRCY_CD: 'USD',
    CTX_AREA_FK200: '',
    CTX_AREA_NK200: '',
  };
  // extraQuery 에 undefined 가 들어오면 기본값을 덮어써 빠지는 문제가 있어 필터링
  const extraFiltered: Record<string, string> = {};
  if (params.extraQuery) {
    Object.entries(params.extraQuery).forEach(([k, v]) => {
      if (v !== undefined) extraFiltered[k] = String(v);
    });
  }
  const mergedQuery = { ...defaultQuery, ...extraFiltered } as Record<string, string | undefined>;
  const q = toQuery(mergedQuery);
  const url = `${base}/uapi/overseas-stock/v1/trading/inquire-balance?${q}`;
  if (__DEV__) console.log('[KI][GET][balance]', { url, mergedQuery });
  const res = await http<OverseasBalanceResponse>(url, { method: 'GET', headers });
  if (__DEV__) {
    const rowCount = Array.isArray((res as any)?.output2) ? (res as any).output2.length : 0;
    const msg = {
      headers: maskHeaders(headers),
      query: mergedQuery,
      keys: Object.keys(res || {}),
      summaryKeys: Object.keys((res as any)?.output1 || {}),
      rowCount,
      rt_cd: (res as any)?.rt_cd,
      msg_cd: (res as any)?.msg_cd,
      msg1: (res as any)?.msg1,
      sample: truncateObj((res as any)?.output2?.[0] || (res as any)?.output1),
    };
    // output1/output2 가 전혀 없고 에러코드 형태라면 전체 응답을 더 짧게 덤프
    if (!rowCount && !(res as any)?.output1 && !(res as any)?.output2) {
      (msg as any).raw = truncateObj(res);
    }
    console.log('[KI][RES][balance]', msg);
  }
  const merged = mergeTradingOutputs(res);
  return { ...res, _merged: merged };
}

// 기간손익 조회 기본 파라미터 예시 (필드명은 해외/국내/계좌유형에 따라 다를 수 있음)
// - START_DT / END_DT (또는 INQR_STRT_DT / INQR_END_DT): 조회기간
// - OVRS_EXCG_CD: 해외거래소 (전체 조회 시 공란 허용 여부 문서 확인)
// - TR_CRCY_CD: 기준 통화 (USD)
// - INQR_DVSN_CD: 조회구분 (00: 기본) / SLL_BUY_DVSN_CD: 매매구분 전체 00 등
// - CTX_AREA_FK200 / CTX_AREA_NK200: 페이징 커서
export async function getOverseasPeriodProfit(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  cano: string;
  acntPrdtCd: string;
  startDate?: string; // 기본 20250301
  endDate?: string; // 기본 오늘
  pageLimit?: number; // 연속조회 최대 페이지 수 (기본 20)
}): Promise<OverseasPeriodProfitResponse & { _merged?: { summary: any; rows: any[] } }> {
  const base = HOSTS[params.env];
  const trId = 'TTTS3039R'; // 명시된 고정 TR ID
  const headers = buildHeaders({
    env: params.env,
    appkey: params.appkey,
    appsecret: params.appsecret,
    accessToken: params.accessToken,
    trId,
  });
  const start = params.startDate || '20250301';
  const end = params.endDate || fmtYmd(new Date());
  const pageLimit = params.pageLimit ?? 20;
  let cursorFk = '';
  let cursorNk = '';
  let page = 0;
  const all: any[] = [];
  let summary: any = null;
  let lastRes: any = null;
  while (true) {
    const q = toQuery({
      CANO: params.cano,
      ACNT_PRDT_CD: params.acntPrdtCd,
      OVRS_EXCG_CD: 'NASD',
      NATN_CD: '',
      CRCY_CD: 'USD',
      PDNO: '',
      INQR_STRT_DT: start,
      INQR_END_DT: end,
      WCRC_FRCR_DVSN_CD: '02',
      CTX_AREA_FK200: cursorFk,
      CTX_AREA_NK200: cursorNk,
    });
    const url = `${base}/uapi/overseas-stock/v1/trading/inquire-period-profit?${q}`;
    if (__DEV__) console.log('[KI][GET][period-profit]', { page, url, cursorFk, cursorNk });
    const res = await http<any>(url, { method: 'GET', headers });
    lastRes = res;
    const rt = (res as any)?.rt_cd;
    if (rt && rt !== '0') {
      if (__DEV__)
        console.log('[KI][ERR][period-profit]', {
          page,
          rt_cd: rt,
          msg_cd: (res as any)?.msg_cd,
          msg1: (res as any)?.msg1,
        });
      break; // 에러 시 중단 (원본 응답 그대로 반환)
    }
    if (!summary && (res as any)?.output1 && !Array.isArray((res as any).output1))
      summary = (res as any).output1;
    const rows = Array.isArray((res as any)?.output2)
      ? (res as any).output2
      : Array.isArray((res as any)?.output1)
        ? (res as any).output1
        : [];
    all.push(...rows);
    if (__DEV__)
      console.log('[KI][RES][period-profit][page]', {
        page,
        added: rows.length,
        total: all.length,
      });
    const nextFk = (res as any)?.ctx_area_fk200 || (res as any)?.CTX_AREA_FK200;
    const nextNk = (res as any)?.ctx_area_nk200 || (res as any)?.CTX_AREA_NK200;
    if (!nextFk || !nextNk) break;
    if (nextFk === cursorFk && nextNk === cursorNk) break;
    cursorFk = nextFk;
    cursorNk = nextNk;
    page += 1;
    if (page >= pageLimit) break;
  }
  const merged = { summary, rows: all };
  return { ...(lastRes || {}), _merged: merged, output1: summary, output2: all };
}

export type MergedTradingData = { summary: any; rows: any[] };

export async function getOverseasExecutions(params: {
  env: Env;
  accessToken: string;
  appkey: string;
  appsecret: string;
  cano: string;
  acntPrdtCd: string;
  startDate?: string; // 선택적 기간 필터 (문서 확인 필요)
  endDate?: string;
  trId?: string;
  extraQuery?: Partial<Record<string, string | undefined>>;
}): Promise<{ output1?: any; output2?: any[]; _merged?: { summary: any; rows: any[] } }> {
  const base = HOSTS[params.env];
  const trId = params.trId || TRADING_TR_IDS.executions;
  const headers = buildHeaders({
    env: params.env,
    appkey: params.appkey,
    appsecret: params.appsecret,
    accessToken: params.accessToken,
    trId,
  });
  const defaultQuery = {
    CANO: params.cano,
    ACNT_PRDT_CD: params.acntPrdtCd,
    START_DT: params.startDate,
    END_DT: params.endDate,
    OVRS_EXCG_CD: 'NASD',
    TR_CRCY_CD: 'USD',
    SLL_BUY_DVSN_CD: '00',
    INQR_DVSN_CD: '00',
    CTX_AREA_FK200: '',
    CTX_AREA_NK200: '',
  } as Record<string, string | undefined>;
  const q = toQuery({ ...defaultQuery, ...(params.extraQuery || {}) });
  // NOTE: 경로는 문서 확인 필요. 임시로 inquire-executions 사용.
  const url = `${base}/uapi/overseas-stock/v1/trading/inquire-executions?${q}`;
  if (__DEV__) console.log('[KI][GET][executions]', { url, q });
  const res = await http<any>(url, { method: 'GET', headers });
  if (__DEV__) {
    console.log('[KI][RES][executions]', {
      headers: maskHeaders(headers),
      keys: Object.keys(res || {}),
      summaryKeys: Object.keys((res as any)?.output1 || {}),
      rowCount: Array.isArray((res as any)?.output2) ? (res as any).output2.length : 0,
      sample: truncateObj((res as any)?.output2?.[0] || (res as any)?.output1),
    });
  }
  const merged = mergeTradingOutputs(res);
  return { ...res, _merged: merged };
}
