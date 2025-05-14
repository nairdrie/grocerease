// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import GettingStartedScreen from './components/GettingStartedScreen';
import HomeScreen from './components/HomeScreen';
import CustomHeader from './components/CustomHeader';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="GettingStarted" component={GettingStartedScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerTitle: () => <CustomHeader />,
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
