import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';

export default function BoosterScreen() {
  return (
    <View className="flex-1">
      <ScreenContent title="Booster" path="screens/BoosterScreen.tsx">
        <Text className="mt-4 text-center text-base text-foreground">부스터 화면입니다.</Text>
      </ScreenContent>
    </View>
  );
}
