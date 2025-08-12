import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export type SectionProps = ViewProps & {
  title: string;
  padded?: boolean;
  footer?: React.ReactNode; // 하단 더보기 영역
  children?: React.ReactNode;
};

export const Section = ({ title, padded = true, footer, className = '', children, ...rest }: SectionProps) => {
  const padding = padded ? 'p-4' : '';

  const items = React.Children.toArray(children);

  return (
    <View className={`bg-card ${padding} ${className}`} {...rest}>
      <View className="mb-2">
        <Text className="text-lg font-bold text-foreground">{title}</Text>
      </View>
      <View>
        {items.map((child, idx) => (
          <View key={idx} className={idx === 0 ? '' : 'border-t border-border'}>
            <View className="py-3">{child}</View>
          </View>
        ))}
      </View>
      {footer ? (
        <View className="mt-2 border-t border-border pt-3">
          {typeof footer === 'string' ? (
            <Text className="text-center text-primary">{footer}</Text>
          ) : (
            footer
          )}
        </View>
      ) : null}
    </View>
  );
};
