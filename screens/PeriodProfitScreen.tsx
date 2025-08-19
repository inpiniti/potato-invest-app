import React from 'react';
import { Text, ScrollView } from 'react-native';
import { useOverseasPeriodProfit } from '../hooks/useKITrading';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';
import { Section } from '../components/ui/Section';

export default function PeriodProfitScreen() {
  const periodProfit = useOverseasPeriodProfit();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <Section
        title="기간손익 전체"
        loading={periodProfit.isPending}
        reloading={periodProfit.isFetching}
        onReload={() => periodProfit.refetch()}
        empty={!periodProfit.isPending && !periodProfit.error && (periodProfit.data?.rows?.length ?? 0) === 0}
      >
        {periodProfit.error && (
          <Text className="px-5 py-3 text-center text-destructive">{String(periodProfit.error)}</Text>
        )}
        {periodProfit.data?.rows?.map((row: any, idx: number) => (
          <CurrentPriceItem
            key={idx}
            rank={idx + 1}
            ticker={row?.ovrs_pdno}
            name={(row?.ovrs_pdno || '') + ' (' + (row?.ovrs_item_name || '') + ')'}
            price={`${Number(Number(row?.ovrs_rlzt_pfls_amt).toFixed(0)).toLocaleString()}원`}
            change={`${Number(row?.pftrt).toFixed(2)}%`}
            changePositive={Number(row?.pftrt) >= 0}
          />
        ))}
      </Section>
    </ScrollView>
  );
}
