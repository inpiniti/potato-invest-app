import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';

export default function CreateScreen() {
  return (
    <View className="flex-1">
      <ScreenContent title="Create" path="screens/CreateScreen.tsx">
        <Text className="mt-4 text-center text-base">작성 화면입니다.</Text>
      </ScreenContent>
    </View>
  );
}
