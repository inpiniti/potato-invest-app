import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ViewProps, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getLogoByTicker } from '../../logoData';
import { LogoSvg } from '../ui/LogoSvg';
import { Ionicons } from '@expo/vector-icons';
import { useBoosterStore, useIsBoosted } from '../../stores/booster';
import { useBoosterPriceStore } from '../../hooks/useBoosterPrices';

export type CurrentPriceItemProps = ViewProps & {
  ticker?: string;
  rank?: number;
  name: string;
  price: string; // e.g., "69,800원"
  change: string; // e.g., "+5.1%" or "-1.9%"
  changePositive?: boolean;
  prefixIcon?: React.ReactNode;
  suffix?: React.ReactNode; // e.g., favorite icon
};

export const CurrentPriceItem = ({
  ticker,
  rank,
  name,
  price,
  change,
  changePositive,
  prefixIcon,
  suffix,
  className = '',
  ...rest
}: CurrentPriceItemProps) => {
  const logo = getLogoByTicker(ticker);
  const logoUri = logo ? `https://s3-symbol-logo.tradingview.com/${logo.logoid}--big.svg` : null;
  const boosted = useIsBoosted(ticker);
  const boosterPrice = useBoosterPriceStore((s) => (ticker ? s.prices[ticker] : undefined));
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<NodeJS.Timeout | null>(null);
  // Detect price change for flash effect
  useEffect(() => {
    if (!boosterPrice) return;
    if (boosterPrice.prevLast !== undefined && boosterPrice.prevLast !== boosterPrice.last) {
      setFlash(true);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(false), 1000);
    }
  }, [boosterPrice]);
  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );
  const toggle = useBoosterStore((s) => s.toggle);
  const navigation = useNavigation<any>();
  const handlePress = () => {
    if (ticker) navigation.navigate('StockDetail', { ticker, name });
  };
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      className={`flex-row items-center justify-between p-2 ${className}`}
      {...rest}
      style={flash ? { borderWidth: 1, borderColor: '#ef4444', borderRadius: 6 } : undefined}>
      <View className="mr-3 items-center" style={{ width: 36 }}>
        {rank != null ? (
          <Text
            className="text-sm text-primary"
            numberOfLines={1}
            ellipsizeMode="clip"
            style={{ includeFontPadding: false }}>
            {rank}
          </Text>
        ) : null}
      </View>
      {logoUri ? <LogoSvg uri={logoUri} size={30} className="mr-2" /> : null}
      <View className="flex-1 flex-row items-center">
        {prefixIcon ? <View className="mr-2">{prefixIcon}</View> : null}
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-foreground"
            numberOfLines={1}
            ellipsizeMode="tail">
            {name}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <Text className="text-xs text-muted-foreground">{price}</Text>
            <Text
              className={`text-xs font-semibold ${changePositive ? 'text-red-500' : 'text-blue-500'}`}>
              {change}
            </Text>
          </View>
        </View>
      </View>
      <View className="ml-2 flex-row items-center">
        {suffix}
        {ticker ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={boosted ? '부스터 해제' : '부스터 추가'}
            onPress={() => toggle(ticker)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="mr-2">
            <Ionicons
              name={boosted ? 'flash' : 'flash-outline'}
              size={18}
              color={boosted ? '#2563eb' : '#94a3b8'}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};
