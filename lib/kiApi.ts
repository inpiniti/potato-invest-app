import type { Env } from '../stores/auth';

const HOSTS = {
  real: 'https://openapi.koreainvestment.com:9443',
  demo: 'https://openapivts.koreainvestment.com:29443',
} as const;

const json = (body: unknown) => JSON.stringify(body);

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
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
  const base = HOSTS[opts.env];
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
      keys: Object.keys(res || {}),
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
