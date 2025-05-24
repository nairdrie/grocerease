// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomHeader from './components/CustomHeader';
import { WeekProvider } from './context/WeekContext';
import ListScreen from './components/ListScreen';
import { RootStackParamList } from './types/types';
import GroupsScreen from './components/GroupsScreen';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  return (
    <WeekProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="GroupsScreen">
            <Stack.Screen
              name="GroupsScreen"
              component={GroupsScreen}
              options={{ title: 'Your Groups' }}
            />
            <Stack.Screen
              name="ListScreen"
              component={ListScreen}
              options={{ headerShown: true, headerTitle: () => <CustomHeader /> }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </WeekProvider>
  );
}