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
