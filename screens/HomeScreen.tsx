import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContent } from '../components/ScreenContent';

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View className="flex-1">
      <ScreenContent title="Home" path="screens/HomeScreen.tsx">
        <Text className="mt-4 text-center text-base">홈 화면입니다.</Text>
        <Pressable
          className="mt-6 self-center rounded-md bg-blue-600 px-4 py-2"
          onPress={() => navigation.navigate('HomeDetail' as never)}>
          <Text className="font-semibold text-white">상세 보기</Text>
        </Pressable>
      </ScreenContent>
    </View>
  );
}
