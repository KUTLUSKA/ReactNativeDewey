import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import config from './config';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Hata', 'Kullanıcı adı ve şifre boş olamaz.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Registering with URL:', `${config.API_URL}/api/register`);
      const response = await fetch(`${config.API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (response.ok) {
        Alert.alert(
          'Başarılı', 
          'Kayıt işlemi başarıyla tamamlandı. Giriş yapabilirsiniz.',
          [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        if (response.status === 409) {
          Alert.alert('Hata', 'Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçin.');
        } else {
          Alert.alert('Hata', result.message || 'Kayıt işlemi başarısız oldu.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Hata', 'Bir hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../img/verinova-JPG-300x122.jpg')} style={styles.icon} />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Üye Ol</Text>
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Kaydediliyor...' : 'Üye Ol'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  icon: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 500,
    height: 200,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginLeft: '50%', 
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '80%',
    height: 40,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default RegisterScreen;
