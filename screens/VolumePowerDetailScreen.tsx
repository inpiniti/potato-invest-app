import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useVolumePowerRanking } from '../hooks/useKIRanking';
import { Section } from '../components/ui/Section';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';

export default function VolumePowerDetailScreen() {
  const volumePower = useVolumePowerRanking();
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <Section
        title="매수 체결강도 상위 전체"
        loading={volumePower.isPending}
        reloading={volumePower.isFetching}
        onReload={() => volumePower.refetch()}
        empty={!volumePower.isPending && !volumePower.error && (volumePower.data?.length ?? 0) === 0}
      >
        {volumePower.error && (
          <Text className="px-5 py-3 text-center text-destructive">{String(volumePower.error)}</Text>
        )}
        {volumePower.data?.map((row: any, idx: number) => (
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
