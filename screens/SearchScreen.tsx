import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent } from '../components/ScreenContent';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Heading } from '../components/ui/Heading';

export default function SearchScreen() {
  return (
    <View className="flex-1">
      <ScreenContent title="테스트" path="screens/SearchScreen.tsx">
        <Text className="mt-2 text-center text-sm text-muted-foreground">테마 컴포넌트 미리보기</Text>
        <Card className="mt-6 w-4/5 items-center">
          <Heading level={2}>Card 타이틀</Heading>
          <Text className="mt-2 text-center text-foreground">카드 컨텐츠 영역입니다.</Text>
          <Button className="mt-4 self-stretch" title="Primary 버튼" />
          <Button className="mt-2 self-stretch" title="Secondary 버튼" variant="secondary" />
          <Button className="mt-2 self-stretch" title="위험 버튼" variant="destructive" />
          <Button className="mt-2 self-stretch" title="Ghost 버튼" variant="ghost" />
        </Card>
      </ScreenContent>
    </View>
  );
}
