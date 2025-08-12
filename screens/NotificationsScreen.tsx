import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';

export default function NotificationsScreen() {
  return (
    <View className="flex-1">
      <ScreenContent title="Notifications" path="screens/NotificationsScreen.tsx">
        <Text className="mt-4 text-center text-base">알림 화면입니다.</Text>
      </ScreenContent>
    </View>
  );
}
