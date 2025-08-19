import React, { useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useDailyPrices } from '../../hooks/useDailyPrices';
import Svg, { Polyline, Rect, Line } from 'react-native-svg';
import { Section } from '../../components/ui/Section';

export function ChartTab({ ticker }: { ticker?: string }) {
  const { data, isLoading, error, refetch, isFetching } = useDailyPrices(ticker);
  const screenW = Dimensions.get('window').width;
  const chartWidth = Math.min(screenW - 32, 420);
  const candleAreaHeight = 180;
  const volumeAreaHeight = 56;
  const pad = 8;

  const rows = (data || []).slice();
  rows.sort((a: any, b: any) => (a.date || '').localeCompare(b.date || ''));

  const memo = useMemo(() => {
    if (!rows.length) {
      return {
        maxP: 0,
        minP: 0,
        maxV: 0,
        ma5: [] as number[],
        ma20: [] as number[],
        linePoints: '',
      };
    }
    const prices = rows.map((r) => r.close);
    const volumes = rows.map((r) => r.volume);
    const _maxP = Math.max(...rows.map((r) => r.high));
    const _minP = Math.min(...rows.map((r) => r.low));
    const _maxV = Math.max(...volumes, 1);
    const calcMA = (n: number) =>
      rows.map((_, i) => {
        const slice = rows.slice(Math.max(0, i - n + 1), i + 1);
        const avg = slice.reduce((s, r) => s + r.close, 0) / slice.length;
        return avg;
      });
    const ma5Arr = calcMA(5);
    const ma20Arr = calcMA(20);
    const pointsLine = prices
      .map((p, i) => {
        const x = pad + (i / (prices.length - 1 || 1)) * (chartWidth - pad * 2);
        const y = pad + (1 - (p - _minP) / (_maxP - _minP || 1)) * (candleAreaHeight - pad * 2);
        return `${x},${y}`;
      })
      .join(' ');
    return {
      maxP: _maxP,
      minP: _minP,
      maxV: _maxV,
      ma5: ma5Arr,
      ma20: ma20Arr,
      linePoints: pointsLine,
    };
  }, [rows, chartWidth]);

  if (!ticker)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>티커 없음</Text>
      </View>
    );
  if (isLoading)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  if (error)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>에러</Text>
      </View>
    );
  if (!rows.length)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>데이터 없음</Text>
        <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
          일봉 API 응답이 비어 있습니다.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            marginTop: 16,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: '#2563eb',
            borderRadius: 6,
          }}
          disabled={isFetching}>
          <Text style={{ color: 'white', fontWeight: '600' }}>
            {isFetching ? '재조회...' : '재조회'}
          </Text>
        </TouchableOpacity>
      </View>
    );

  const { maxP, minP, maxV, ma5, ma20, linePoints } = memo;
  const last = rows[rows.length - 1];

  return (
    <ScrollView className="flex-1 bg-neutral-100" contentContainerStyle={{ alignItems: 'center' }}>
      <View style={{ width: '100%' }}>
        <Section title="차트" className="overflow-hidden rounded-lg">
          <View style={{ paddingHorizontal: 12, paddingTop: 4 }}>
            {last ? (
              <Text style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>
                최신 {last.date}: {last.close.toFixed(2)} ({last.raw?.diff ?? '-'},{' '}
                {last.raw?.rate ?? '-'}%)
              </Text>
            ) : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <Svg width={chartWidth} height={candleAreaHeight}>
                  {[0, 1, 2, 3, 4].map((g) => {
                    const y = pad + (g / 4) * (candleAreaHeight - pad * 2);
                    return (
                      <Line
                        key={g}
                        x1={0}
                        x2={chartWidth}
                        y1={y}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth={1}
                      />
                    );
                  })}
                  {ma20.length ? (
                    <Polyline
                      points={ma20
                        .map((p, i) => {
                          const x = pad + (i / (ma20.length - 1)) * (chartWidth - pad * 2);
                          const y =
                            pad +
                            (1 - (p - minP) / (maxP - minP || 1)) * (candleAreaHeight - pad * 2);
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth={1.2}
                    />
                  ) : null}
                  {ma5.length ? (
                    <Polyline
                      points={ma5
                        .map((p, i) => {
                          const x = pad + (i / (ma5.length - 1)) * (chartWidth - pad * 2);
                          const y =
                            pad +
                            (1 - (p - minP) / (maxP - minP || 1)) * (candleAreaHeight - pad * 2);
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth={1}
                    />
                  ) : null}
                  <Polyline points={linePoints} fill="none" stroke="#2563eb55" strokeWidth={1} />
                  {rows.map((r, i) => {
                    const candleW = ((chartWidth - pad * 2) / rows.length) * 0.6;
                    const xCenter = pad + (i / rows.length) * (chartWidth - pad * 2) + candleW / 2;
                    const scaleY = (val: number) =>
                      pad + (1 - (val - minP) / (maxP - minP || 1)) * (candleAreaHeight - pad * 2);
                    const highY = scaleY(r.high);
                    const lowY = scaleY(r.low);
                    const openY = scaleY(r.open);
                    const closeY = scaleY(r.close);
                    const bullish = r.close >= r.open;
                    const bodyTop = bullish ? closeY : openY;
                    const bodyBottom = bullish ? openY : closeY;
                    const bodyH = Math.max(1, bodyBottom - bodyTop);
                    // Korean market color convention: up=red, down=blue
                    const color = bullish ? '#dc2626' : '#2563eb';
                    return (
                      <React.Fragment key={i}>
                        <Line x1={xCenter} x2={xCenter} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
                        <Rect
                          x={xCenter - candleW / 2}
                          y={bodyTop}
                          width={candleW}
                          height={bodyH}
                          fill={color}
                          opacity={0.9}
                          rx={1}
                        />
                      </React.Fragment>
                    );
                  })}
                </Svg>
                <Svg width={chartWidth} height={volumeAreaHeight} style={{ marginTop: 4 }}>
                  {rows.map((r, i) => {
                    const candleW = ((chartWidth - pad * 2) / rows.length) * 0.6;
                    const x = pad + (i / rows.length) * (chartWidth - pad * 2);
                    const vRatio = r.volume / (maxV || 1);
                    const barH = vRatio * (volumeAreaHeight - 8);
                    const bullish = r.close >= r.open;
                    const color = bullish ? '#dc2626' : '#2563eb';
                    return <Rect key={i} x={x} y={volumeAreaHeight - barH} width={candleW} height={barH} fill={color} opacity={0.35} />;
                  })}
                </Svg>
              </View>
            </ScrollView>
          </View>
        </Section>
      </View>
      <View style={{ width: '100%', marginTop: 18 }}>
        <Section title="일자별 시세" className="overflow-hidden rounded-lg">
          <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            {rows.slice().reverse().slice(0, 60).map((r, idx) => {
              const rateNum = parseFloat(r.raw?.rate);
              const isUp = rateNum > 0;
              const isDown = rateNum < 0;
              const color = isUp ? '#dc2626' : isDown ? '#2563eb' : '#64748b';
              const last = rows[rows.length - 1];
              return (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 6,
                    borderBottomWidth: idx === 59 || idx === rows.length - 1 ? 0 : 1,
                    borderBottomColor: '#e2e8f0',
                    alignItems: 'center',
                  }}>
                  <Text style={{ width: 60, fontVariant: ['tabular-nums'], color: '#475569' }}>
                    {r.date.slice(4, 6)}.{r.date.slice(6, 8)}
                  </Text>
                  <Text
                    style={{
                      width: 80,
                      fontVariant: ['tabular-nums'],
                      color: '#1e293b',
                      fontWeight: r === last ? '700' : '400',
                    }}>
                    {Number(r.close).toFixed(2)}
                  </Text>
                  <Text
                    style={{
                      width: 70,
                      fontVariant: ['tabular-nums'],
                      color,
                      textAlign: 'right',
                    }}>
                    {isUp || isDown ? `${rateNum.toFixed(2)}%` : '-'}
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      fontVariant: ['tabular-nums'],
                      color: '#64748b',
                      textAlign: 'right',
                    }}>
                    {Number(r.volume).toLocaleString()}
                  </Text>
                </View>
              );
            })}
            <TouchableOpacity
              onPress={() => refetch()}
              style={{
                marginTop: 8,
                alignSelf: 'center',
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: '#2563eb',
              }}
              disabled={isFetching}>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
                {isFetching ? '재조회...' : '재조회'}
              </Text>
            </TouchableOpacity>
          </View>
        </Section>
      </View>
    </ScrollView>
  );
}
