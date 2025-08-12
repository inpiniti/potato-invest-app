import { issueAccessToken, issueApprovalKey } from '../lib/kiApi';
import { useAuthStore } from '../stores/auth';
import { useShallow } from 'zustand/react/shallow';

export function useKIAuth() {
  const { env, appKey, secretKey } = useAuthStore(
    useShallow((s: any) => ({ env: s.env, appKey: s.appKey, secretKey: s.secretKey }))
  );
  const setTokens = useAuthStore((s: any) => s.setTokens);

  const login = async () => {
    if (!appKey || !secretKey) throw new Error('App Key/Secret Key가 필요합니다.');
    const token = await issueAccessToken({ env, appkey: appKey, appsecret: secretKey });
    const now = Date.now();
    const expiresMs = (token.expires_in ?? 0) * 1000;
    const tokenExpiresAt = expiresMs ? now + expiresMs : null;

    setTokens({ accessToken: token.access_token, tokenExpiresAt });

    const approval = await issueApprovalKey({ env, appkey: appKey, secretkey: secretKey });
    setTokens({ approvalKey: approval.approval_key });

    return {
      ok: true as const,
      accessToken: token.access_token,
      tokenExpiresAt,
      approvalKey: approval.approval_key,
    };
  };

  return { login };
}
