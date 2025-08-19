import React from 'react';
import { ScrollView, Text } from 'react-native';
import { useBoosterStore } from '../stores/booster';
import { Section } from '../components/ui/Section';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';

export default function BoosterScreen() {
  const items = useBoosterStore((s) => s.items);
  const clear = useBoosterStore((s) => s.clear);
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
        {items.map((it, idx) => (
          <CurrentPriceItem
            key={it.ticker}
            rank={idx + 1}
            ticker={it.ticker}
            name={it.ticker}
            price={new Date(it.addedAt).toLocaleString()}
            change=""
            changePositive
          />
        ))}
      </Section>
    </ScrollView>
  );
}
