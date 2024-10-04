import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Importando a função de autenticação
import { RootStackParamList } from '../../App'; // Importar o tipo do stack

// Definir o tipo da navegação
export function Login() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Adicionar tipo aqui
  const [email, setEmail] = useState(''); // Estado para armazenar o email
  const [password, setPassword] = useState(''); // Estado para armazenar a senha

  const handleLogin = () => {
    const auth = getAuth(); // Obter instância do Firebase Auth
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // O usuário está autenticado
        const user = userCredential.user;
        console.log('Usuário logado:', user);
        navigation.navigate('Home'); // Navegar para a tela inicial
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert('Erro', errorMessage); // Mostrar mensagem de erro
      });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/LogoIcon.png')}  // Certifique-se do caminho correto
        style={styles.logoStyle}
      />
      <Text style={styles.title}>Login</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail} // Atualiza o estado do email
      />

      <TextInput 
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Senha"
        placeholderTextColor="#555" 
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword} // Atualiza o estado da senha
      />

      <TouchableOpacity 
        style={styles.button}
        activeOpacity={0.7}
        onPress={handleLogin} // Chama a função de login
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
