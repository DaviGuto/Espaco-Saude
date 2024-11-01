import * as React from 'react';
import {Settings, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Login } from './src/pages/Login';
import { Register } from './src/pages/Register';
import { Recovery } from './src/pages/Recovery';
import { Home } from './src/pages/Home';
import { Workouts } from './src/pages/Workouts';
import { SettingsScreen } from './src/pages/SettingsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Recovery: undefined;
  Home: undefined;
};

export type HomeTabParamList = {
  Inicio: undefined;
  Treinos:undefined;
  Ajustes:undefined;
  // Adicione outras telas que você planeja ter nas abas aqui
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

function HomeTabs() {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string = 'ios-help-circle-outline';

        if (route.name === 'Inicio') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Treinos') {
          iconName = focused ? 'barbell' : 'barbell-outline';
        } else if (route.name === 'Ajustes') {
          iconName = focused ? 'settings' : 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF8C00',
      tabBarInactiveTintColor: '#CECECE',
      tabBarStyle: styles.navigatorStyle,
    })}
  >
      <Tab.Screen name="Inicio" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="Treinos" component={Workouts} options={{ headerShown: false}} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} options={{ headerShown: false}} />
      {/* Adicione outras telas de aba aqui */}
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="Recovery" component={Recovery} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({

  navigatorStyle: {
    backgroundColor: '#121015',
  },

})