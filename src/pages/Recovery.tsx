import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth'; 
import { CustomAlert } from '../components/CustomAlert';

export function Recovery() {
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      setAlertMessage('Email de redefinição de senha enviado com sucesso!');
      setAlertVisible(true);
    } catch (error: any) {
      setAlertMessage(error.message);
      setAlertVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/LogoIcon.png')}
        style={styles.logoStyle}
      />

      <Text style={styles.title}>Redefinir Senha</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Endereço de Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity 
        style={styles.button}
        activeOpacity={0.7}
        onPress={handleResetPassword}
      >
        <Text style={styles.buttonText}>Recuperar</Text>  
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpButton}>
        <Text style={styles.helpButtonText}>Precisa de Ajuda?</Text>
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
    height: 250,
    width: 250,
  },
  title: {
    color: '#FF8C00',
    fontSize: 35,
    marginBottom: 20,
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
  helpButton: {
    marginTop: 30,
  },
  helpButtonText: {
    color: '#FF8C00',
    fontSize: 16,
  },
});
