import React from 'react';
import { View, Text, ViewProps, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type SectionProps = ViewProps & {
  title: string;
  padded?: boolean;
  footer?: React.ReactNode; // 하단 더보기 영역
  children?: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  empty?: boolean;
  emptyText?: string;
  onReload?: () => void;
  reloading?: boolean; // refetch in progress indicator (표시용)
};

export const Section = ({
  title,
  padded = true,
  footer,
  className = '',
  children,
  loading = false,
  loadingText = '불러오는 중…',
  empty = false,
  emptyText = '데이터가 없습니다',
  onReload,
  reloading = false,
  ...rest
}: SectionProps) => {
  const items = React.Children.toArray(children);

  return (
    <View className="bg-card">
      <View className={`${className}`} {...rest}>
        <View className="mt-4 flex-row items-center px-4">
          {onReload ? (
            <TouchableOpacity
              onPress={onReload}
              disabled={reloading || loading}
              style={{ opacity: reloading || loading ? 0.5 : 1, marginRight: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Reload section">
              {reloading || loading ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Ionicons name="refresh" size={18} color="#2563eb" />
              )}
            </TouchableOpacity>
          ) : null}
          <Text className="text-lg font-bold text-foreground flex-1">{title}</Text>
        </View>
        <View className="py-2">
          {loading ? (
            <Text className="px-5 py-3 text-center text-muted-foreground">{loadingText}</Text>
          ) : empty ? (
            <Text className="px-5 py-3 text-center text-muted-foreground">{emptyText}</Text>
          ) : (
            items.map((child, idx) => <View key={idx}>{child}</View>)
          )}
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
