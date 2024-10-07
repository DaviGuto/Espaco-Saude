import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; 
import { app } from '../firebaseConfig'; // Importando a instância do Firebase
import { RootStackParamList } from '../../App';

export function Login() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const auth = getAuth(app);  // Obtenha a instância do auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Faça o login
      const user = userCredential.user;  // Obtenha o usuário logado
  
      // Verifique se o email foi confirmado
      if (user.emailVerified) {
        console.log('Usuário logado:', user);
        navigation.navigate('Home');  // Navegue para a tela Home
      } else {
        // Se o email não for verificado, mostre um alerta
        Alert.alert('Erro', 'Por favor, verifique seu email antes de fazer login.');
      }
    } catch (error: any) {
      const errorMessage = error.message;  // Capture e mostre a mensagem de erro
      Alert.alert('Erro', errorMessage); 
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/LogoIcon.png')} 
        style={styles.logoStyle}
      />
      <Text style={styles.title}>Login</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput 
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Senha"
        placeholderTextColor="#555" 
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity 
        style={styles.button}
        activeOpacity={0.7}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPassword}
        onPress={() => navigation.navigate('Recovery')}
      >
        <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.register}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>Registrar-se</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#121015',
    paddingHorizontal: 70,
    paddingVertical: 20,
    paddingTop: 50,
  },
  logoStyle: {
    width: 250,
    height: 250,
  },
  title: {
    color: '#FF8C00',
    fontSize: 35,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1F1E25',
    borderRadius: 7,
    marginTop: 7,
    marginBottom: 15,
    padding: 10, 
    fontSize: 18,
    color: '#fff',
    width: '100%',
  },
  button: {
    borderRadius: 5,
    backgroundColor: '#FF8C00',
    height: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#FF8C00',
    fontSize: 16,
  },
  register: {
    marginTop: 15,
  },
  registerText: {
    color: '#FF8C00',
    fontSize: 16,
  },
});
