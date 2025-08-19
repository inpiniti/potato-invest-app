import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/auth';
import { useShallow } from 'zustand/react/shallow';
import { useKIAuth } from '../hooks/useKIAuth';

export default function LoginScreen({ navigation }: any) {
  const { account, appKey, secretKey, setCredentials } = useAuthStore(
    useShallow((s: any) => ({
      account: s.account,
      appKey: s.appKey,
      secretKey: s.secretKey,
      setCredentials: s.setCredentials,
    }))
  );
  const { login } = useKIAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ account?: string; appKey?: string; secretKey?: string }>(
    {}
  );

  const onSubmit = async () => {
    const e: typeof errors = {};
    if (!account.trim()) e.account = '계좌번호를 입력하세요';
    if (!appKey.trim()) e.appKey = 'App Key를 입력하세요';
    if (!secretKey.trim()) e.secretKey = 'Secret Key를 입력하세요';
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      setLoading(true);
      await login();
      navigation.reset({ index: 0, routes: [{ name: 'Root' }] });
    } catch (err: any) {
      Alert.alert('로그인 실패', err?.message ?? '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background px-5 py-8">
      <Text className="mb-6 text-2xl font-bold text-foreground">로그인</Text>

      <View className="gap-4">
        <Input
          label="계좌번호"
          value={account}
          onChangeText={(v) => setCredentials({ account: v })}
          placeholder="00000000-01"
          keyboardType="numbers-and-punctuation"
          error={errors.account}
        />
        <Input
          label="App Key"
          value={appKey}
          onChangeText={(v) => setCredentials({ appKey: v })}
          placeholder="발급받은 App Key"
          autoCapitalize="none"
          error={errors.appKey}
        />
        <Input
          label="Secret Key"
          value={secretKey}
          onChangeText={(v) => setCredentials({ secretKey: v })}
          placeholder="발급받은 Secret Key"
          autoCapitalize="none"
          secureTextEntry
          error={errors.secretKey}
        />
      </View>

      <Button
        title={loading ? '처리 중…' : '시작하기'}
        onPress={onSubmit}
        disabled={loading}
        className="mt-8 py-4"
      />
    </View>
  );
}
