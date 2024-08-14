import React, { useEffect, useState, useCallback } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screen imports
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DeweyNumbersScreen from '../screens/DeweyNumbersScreen';
import TNumbersScreen from '../screens/TNumbersScreen';
import DeweyLevel1Screen from '../screens/DeweyLevel1Screen';
import DeweyLevel2Screen from '../screens/DeweyLevel2Screen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Token kontrolü sırasında hata oluştu:', error);
      setIsLoggedIn(false);
    }
  }, []);

  if (isLoggedIn === null) {
    // Login durumu kontrol edilirken loading ekranı gösterilebilir
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isLoggedIn ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Ana Sayfa' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ title: 'Kayıt Ol' }}
        />
        <Stack.Screen 
          name="DeweyNumbers" 
          component={DeweyNumbersScreen} 
          options={{ title: 'Dewey Onlu Sınıflama' }}
        />
        <Stack.Screen 
          name="TNumbers" 
          component={TNumbersScreen} 
          options={{ title: 'T Numaraları' }}
        />
        <Stack.Screen 
          name="DeweyLevel1" 
          component={DeweyLevel1Screen} 
          options={({ route }) => ({ 
            title: route.params?.mainCategory?.konu_adi 
              ? `${route.params.mainCategory.konu_adi} - Alt Kategoriler`
              : 'Dewey Alt Kategoriler'
          })}
        />
        <Stack.Screen 
          name="DeweyLevel2" 
          component={DeweyLevel2Screen} 
          options={({ route }) => ({ 
            title: route.params?.level2Category?.konu_adi 
              ? `${route.params.level2Category.konu_adi} - Alt Kategoriler`
              : 'Dewey Seviye 2 Alt Kategoriler'
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;