import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Heading } from '../components/ui/Heading';
import { Section } from '../components/ui/Section';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';

export default function SearchScreen() {
  return (
    <View className="flex-1 bg-neutral-200">
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 24 }}
        className="w-full">
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          테마 컴포넌트 미리보기
        </Text>
        <Card className="mt-6 w-4/5 items-center">
          <Heading level={2}>Card 타이틀</Heading>
          <Text className="mt-2 text-center text-foreground">카드 컨텐츠 영역입니다.</Text>
          <Button className="mt-4 self-stretch" title="Primary 버튼" />
          <Button className="mt-2 self-stretch" title="Secondary 버튼" variant="secondary" />
          <Button className="mt-2 self-stretch" title="위험 버튼" variant="destructive" />
          <Button className="mt-2 self-stretch" title="Ghost 버튼" variant="ghost" />
        </Card>

        <View className="mt-6 w-full">
          <Section
            title="실시간 거래대금 차트"
            footer={<Text className="text-center text-primary">다른 차트 더 보기 ›</Text>}>
            <CurrentPriceItem
              rank={1}
              name="두산에너빌리티"
              price="69,800원"
              change="+5.1%"
              changePositive
            />
            <CurrentPriceItem rank={2} name="NAVER" price="225,000원" change="-1.9%" />
            <CurrentPriceItem
              rank={3}
              name="이브이첨단소재"
              price="2,630원"
              change="+17.4%"
              changePositive
            />
          </Section>
        </View>

        <View className="mt-6 w-full">
          <Section title="맞춤형 서비스" footer={<Text className="text-center text-primary">더보기</Text>}>
            <CurrentPriceItem
              name="출석체크하고 주식받기"
              price="리워드"
              change=""
              changePositive
            />
            <CurrentPriceItem name="오늘의 미션 확인하기" price="미션" change="" changePositive />
            <CurrentPriceItem
              name="지금 핫한 주제별 커뮤니티"
              price="커뮤니티"
              change=""
              changePositive
            />
            <CurrentPriceItem name="증권 계좌에 돈 채우기" price="입금" change="" changePositive />
          </Section>
        </View>
      </ScrollView>
    </View>
  );
}
