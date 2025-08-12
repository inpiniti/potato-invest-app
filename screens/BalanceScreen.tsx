import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';

export default function BalanceScreen() {
  return (
    <View className="flex-1">
      <ScreenContent title="Balance" path="screens/BalanceScreen.tsx">
        <Text className="mt-4 text-center text-base text-foreground">잔고 화면입니다.</Text>
      </ScreenContent>
    </View>
  );
}
