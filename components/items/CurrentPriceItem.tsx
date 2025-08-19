import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { getLogoByTicker } from '../../logoData';
import { LogoSvg } from '../ui/LogoSvg';

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
  return (
    <View className={`flex-row items-center justify-between p-2 ${className}`} {...rest}>
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
      <View className="ml-3 flex-row items-center">{suffix}</View>
    </View>
  );
};
