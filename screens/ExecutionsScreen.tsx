import React from 'react';
import { Text, ScrollView } from 'react-native';
import { useOverseasExecutions } from '../hooks/useKITrading';
import { Section } from '../components/ui/Section';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';

export default function ExecutionsScreen() {
  const executions = useOverseasExecutions();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <Section
        title="체결내역 전체"
        loading={executions.isPending}
        reloading={executions.isFetching}
        onReload={() => executions.refetch()}
        empty={!executions.isPending && !executions.error && (executions.data?.rows?.length ?? 0) === 0}
      >
        {executions.error && (
          <Text className="px-5 py-3 text-center text-destructive">{String(executions.error)}</Text>
        )}
        {executions.data?.rows?.map((row: any, idx: number) => (
          <CurrentPriceItem
            key={idx}
            rank={idx + 1}
            ticker={row?.symb || row?.rsym || row?.ovrs_item_cd}
            name={(row?.symb || '') + ' (' + (row?.ovrs_item_name || row?.name || row?.itnm || '') + ')'}
            price={String(row?.prc || row?.price || row?.ord_prc || '')}
            change={String(row?.qty || row?.ord_qty || '')}
            changePositive={true}
          />
        ))}
      </Section>
    </ScrollView>
  );
}
