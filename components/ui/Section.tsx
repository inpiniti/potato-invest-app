import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export type SectionProps = ViewProps & {
  title: string;
  padded?: boolean;
  footer?: React.ReactNode; // 하단 더보기 영역
  children?: React.ReactNode;
};

export const Section = ({
  title,
  padded = true,
  footer,
  className = '',
  children,
  ...rest
}: SectionProps) => {
  const items = React.Children.toArray(children);

  return (
    <View className="bg-card">
      <View className={`${className}`} {...rest}>
        <View className="mt-4 px-4">
          <Text className="text-lg font-bold text-foreground">{title}</Text>
        </View>
        <View className="py-2">
          {items.map((child, idx) => (
            <View key={idx}>{child}</View>
          ))}
        </View>
      </View>
      {footer ? (
        <View className="border-t border-border p-4">
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
