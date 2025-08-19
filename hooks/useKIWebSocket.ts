import { useAuthStore } from '../stores/auth';
import { useShallow } from 'zustand/react/shallow';

export function useKIWebSocket() {
  const { tokens } = useAuthStore(useShallow((s: any) => ({ tokens: s.tokens })));

  const getConnectionInfo = () => {
    const url = 'wss://openapi.koreainvestment.com/websocket'; // 실전 전용
    const approvalKey = tokens.approvalKey;
    return { url, approvalKey };
  };

  return { getConnectionInfo };
}
