import React from 'react';
import { View, Text } from 'react-native';
import { Accordion } from './ui/Accordion';

export const BottomInfo = () => {
  return (
    <View className="w-full">
      <View className="rounded-app p-4">
        <Text className="text-base font-semibold text-foreground">지금까지 감자증권 어땠나요?</Text>
        <Text className="text-sm text-muted-foreground">의견 보내기</Text>
      </View>

      <View className="border-t border-border" />

      <View className="rounded-app p-4">
        <Text className="text-base font-semibold text-foreground">감자증권</Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          감자증권에서 제공하는 투자 정보는 고객의 투자 판단을 위한 단순 참고용일뿐, 투자 제안 및
          권유, 종목 추천을 위해 작성된 것이 아닙니다.
        </Text>
      </View>

      <View className="rounded-app p-4">
        <Text className="text-sm text-muted-foreground">개인정보처리방침 • 유의사항</Text>
        <Text className="mt-2 text-xs text-muted-foreground">
          만든이: 정영균 | 만든일자: 2025-08-12 | 출시: 2025-10-01
        </Text>
      </View>

      <View className="rounded-app p-4">
        <Accordion title="꼭 알아두세요" defaultOpen={false}>
          <View className="mt-2">
            <Text className="text-sm text-muted-foreground">
              - 모든 투자의 결정 및 최종 책임은 투자자 본인에게 있어요.
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              - 참고용일뿐, 권유 추천목적이 아닙니다.
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              - 투자 전 상품설명서 및 약관을 반드시 읽어보세요.
            </Text>
          </View>
        </Accordion>
      </View>

      <View className="mb-8" />
    </View>
  );
};
