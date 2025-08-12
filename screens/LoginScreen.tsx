import { useState } from 'react';
import { View, Text } from 'react-native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginScreen({ navigation }: any) {
  const [account, setAccount] = useState('');
  const [appKey, setAppKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [errors, setErrors] = useState<{ account?: string; appKey?: string; secretKey?: string }>(
    {}
  );

  const onSubmit = () => {
    const e: typeof errors = {};
    if (!account.trim()) e.account = '계좌번호를 입력하세요';
    if (!appKey.trim()) e.appKey = 'App Key를 입력하세요';
    if (!secretKey.trim()) e.secretKey = 'Secret Key를 입력하세요';
    setErrors(e);
    if (Object.keys(e).length === 0) {
      navigation.reset({ index: 0, routes: [{ name: 'Root' }] });
    }
  };

  return (
    <View className="flex-1 bg-background px-5 py-8">
      <Text className="mb-6 text-2xl font-bold text-foreground">로그인</Text>

      <View className="gap-4">
        <Input
          label="계좌번호"
          value={account}
          onChangeText={setAccount}
          placeholder="00000000-01"
          keyboardType="numbers-and-punctuation"
          error={errors.account}
        />
        <Input
          label="App Key"
          value={appKey}
          onChangeText={setAppKey}
          placeholder="발급받은 App Key"
          autoCapitalize="none"
          error={errors.appKey}
        />
        <Input
          label="Secret Key"
          value={secretKey}
          onChangeText={setSecretKey}
          placeholder="발급받은 Secret Key"
          autoCapitalize="none"
          secureTextEntry
          error={errors.secretKey}
        />
      </View>

      <Button title="시작하기" onPress={onSubmit} className="mt-8 py-4" />
    </View>
  );
}
