import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SearchBar } from 'react-native-elements';
import Collapsible from 'react-native-collapsible';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const deweyCategories = ['000 Genel Konular', '100 Felsefe ve Psikoloji', '200 Din', '300 Toplum Bilimleri', '400 Dil ve Dil Bilim', '500 Doğa Bilimleri ve Matematik', '600 Teknoloji (Uygulamalı Bilimler)', '700 Sanat (Güzel Sanatlar)', '800 Edebiyat ve Retorik', '900 Coğrafya ve tarih'];
  const tCategories = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const [search, setSearch] = useState('');
  const [collapsedDewey, setCollapsedDewey] = useState(true);
  const [collapsedT, setCollapsedT] = useState(true);
  const [filteredDeweyCategories, setFilteredDeweyCategories] = useState(deweyCategories);
  const [filteredTCategories, setFilteredTCategories] = useState(tCategories);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState('');

  const updateSearch = (search) => {
    setSearch(search);
    if (search) {
      const filteredDewey = deweyCategories.filter(category =>
        category.includes(search)
      );
      setFilteredDeweyCategories(filteredDewey);
      const filteredT = tCategories.filter(category =>
        category.includes(search)
      );
      setFilteredTCategories(filteredT);
    } else {
      setFilteredDeweyCategories(deweyCategories);
      setFilteredTCategories(tCategories);
    }
  };

  const handleCategoryPress = async (category) => {
    setLoading(true);
    setSelectedCategory(category);

    try {
      const response = await fetch(`http://localhost:3000/api/category/${category}`);
      const data = await response.json();
      if (response.ok) {
        setCategoryInfo(data.konu_adi);
      } else {
        Alert.alert('Hata', data.message || 'Kategori bulunamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.navigate('Login'); // Giriş ekranına yönlendir
    } catch (error) {
      Alert.alert('Hata', 'Çıkış sırasında bir hata oluştu');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../img/verinova-JPG-300x122.jpg')}
        style={styles.icon}
      />
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search..."
          onChangeText={updateSearch}
          value={search}
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInput}
          inputStyle={styles.searchBarInputText}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.leftColumn}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setCollapsedDewey(!collapsedDewey)}
          >
            <Text style={styles.accordionTitle}>Dewey Decimal Kategorileri</Text>
          </TouchableOpacity>
          <Collapsible collapsed={collapsedDewey}>
            {filteredDeweyCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.accordionItem}
                onPress={() => handleCategoryPress(category)}
              >
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </Collapsible>
        </View>

        <View style={styles.rightColumn}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setCollapsedT(!collapsedT)}
          >
            <Text style={styles.accordionTitle}>T Kategorileri</Text>
          </TouchableOpacity>
          <Collapsible collapsed={collapsedT}>
            {filteredTCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.accordionItem}
                onPress={() => handleCategoryPress(category)}
              >
                <Text>{category}</Text>
              </TouchableOpacity>
            ))}
          </Collapsible>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        selectedCategory && (
          <View style={styles.categoryInfoContainer}>
            <Text style={styles.categoryInfoText}>{categoryInfo}</Text>
          </View>
        )
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    marginVertical: 20,
    width: '80%',
    alignSelf: 'center',
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  searchBarInput: {
    backgroundColor: '#e9e9e9',
    borderRadius: 20,
  },
  searchBarInputText: {
    fontSize: 14,
  },
  icon: {
    width: 300,
    height: 122,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  leftColumn: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  rightColumn: {
    flex: 1,
    padding: 10,
  },
  accordionHeader: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginBottom: 10,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  accordionItem: {
    fontSize: 16,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  loader: {
    marginTop: 20,
  },
  categoryInfoContainer: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
    margin: 10,
  },
  categoryInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff6f61',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    width: 120,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
