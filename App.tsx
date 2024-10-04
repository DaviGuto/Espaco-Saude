import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeApp } from 'firebase/app'; // Usando a nova sintaxe
import { getAuth } from 'firebase/auth'; // Importando o módulo de autenticação

import { Login } from './src/pages/Login';
import { Register } from './src/pages/Register';
import { Recovery } from './src/pages/Recovery';
import { Workouts } from './src/pages/Workouts';

// Definir os tipos de navegação
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Recovery: undefined;
  Home: undefined;
};

// Configuração do Firebase (use suas próprias credenciais aqui)
const firebaseConfig = {
  apiKey: "AIzaSyAzoHBTxwkJivFuJjSwBowUuDN3NE0K6vw",
  authDomain: "espacosaude-4d84e.firebaseapp.com",
  projectId: "espacosaude-4d84e",
  storageBucket: "espacosaude-4d84e.appspot.com",
  messagingSenderId: "647123958890",
  appId: "1:647123958890:web:d205fa917dc02f6eec1e13",
  measurementId: "G-BVB6HP400Z"
};
// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Obtendo a instância de autenticação

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="Recovery" component={Recovery} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Workouts} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
