import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';

export default function HomeScreen({ navigation }: any) {
  return (
    <View className="flex-1">
      <ScreenContent title="Home" path="screens/HomeScreen.tsx">
        <Text className="mt-4 text-center text-base text-foreground">홈 화면입니다.</Text>
        <Pressable
          className="mt-6 self-center rounded-app bg-primary px-4 py-2"
          onPress={() => navigation.navigate('HomeDetail' as never)}>
          <Text className="font-semibold text-primary-foreground">상세 보기</Text>
        </Pressable>
      </ScreenContent>
    </View>
  );
}
