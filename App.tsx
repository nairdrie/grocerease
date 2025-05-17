// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import GettingStartedScreen from './components/GettingStartedScreen';
import CustomHeader from './components/CustomHeader';
import { WeekProvider } from './context/WeekContext';
import List from './components/List';
import { RootStackParamList } from './types/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <WeekProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="GettingStarted" component={GettingStartedScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="Home"
              component={List}
              options={{ headerShown: true, headerTitle: () => <CustomHeader /> }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </WeekProvider>
  );
}
