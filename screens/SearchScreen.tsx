import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Heading } from '../components/ui/Heading';
import { Section } from '../components/ui/Section';
import { CurrentPriceItem } from '../components/items/CurrentPriceItem';
import { BottomInfo } from '../components/BottomInfo';
import { useAuthStore } from 'stores/auth';
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

export default function SearchScreen() {
  const { account, appKey, secretKey, tokens } = useAuthStore();
  const priceFluct = usePriceFluctRanking();
  const volumeSurge = useVolumeSurgeRanking();
  const volumePower = useVolumePowerRanking();
  const upRate = useUpRateRanking();
  const downRate = useDownRateRanking();
  const newHigh = useNewHighRanking();
  const newLow = useNewLowRanking();
  const tradeVol = useTradeVolRanking();
  const tradePbmn = useTradePbmnRanking();
  const tradeGrowth = useTradeGrowthRanking();
  const tradeTurnover = useTradeTurnoverRanking();
  const marketCap = useMarketCapRanking();

  return (
    <View className="flex-1 bg-neutral-100">
      <ScrollView contentContainerStyle={{ alignItems: 'center' }} className="w-full">
        <View className="flex w-full flex-col items-center gap-5">
          <Text className="text-center text-sm text-muted-foreground">테마 컴포넌트 미리보기</Text>
          <Card className="w-4/5 items-center">
            <Heading level={2}>Card 타이틀</Heading>
            <Text className="mt-2 text-center text-foreground">카드 컨텐츠 영역입니다.</Text>
            <Button className="mt-4 self-stretch" title="Primary 버튼" />
            <Button className="mt-2 self-stretch" title="Secondary 버튼" variant="secondary" />
            <Button className="mt-2 self-stretch" title="위험 버튼" variant="destructive" />
            <Button className="mt-2 self-stretch" title="Ghost 버튼" variant="ghost" />
          </Card>

          <View className="w-full">
            <Section
              title="가격 급등 상위 (NASDAQ, 1분 기준)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {priceFluct.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {priceFluct.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(priceFluct.error)}</Text>
              )}
              {priceFluct.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="거래량 급증 상위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {volumeSurge.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {volumeSurge.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(volumeSurge.error)}</Text>
              )}
              {volumeSurge.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="매수 체결강도 상위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {volumePower.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {volumePower.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(volumePower.error)}</Text>
              )}
              {volumePower.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="상승률 상위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {upRate.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {upRate.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(upRate.error)}</Text>
              )}
              {upRate.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="하락률 상위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {downRate.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {downRate.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(downRate.error)}</Text>
              )}
              {downRate.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="신고가 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {newHigh.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {newHigh.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(newHigh.error)}</Text>
              )}
              {newHigh.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="신저가 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {newLow.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {newLow.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(newLow.error)}</Text>
              )}
              {newLow.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="거래량 순위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {tradeVol.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {tradeVol.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(tradeVol.error)}</Text>
              )}
              {tradeVol.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="거래대금 순위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {tradePbmn.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {tradePbmn.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(tradePbmn.error)}</Text>
              )}
              {tradePbmn.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="거래 증가율 순위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {tradeGrowth.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {tradeGrowth.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(tradeGrowth.error)}</Text>
              )}
              {tradeGrowth.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="거래 회전율 순위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {tradeTurnover.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {tradeTurnover.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(tradeTurnover.error)}</Text>
              )}
              {tradeTurnover.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="시가총액 순위 (NASDAQ)"
              footer={<Text className="text-center text-muted-foreground">1분마다 자동 갱신</Text>}>
              {marketCap.isPending && (
                <Text className="px-5 py-3 text-center text-muted-foreground">불러오는 중…</Text>
              )}
              {marketCap.error && (
                <Text className="px-5 py-3 text-center text-destructive">오류: {String(marketCap.error)}</Text>
              )}
              {marketCap.data?.slice?.(0, 10)?.map((row, idx) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  name={row.name || '-'}
                  price={row.price}
                  change={row.changeText}
                  changePositive={row.changePositive}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="로그인정보"
              footer={<Text className="text-center text-primary">더보기</Text>}>
              <CurrentPriceItem name="계좌번호" price={account} change="" changePositive />
              <CurrentPriceItem name="앱 키" price={appKey} change="" changePositive />
              <CurrentPriceItem name="시크릿 키" price={secretKey} change="" changePositive />
              <CurrentPriceItem
                name="접근토큰"
                price={String(tokens?.accessToken)}
                change=""
                changePositive
              />
              <CurrentPriceItem
                name="웹소켓 접속키"
                price={String(tokens?.approvalKey)}
                change=""
                changePositive
              />
            </Section>
          </View>

          <BottomInfo />
        </View>
      </ScrollView>
    </View>
  );
}
