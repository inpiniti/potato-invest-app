import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';

export default function ProfileScreen() {
  return (
    <View className="flex-1">
      <ScreenContent title="Profile" path="screens/ProfileScreen.tsx">
        <Text className="mt-4 text-center text-base">프로필 화면입니다.</Text>
      </ScreenContent>
    </View>
  );
}
