import React, { useLayoutEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ChartTab } from './stock/ChartTab';
import { AnalysisTab } from './stock/AnalysisTab';
import { FinanceTab } from './stock/FinanceTab';
import { CommunityTab } from './stock/CommunityTab';
import { NewsTab } from './stock/NewsTab';

type StockDetailParams = {
  ticker?: string;
  name?: string;
};

// Inline ChartTab removed - now in separate file under ./stock/ChartTab
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
      })}>
      <Tab.Screen
        name="Chart"
        options={{ title: '차트' }}
        component={() => <ChartTab ticker={ticker} />}
      />
  <Tab.Screen name="Analysis" component={AnalysisTab} options={{ title: '분석' }} />
  <Tab.Screen name="Finance" component={FinanceTab} options={{ title: '재무분석' }} />
  <Tab.Screen name="Community" component={CommunityTab} options={{ title: '커뮤니티' }} />
  <Tab.Screen name="News" component={NewsTab} options={{ title: '뉴스' }} />
    </Tab.Navigator>
  );
}
