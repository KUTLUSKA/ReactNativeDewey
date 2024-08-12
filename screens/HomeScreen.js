import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, SafeAreaView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
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
      const response = await fetch(`${config.API_URL}/api/search?query=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Sunucudan gelen veri:', data); // Bu satırı ekleyin
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
  }, [searchQuery]);

  const toggleItem = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => ({...prev, [index]: !prev[index]}));
  };

  const renderSearchResults = () => {
    return searchResults.map((result, index) => (
      <View key={index} style={styles.resultItem}>
        <TouchableOpacity onPress={() => toggleItem(index)}>
          <View style={styles.resultTitleContainer}>
            <Text style={styles.resultDeweyNo}>{result.dewey_no || 'No yok'}</Text>
            <Text style={styles.resultTitle}>{result.konu_adi || 'Başlık yok'}</Text>
          </View>
        </TouchableOpacity>
        {expandedItems[index] && (
          <Text style={styles.resultDescription}>
            {result.aciklama ? result.aciklama : 'Açıklama bulunamadı'}
          </Text>
        )}
      </View>
    ));
  };
  
  return (
    <SafeAreaView style={styles.container}>
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
      </View>

      {searchResults.length > 0 ? (
        <View style={styles.resultsContainer}>
          {renderSearchResults()}
        </View>
      ) : searchQuery.length > 2 ? (
        <Text style={styles.noResultText}>Sonuç bulunamadı</Text>
      ) : null}

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

  icon: {
    width: 200,
    height: 81,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 10,
  },
  searchContainer: {
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  searchInput: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
    paddingRight: 15,
  },
  libraryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 5,
  },
  resultItem: {
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
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
  resultDescription: {
    padding: 10,
    fontSize: 14,
  },
  library: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    margin: 3,
    borderRadius: 5,
    width: '3%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  libraryText: {
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
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
  resultsContainer: {
    padding: 10,
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  noResultText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;