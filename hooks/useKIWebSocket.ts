import { useAuthStore } from '../stores/auth';
import { useShallow } from 'zustand/react/shallow';

export function useKIWebSocket() {
  const { env, tokens } = useAuthStore(
    useShallow((s: any) => ({ env: s.env, tokens: s.tokens })),
  );

  const getConnectionInfo = () => {
    const url =
      env === 'real'
        ? 'wss://openapi.koreainvestment.com/websocket' // 예시, 문서 확인 필요
        : 'wss://openapivts.koreainvestment.com/websocket'; // 예시, 문서 확인 필요
    const approvalKey = tokens.approvalKey;
    return { url, approvalKey };
  };

  return { getConnectionInfo };
}
