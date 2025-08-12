import React from 'react';
import { View, Text } from 'react-native';

export default function HomeDetailScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">홈 상세 화면</Text>
      <Text className="mt-2 text-base">뒤로가기 버튼은 상단 헤더에 표시됩니다.</Text>
    </View>
  );
}
