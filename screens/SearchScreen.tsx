import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';

export default function SearchScreen() {
  return (
    <View className="flex-1">
      <ScreenContent title="Search" path="screens/SearchScreen.tsx">
        <Text className="mt-4 text-center text-base text-foreground">검색 화면입니다.</Text>
      </ScreenContent>
    </View>
  );
}
