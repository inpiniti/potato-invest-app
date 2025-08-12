import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import BoosterScreen from '../screens/BoosterScreen';
import BalanceScreen from '../screens/BalanceScreen';
import HomeDetailScreen from '../screens/HomeDetailScreen';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';

export type RootTabParamList = {
  Home: undefined;
  Search: undefined;
  Booster: undefined;
  Notifications: undefined;
  Balance: undefined;
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
            case 'Search':
              name = 'search';
              break;
            case 'Booster':
              name = 'flash';
              break;
            case 'Notifications':
              name = 'notifications';
              break;
            case 'Balance':
              name = 'wallet-outline';
              break;
          }
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Tab.Screen name="Balance" component={BalanceScreen} options={{ title: '잔고' }} />
      <Tab.Screen name="Booster" component={BoosterScreen} options={{ title: '부스터' }} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: '알림' }}
      />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
