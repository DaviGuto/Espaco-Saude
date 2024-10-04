import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';

export function Register() {
  return (
    <View style={styles.container}>

    <Image
        source={require('../assets/LogoIcon.png')}  // Certifique-se do caminho correto
        style={styles.logoStyle}
      />
      <Text style={styles.title}>Cadastro</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Nome Completo"
        placeholderTextColor="#555"
      />

      <TextInput 
        style={styles.input} 
        placeholder="Email"
        placeholderTextColor="#555"
      />

      <TextInput 
        style={styles.input} 
        placeholder="Telefone"
        placeholderTextColor="#555" 
        secureTextEntry={true}
      />

    <TextInput 
        style={styles.input} 
        placeholder="Senha"
        placeholderTextColor="#555" 
        secureTextEntry={true}
      />

    <TextInput   
        style={styles.input} 
        placeholder="Repetir Senha"
        placeholderTextColor="#555" 
        secureTextEntry={true}
      />

      <TouchableOpacity 
        style={styles.button}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>
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
  logoStyle:{
    height:250,
    width:250
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
    color: '#333',
    fontWeight: 'bold',
  },
});
