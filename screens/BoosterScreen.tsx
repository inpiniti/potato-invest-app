import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useBoosterStore } from '../stores/booster';
import { useBoosterPrices, useBoosterPriceStore } from '../hooks/useBoosterPrices';
import { useShallow } from 'zustand/react/shallow';
import { Section } from '../components/ui/Section';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';

export default function BoosterScreen() {
  console.log('[UI] BoosterScreen render');
  const items = useBoosterStore((s) => s.items);
  const clear = useBoosterStore((s) => s.clear);
  useBoosterPrices(); // side-effect only
  const prices = useBoosterPriceStore(useShallow((s) => s.prices));
  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40 }}>
      <Section
        title="부스터 등록 종목"
        empty={items.length === 0}
        emptyText="등록된 부스터 종목이 없습니다"
        footer={
          items.length > 0 ? (
            <Text onPress={clear} className="text-center text-primary">
              전체 비우기
            </Text>
          ) : null
        }
      >
        {items.map((it, idx) => {
          const p = prices[it.ticker];
          const last = p?.last ?? 0;
          const rate = p?.rate ?? 0;
          return (
            <CurrentPriceItem
              key={it.ticker}
              rank={idx + 1}
              ticker={it.ticker}
              name={it.ticker}
              price={last ? last.toLocaleString() : '-'}
              change={`${rate.toFixed(2)}%`}
              changePositive={rate >= 0}
            />
          );
        })}
      </Section>
    </ScrollView>
  );
}
