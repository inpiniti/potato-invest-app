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
import {
  useOverseasBalance,
  useOverseasPeriodProfit,
  useOverseasExecutions,
} from '../hooks/useKITrading';

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
  // forceReal: 실전 환경 잔고 호출 테스트 (실전 키/계좌 권한이 있어야 정상 동작)
  const balance = useOverseasBalance({ forceReal: true });
  const periodProfit = useOverseasPeriodProfit();
  const executions = useOverseasExecutions();

  // 초기 진입 시 React Query가 enabled true 조건으로 1회 조회 (refetchInterval 없음)

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
              title="(테스트) 해외 잔고 조회"
              onReload={() => balance.refetch()}
              reloading={balance.isFetching}
              loading={balance.isPending}
              empty={
                !balance.isPending && !balance.error && (balance.data?.rows?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">
                  Reload 버튼으로 재조회 (TR ID placeholder, NASD/USD)
                </Text>
              }>
              {balance.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(balance.error)}
                </Text>
              )}
              {balance.data?.rows?.slice?.(0, 10)?.map((row: any, idx: number) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  ticker={row?.ovrs_pdno}
                  name={
                    (row?.ovrs_pdno || '') +
                    ' (' +
                    (row?.ovrs_item_name || row?.name || row?.itnm || '') +
                    ')'
                  }
                  price={`${row?.pchs_avg_pric} (${row?.ovrs_cblc_qty})`}
                  change={`${row?.evlu_pfls_rt}%`}
                  changePositive={Number(row?.evlu_pfls_rt) >= 0}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="(테스트) 해외 기간손익"
              onReload={() => periodProfit.refetch()}
              reloading={periodProfit.isFetching}
              loading={periodProfit.isPending}
              empty={
                !periodProfit.isPending &&
                !periodProfit.error &&
                (periodProfit.data?.rows?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">
                  Reload 버튼으로 재조회 (TR ID placeholder, NASD/USD)
                </Text>
              }>
              {periodProfit.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(periodProfit.error)}
                </Text>
              )}
              {periodProfit.data?.rows?.slice?.(0, 10)?.map((row: any, idx: number) => (
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
          </View>

          <View className="w-full">
            <Section
              title="(테스트) 해외 체결내역"
              onReload={() => executions.refetch()}
              reloading={executions.isFetching}
              loading={executions.isPending}
              empty={
                !executions.isPending &&
                !executions.error &&
                (executions.data?.rows?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">
                  Reload 버튼으로 재조회 (TR ID placeholder, NASD/USD)
                </Text>
              }>
              {executions.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(executions.error)}
                </Text>
              )}
              {executions.data?.rows?.slice?.(0, 10)?.map((row: any, idx: number) => (
                <CurrentPriceItem
                  key={idx}
                  rank={idx + 1}
                  ticker={row?.symb || row?.rsym || row?.ovrs_item_cd}
                  name={
                    (row?.symb || '') +
                    ' (' +
                    (row?.ovrs_item_name || row?.name || row?.itnm || '') +
                    ')'
                  }
                  price={String(row?.prc || row?.price || row?.ord_prc || '')}
                  change={String(row?.qty || row?.ord_qty || '')}
                  changePositive={true}
                />
              ))}
            </Section>
          </View>

          <View className="w-full">
            <Section
              title="가격 급등 상위 (NASDAQ)"
              onReload={() => priceFluct.refetch()}
              reloading={priceFluct.isFetching}
              loading={priceFluct.isPending}
              empty={
                !priceFluct.isPending && !priceFluct.error && (priceFluct.data?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {priceFluct.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(priceFluct.error)}
                </Text>
              )}
              {priceFluct.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="거래량 급증 상위 (NASDAQ)"
              onReload={() => volumeSurge.refetch()}
              reloading={volumeSurge.isFetching}
              loading={volumeSurge.isPending}
              empty={
                !volumeSurge.isPending &&
                !volumeSurge.error &&
                (volumeSurge.data?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {volumeSurge.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(volumeSurge.error)}
                </Text>
              )}
              {volumeSurge.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="매수 체결강도 상위 (NASDAQ)"
              onReload={() => volumePower.refetch()}
              reloading={volumePower.isFetching}
              loading={volumePower.isPending}
              empty={
                !volumePower.isPending &&
                !volumePower.error &&
                (volumePower.data?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {volumePower.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(volumePower.error)}
                </Text>
              )}
              {volumePower.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="상승률 상위 (NASDAQ)"
              onReload={() => upRate.refetch()}
              reloading={upRate.isFetching}
              loading={upRate.isPending}
              empty={!upRate.isPending && !upRate.error && (upRate.data?.length ?? 0) === 0}
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {upRate.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(upRate.error)}
                </Text>
              )}
              {upRate.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="하락률 상위 (NASDAQ)"
              onReload={() => downRate.refetch()}
              reloading={downRate.isFetching}
              loading={downRate.isPending}
              empty={!downRate.isPending && !downRate.error && (downRate.data?.length ?? 0) === 0}
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {downRate.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(downRate.error)}
                </Text>
              )}
              {downRate.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="신고가 (NASDAQ)"
              onReload={() => newHigh.refetch()}
              reloading={newHigh.isFetching}
              loading={newHigh.isPending}
              empty={!newHigh.isPending && !newHigh.error && (newHigh.data?.length ?? 0) === 0}
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {newHigh.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(newHigh.error)}
                </Text>
              )}
              {newHigh.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="신저가 (NASDAQ)"
              onReload={() => newLow.refetch()}
              reloading={newLow.isFetching}
              loading={newLow.isPending}
              empty={!newLow.isPending && !newLow.error && (newLow.data?.length ?? 0) === 0}
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {newLow.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(newLow.error)}
                </Text>
              )}
              {newLow.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="거래량 순위 (NASDAQ)"
              onReload={() => tradeVol.refetch()}
              reloading={tradeVol.isFetching}
              loading={tradeVol.isPending}
              empty={!tradeVol.isPending && !tradeVol.error && (tradeVol.data?.length ?? 0) === 0}
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {tradeVol.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(tradeVol.error)}
                </Text>
              )}
              {tradeVol.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="거래대금 순위 (NASDAQ)"
              onReload={() => tradePbmn.refetch()}
              reloading={tradePbmn.isFetching}
              loading={tradePbmn.isPending}
              empty={
                !tradePbmn.isPending && !tradePbmn.error && (tradePbmn.data?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {tradePbmn.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(tradePbmn.error)}
                </Text>
              )}
              {tradePbmn.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="거래 증가율 순위 (NASDAQ)"
              onReload={() => tradeGrowth.refetch()}
              reloading={tradeGrowth.isFetching}
              loading={tradeGrowth.isPending}
              empty={
                !tradeGrowth.isPending &&
                !tradeGrowth.error &&
                (tradeGrowth.data?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {tradeGrowth.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(tradeGrowth.error)}
                </Text>
              )}
              {tradeGrowth.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="거래 회전율 순위 (NASDAQ)"
              onReload={() => tradeTurnover.refetch()}
              reloading={tradeTurnover.isFetching}
              loading={tradeTurnover.isPending}
              empty={
                !tradeTurnover.isPending &&
                !tradeTurnover.error &&
                (tradeTurnover.data?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {tradeTurnover.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(tradeTurnover.error)}
                </Text>
              )}
              {tradeTurnover.data?.slice?.(0, 10)?.map((row, idx) => (
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
          </View>

          <View className="w-full">
            <Section
              title="시가총액 순위 (NASDAQ)"
              onReload={() => marketCap.refetch()}
              reloading={marketCap.isFetching}
              loading={marketCap.isPending}
              empty={
                !marketCap.isPending && !marketCap.error && (marketCap.data?.length ?? 0) === 0
              }
              footer={
                <Text className="text-center text-muted-foreground">Reload 버튼으로 재조회</Text>
              }>
              {marketCap.error && (
                <Text className="px-5 py-3 text-center text-destructive">
                  오류: {String(marketCap.error)}
                </Text>
              )}
              {marketCap.data?.slice?.(0, 10)?.map((row, idx) => (
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
