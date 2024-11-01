import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, setPersistence, browserLocalPersistence,  } from 'firebase/auth'; 
import { app, auth } from '../firebaseConfig'; 
import { RootStackParamList } from '../../App';
import { CustomAlert } from '../components/CustomAlert';

export function Login() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showResendMessage, setShowResendMessage] = useState(false);
  const [canResendEmail, setCanResendEmail] = useState(true);
  const [timer, setTimer] = useState(0);


  
  // Função de login
  const handleLogin = async () => {

    

    try {

      
      const auth = getAuth(app);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (user.emailVerified) {
        console.log('Usuário logado:', user);
        navigation.navigate('Home');
      } else {
        setAlertMessage('Por favor, verifique seu email antes de fazer login.');
        setAlertVisible(true);
        setShowResendMessage(true);
      }
    } catch (error: any) {
      switch (error.code) {
        case 'auth/missing-password':
          setAlertMessage("Digite sua Senha.");
          break;
        case 'auth/invalid-credential':
          setAlertMessage("Email ou Senha inválida.");
          break;
        case 'auth/invalid-email':
          setAlertMessage("E-mail inválido.");
          break;
        case 'auth/user-disabled':
          setAlertMessage("Usuário desativado.");
          break;
        default:
          setAlertMessage("Erro ao fazer login.");
          console.log(error.code);
          break;
      }
      setAlertVisible(true);
    }
  };
  

  const handleResendEmail = async () => {
    if (!canResendEmail) return;

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        console.log("E-mail de verificação reenviado.");

        setCanResendEmail(false);
        setTimer(120); 
      }
    } catch (error) {
      console.log("Erro ao reenviar e-mail de verificação: ", error);
    }
  };

  // Configura o timer para o botão de reenviar o email
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResendEmail(true);
    }
  }, [timer]);

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

      <CustomAlert
        visible={alertVisible}
        title="Falha na Autenticação"
        message={alertMessage}
        onClose={() => setAlertVisible(false)} 
      />

      {showResendMessage && (
        <TouchableOpacity
          onPress={handleResendEmail}
          disabled={!canResendEmail} 
        >
          <Text
            style={[
              styles.resendButtonText,
              { color: canResendEmail ? '#FF8C00' : '#999' } 
            ]}
          >
            {canResendEmail ? 'Reenviar E-mail de verificação' : `Tente novamente em ${timer}s`}
          </Text>
        </TouchableOpacity>
      )}
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
    color: '#121015',
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
  resendButtonText: {
    marginTop: 10,
    color: '#cecece',
    fontWeight: 'bold',
  }
});
