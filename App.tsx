import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Login } from './src/pages/Login';
import { Register } from './src/pages/Register';
import { Recovery } from './src/pages/Recovery';
import { Lobby } from './src/pages/Lobby';


export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Recovery: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="Recovery" component={Recovery} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Lobby} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
