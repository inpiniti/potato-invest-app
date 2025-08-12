import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export type SectionProps = ViewProps & {
  title: string;
  headerRight?: React.ReactNode;
  padded?: boolean;
  children?: React.ReactNode;
};

export const Section = ({ title, headerRight, padded = true, className = '', children, ...rest }: SectionProps) => {
  const padding = padded ? 'p-4' : '';

  const items = React.Children.toArray(children);

  return (
    <View className={`rounded-app bg-card ${padding} ${className}`} {...rest}>
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-foreground">{title}</Text>
        {headerRight}
      </View>
      <View>
        {items.map((child, idx) => (
          <View key={idx} className={idx === 0 ? '' : 'border-t border-border'}>
            <View className="py-3">{child}</View>
          </View>
        ))}
      </View>
    </View>
  );
};
