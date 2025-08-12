import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

export type SegmentedTabsProps<T extends string = string> = {
  tabs: { key: T; label: string }[];
  value?: T;
  onChange?: (key: T) => void;
  className?: string;
};

export function SegmentedTabs<T extends string = string>({
  tabs,
  value,
  onChange,
  className = '',
}: SegmentedTabsProps<T>) {
  const [internal, setInternal] = useState<T>(value ?? tabs[0]?.key);
  const current = value ?? internal;

  const handlePress = (key: T) => {
    setInternal(key);
    onChange?.(key);
  };

  return (
    <View className={`flex-row rounded-app bg-muted p-1 ${className}`}>
      {tabs.map((t) => {
        const active = current === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => handlePress(t.key)}
            className={`flex-1 items-center rounded-app px-3 py-2 ${active ? 'bg-background shadow-sm' : ''}`}>
            <Text
              className={`text-sm ${active ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
