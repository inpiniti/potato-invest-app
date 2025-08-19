import React, { useLayoutEffect } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

type StockDetailParams = {
  ticker?: string;
  name?: string;
};

function Placeholder({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function StockDetailScreen() {
  const route = useRoute<RouteProp<Record<string, StockDetailParams>, string>>();
  const navigation = useNavigation();
  const { ticker, name } = route.params || {};

  useLayoutEffect(() => {
    navigation.setOptions({
      title: ticker ? `${ticker}${name ? ` · ${name}` : ''}` : '종목 상세',
    });
  }, [navigation, ticker, name]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let icon: keyof typeof Ionicons.glyphMap = 'ellipse';
          switch (route.name) {
            case 'Chart':
              icon = 'stats-chart';
              break;
            case 'Analysis':
              icon = 'analytics';
              break;
            case 'Finance':
              icon = 'business';
              break;
            case 'Community':
              icon = 'chatbubbles';
              break;
            case 'News':
              icon = 'newspaper';
              break;
          }
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Chart" component={() => <Placeholder label="차트" />} options={{ title: '차트' }} />
      <Tab.Screen name="Analysis" component={() => <Placeholder label="분석" />} options={{ title: '분석' }} />
      <Tab.Screen name="Finance" component={() => <Placeholder label="재무분석" />} options={{ title: '재무분석' }} />
      <Tab.Screen name="Community" component={() => <Placeholder label="커뮤니티" />} options={{ title: '커뮤니티' }} />
      <Tab.Screen name="News" component={() => <Placeholder label="뉴스" />} options={{ title: '뉴스' }} />
    </Tab.Navigator>
  );
}
