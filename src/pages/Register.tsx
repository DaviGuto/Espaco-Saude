import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { CustomAlert } from '../components/CustomAlert';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  const [showResendMessage, setShowResendMessage] = useState(false);
  const [canResendEmail, setCanResendEmail] = useState(true);
  const [timer, setTimer] = useState(0);

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

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setAlertMessage("As senhas não coincidem!");
      setAlertVisible(true);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      setAlertMessage("Registro bem-sucedido! Verifique sua caixa de e-mail para autenticação.");
      setAlertVisible(true);
      setShowResendMessage(true);
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-email':
          setAlertMessage("Email inválido.");
          break;
        case 'auth/email-already-in-use':
          setAlertMessage("Este email já está em uso.");
          break;
        default:
          setAlertMessage("Erro ao registrar");
      }
      setAlertVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/LogoIcon.png')}
        style={styles.logoStyle}
      />
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        placeholderTextColor="#555"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefone"
        placeholderTextColor="#555"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#555"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Repetir Senha"
        placeholderTextColor="#555"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title="Aviso"
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />


{showResendMessage && (
  <>
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
  </>
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
    marginTop: 20,
  },
  buttonText: {
    color: '#121015',
    fontWeight: 'bold',
  },

  resendButtonText: {
    marginTop: 10,
    color: '#cecece',
    fontWeight: 'bold',
  },
});
