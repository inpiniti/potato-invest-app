import React from 'react';
import { ScrollView, Text } from 'react-native';
import { Section } from '../components/ui/Section';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';
import {
  usePriceFluctRanking,
  useVolumeSurgeRanking,
  useVolumePowerRanking,
  useUpRateRanking,
  useDownRateRanking,
  useNewHighRanking,
  useNewLowRanking,
  useTradeVolRanking,
  useTradePbmnRanking,
  useTradeGrowthRanking,
  useTradeTurnoverRanking,
  useMarketCapRanking,
} from '../hooks/useKIRanking';

const hookMap: Record<string, () => any> = {
  'price-fluct': usePriceFluctRanking,
  'volume-surge': useVolumeSurgeRanking,
  'volume-power': useVolumePowerRanking,
  'up-rate': useUpRateRanking,
  'down-rate': useDownRateRanking,
  'new-high': useNewHighRanking,
  'new-low': useNewLowRanking,
  'trade-vol': useTradeVolRanking,
  'trade-pbmn': useTradePbmnRanking,
  'trade-growth': useTradeGrowthRanking,
  'trade-turnover': useTradeTurnoverRanking,
  'market-cap': useMarketCapRanking,
};

const titleMap: Record<string, string> = {
  'price-fluct': '가격 급등 상위',
  'volume-surge': '거래량 급증 상위',
  'volume-power': '매수 체결강도 상위',
  'up-rate': '상승률 상위',
  'down-rate': '하락률 상위',
  'new-high': '신고가',
  'new-low': '신저가',
  'trade-vol': '거래량 순위',
  'trade-pbmn': '거래대금 순위',
  'trade-growth': '거래 증가율 순위',
  'trade-turnover': '거래 회전율 순위',
  'market-cap': '시가총액 순위',
};

export default function RankingDetailScreen({ route }: any) {
  const kind = route?.params?.kind as string;
  const useHook = hookMap[kind] || usePriceFluctRanking;
  const dataQuery = useHook();
  const title = titleMap[kind] || '랭킹 전체';

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <Section
        title={title + ' 전체'}
        loading={dataQuery.isPending}
        reloading={dataQuery.isFetching}
        onReload={() => dataQuery.refetch()}
        empty={!dataQuery.isPending && !dataQuery.error && (dataQuery.data?.length ?? 0) === 0}
      >
        {dataQuery.error && (
          <Text className="px-5 py-3 text-center text-destructive">{String(dataQuery.error)}</Text>
        )}
        {dataQuery.data?.map((row: any, idx: number) => (
          <CurrentPriceItem
            key={idx}
            rank={idx + 1}
            ticker={row.ticker}
            name={row.name || '-'}
            price={row.price}
            change={row.changeText}
            changePositive={row.changePositive}
          />
        ))}
      </Section>
    </ScrollView>
  );
}
