import { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Login');
    }, 1000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-[#3182f6]">
      <Text className="text-3xl font-bold text-white">감자증권</Text>
    </View>
  );
}
