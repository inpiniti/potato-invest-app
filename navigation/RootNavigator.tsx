import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import {
  HomeScreen,
  SearchScreen,
  BoosterScreen,
  PeriodProfitScreen,
  ExecutionsScreen,
  BalanceScreen,
  HomeDetailScreen,
  RankingDetailScreen,
  StockDetailScreen,
  SplashScreen,
  LoginScreen,
} from '../screens';

export type RootTabParamList = {
  Home: undefined;
  Balance: undefined;
  PeriodProfit: undefined;
  Executions: undefined;
  Booster: undefined;
  Search: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator();

const MyTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }) => {
          let name: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'Home':
              name = 'home';
              break;
            case 'Balance':
              name = 'wallet-outline';
              break;
            case 'PeriodProfit':
              name = 'trending-up';
              break;
            case 'Executions':
              name = 'list';
              break;
            case 'Booster':
              name = 'flash';
              break;
            case 'Search':
              name = 'search';
              break;
          }
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '감자증권' }} />
      <Tab.Screen name="Balance" component={BalanceScreen} options={{ title: '잔고' }} />
      <Tab.Screen
        name="PeriodProfit"
        component={PeriodProfitScreen}
        options={{ title: '기간손익' }}
      />
      <Tab.Screen name="Executions" component={ExecutionsScreen} options={{ title: '체결내역' }} />
      <Tab.Screen name="Booster" component={BoosterScreen} options={{ title: '부스터' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: '테스트' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: '로그인' }} />
        <Stack.Screen name="Root" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="HomeDetail" component={HomeDetailScreen} options={{ title: '상세' }} />
        <Stack.Screen
          name="RankingDetail"
          component={RankingDetailScreen}
          options={{ title: '랭킹 전체' }}
        />
        <Stack.Screen
          name="StockDetail"
          component={StockDetailScreen}
          options={{ title: '종목 상세' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
