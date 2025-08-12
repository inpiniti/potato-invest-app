import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';

export default function HomeScreen() {
  return (
    <View className="flex-1">
      <ScreenContent title="Home" path="screens/HomeScreen.tsx">
        <Text className="mt-4 text-center text-base">홈 화면입니다.</Text>
      </ScreenContent>
    </View>
  );
}
