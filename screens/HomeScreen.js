import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, SafeAreaView, TextInput, FlatList, Dimensions,  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';

const { height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('konu_adi');
  const [expandedItems, setExpandedItems] = useState({});

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Hata', 'Çıkış sırasında bir hata oluştu');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/search?query=${searchQuery}&type=${searchType}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Sunucudan gelen veri:', data);
      setSearchResults(data);
      setExpandedItems({});
    } catch (error) {
      console.error('Arama hatası:', error);
      Alert.alert('Hata', 'Arama sırasında bir hata oluştu');
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchType]);

  const toggleItem = (index) => {
    setExpandedItems(prev => ({...prev, [index]: !prev[index]}));
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.resultItem}>
      <TouchableOpacity onPress={() => toggleItem(index)} activeOpacity={0.7}>
        <View style={styles.resultTitleContainer}>
          <Text style={[styles.resultDeweyNo, styles.selectableText]}>{item.dewey_no || 'No yok'}</Text>
          <Text style={[styles.resultTitle, styles.selectableText]}>{item.konu_adi || 'Başlık yok'}</Text>
        </View>
      </TouchableOpacity>
      {expandedItems[index] && (
        <Text style={[styles.resultDescription, styles.selectableText]}>
          {item.aciklama ? item.aciklama : 'Açıklama bulunamadı'}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../img/verinova-JPG-300x122.jpg')}
          style={styles.icon}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.navigationButton} 
            onPress={() => navigation.navigate('DeweyNumbers')}
          >
            <Text style={styles.navigationButtonText}>Dewey Sayıları</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navigationButton} 
            onPress={() => navigation.navigate('TNumbers')}
          >
            <Text style={styles.navigationButtonText}>T Sayıları</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Konu ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[styles.radioButton, searchType === 'konu_adi' && styles.radioButtonSelected]}
              onPress={() => setSearchType('konu_adi')}
            >
              <Text style={styles.radioButtonText}>Konu Adı</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, searchType === 'aciklama' && styles.radioButtonSelected]}
              onPress={() => setSearchType('aciklama')}
            >
              <Text style={styles.radioButtonText}>Açıklama</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.flatListContent}
        style={{ height: Dimensions.get('window').height * 0.7 }}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  icon: {
    width: 200,
    height: 81,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  navigationButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  radioButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  radioButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  radioButtonText: {
    color: '#4CAF50',
  },
  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 60, // Logout butonunun üzerinde boşluk bırakmak için
  },
  resultItem: {
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  resultTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e9e9',
    padding: 10,
  },
  resultDeweyNo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#4CAF50',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  resultDescription: {
    padding: 10,
    fontSize: 14,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#ff6f61',
    padding: 8,
    borderRadius: 15,
    alignItems: 'center',
    width: 100,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectableText: {
    userSelect: 'text',
  },
});

export default HomeScreen;