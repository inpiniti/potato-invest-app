import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from 'stores/auth';
import { getDailyPrices } from '../lib/kiApi';

export function useDailyPrices(ticker?: string, exchange: string = 'NAS') {
  const { env, appKey, secretKey, tokens } = useAuthStore();
  return useQuery({
    queryKey: ['ki', 'dailyprice', exchange, ticker, env],
    enabled: Boolean(tokens.accessToken && appKey && secretKey && ticker),
    queryFn: async () => {
      if (!ticker) return [] as any[];
      const primary = await getDailyPrices({
        env,
        accessToken: tokens.accessToken!,
        appkey: appKey,
        appsecret: secretKey,
        EXCD: exchange,
        SYMB: ticker,
        GUBN: '0',
        BYMD: '',
        MODP: '0',
        count: 90,
      });
      if (primary.length === 0 && exchange === 'NAS') {
        // 일부 엔드포인트는 NAS 대신 NASD 필요할 수 있어 fallback
        const fallback = await getDailyPrices({
          env,
          accessToken: tokens.accessToken!,
          appkey: appKey,
          appsecret: secretKey,
          EXCD: 'NASD',
          SYMB: ticker,
          GUBN: '0',
          BYMD: '',
          MODP: '0',
          count: 90,
        });
  // silent fallback
        return fallback;
      }
      return primary;
    },
  });
}
