import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export type CurrentPriceItemProps = ViewProps & {
  rank?: number;
  name: string;
  price: string; // e.g., "69,800원"
  change: string; // e.g., "+5.1%" or "-1.9%"
  changePositive?: boolean;
  prefixIcon?: React.ReactNode;
  suffix?: React.ReactNode; // e.g., favorite icon
};

export const CurrentPriceItem = ({
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
  return (
    <View className={`flex-row items-center justify-between p-2 ${className}`} {...rest}>
      <View className="mr-3 w-6 items-center">
        {rank != null ? <Text className="text-sm text-primary">{rank}</Text> : null}
      </View>
      <View className="flex-1 flex-row items-center">
        {prefixIcon ? <View className="mr-2">{prefixIcon}</View> : null}
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{name}</Text>
          <Text className="text-xs text-muted-foreground">{price}</Text>
        </View>
      </View>
      <View className="ml-3 items-end">
        <Text
          className={`text-sm font-semibold ${changePositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {change}
        </Text>
        {suffix}
      </View>
    </View>
  );
};
