import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import TransacaoListScreen from './screens/TransacaoListScreen'; // Certifique-se de criar este arquivo

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Transacoes" component={TransacaoListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
