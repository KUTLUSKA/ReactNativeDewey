import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import config from './config';

const DeweyLevel3Screen = ({ route, navigation }) => {
  const { level2Category, level3Category } = route.params;
  const [level4Categories, setLevel4Categories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLevel4Categories();
  }, []);

  const fetchLevel4Categories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_URL}/api/dewey-level4/${level3Category.real_dewey_no}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setLevel4Categories(data);
    } catch (error) {
      console.error('Level 4 kategoriler alınırken hata:', error);
      setError('Kategoriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLevel4CategoryItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryNumber}>{item.real_dewey_no}</Text>
      <Text style={styles.categoryTitle}>{item.konu_adi}</Text>
      {item.aciklama && <Text style={styles.categoryDescription}>{item.aciklama}</Text>}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{level3Category.konu_adi}</Text>
        <Text style={styles.headerSubtitle}>{level3Category.real_dewey_no}</Text>
      </View>
      <FlatList
        data={level4Categories}
        renderItem={renderLevel4CategoryItem}
        keyExtractor={(item) => item.real_dewey_no}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Bu kategoride alt kategori bulunmamaktadır.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bdc3c7',
  },
  categoryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2980b9',
  },
  categoryTitle: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 5,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default DeweyLevel3Screen;