import { useAuthStore } from '../stores/auth';
import { useShallow } from 'zustand/react/shallow';

// 한국투자 실시간 해외시세(HDFSCNT0) WebSocket 엔드포인트 후보
// 문서/환경별 경로 차이가 보고되어 여러 fallback 경로를 순차 시도
// 1) /tryitout/HDFSCNT0 (사용자 제시)
// 2) /tryitout (일부 환경에서 TR 은 메시지 body 로만 구분)
// 3) /HDFSCNT0 (직접 TR path)
// 필요 시 추후 사용자 정의 주입 가능하도록 확장 예정
const HDFSCNT0_WS_CANDIDATES = ['ws://ops.koreainvestment.com:21000'];

export function useKIWebSocket() {
  const { tokens } = useAuthStore(useShallow((s: any) => ({ tokens: s.tokens })));

  const getConnectionInfo = () => {
    const approvalKey = tokens.approvalKey;
    return { urls: HDFSCNT0_WS_CANDIDATES.slice(), approvalKey };
  };

  return { getConnectionInfo };
}
