import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { auth } from '../firebaseConfig'; // Importando a instância do Firebase
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

  const [alertMessage, setAlertMessage] = useState ('');
  const [alertVisible, setAlertVisible] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setAlertMessage("As senhas não coincidem!");
      setAlertVisible(true);
      return;
    }

    try {
    

    const userCradential =   await createUserWithEmailAndPassword(auth, email, password);
    const user = userCradential.user;

    await sendEmailVerification(user); //Envia email de verificação 
    setAlertMessage("Registro bem-sucedido! Verifique sua caixa de email para autenticação");
    setAlertVisible(true);
    navigation.navigate('Login'); 
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
});
