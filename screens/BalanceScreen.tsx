import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useOverseasBalance } from '../hooks/useKITrading';
import { Section } from '../components/ui/Section';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';

// 해외 주식 잔고 전체 리스트 화면
export default function BalanceScreen() {
  const balance = useOverseasBalance();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <Section
        title="해외 잔고 전체"
        loading={balance.isPending}
        reloading={balance.isFetching}
        onReload={() => balance.refetch()}
        empty={!balance.isPending && !balance.error && (balance.data?.rows?.length ?? 0) === 0}
      >
        {balance.error && (
          <Text className="px-5 py-3 text-center text-destructive">{String(balance.error)}</Text>
        )}
  {balance.data?.rows?.map((row: any, idx: number) => {
          const evalAmt = Number(row?.evlu_amt ?? row?.ovrs_evlu_amt ?? 0);
          const pnl = Number(row?.evlu_pfls_amt ?? row?.ovrs_evlu_pfls_amt ?? 0);
          const pnlRate = Number(row?.evlu_pfls_rt ?? row?.pfls_rt ?? 0);
          return (
            <CurrentPriceItem
              key={idx}
              rank={idx + 1}
              ticker={row?.ovrs_pdno || row?.pdno}
              name={(row?.ovrs_pdno || row?.pdno || '') + ' (' + (row?.ovrs_item_name || row?.prdt_name || '') + ')'}
              price={`${evalAmt.toLocaleString()}원`}
              change={`${pnl >= 0 ? '+' : ''}${pnl.toLocaleString()} (${pnlRate.toFixed(2)}%)`}
              changePositive={pnl >= 0}
            />
          );
        })}
      </Section>
    </ScrollView>
  );
}
