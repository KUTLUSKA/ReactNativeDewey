import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, SafeAreaView, Dimensions } from 'react-native';
import config from './config';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DeweyDetailsScreen = ({ route }) => {
  const { item } = route.params;
  const [relatedCategories, setRelatedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchRelatedCategories();
  }, []);

  const fetchRelatedCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const deweyNo = item.dewey_no;
      const level = getDeweyLevel(deweyNo);
      const baseNumber = getBaseNumber(deweyNo, level);
      
      const url = `${config.API_URL}/api/related-categories?base_number=${encodeURIComponent(baseNumber)}&level=${level}`;
      console.log('Fetching URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRelatedCategories(data);
    } catch (error) {
      console.error('İlgili kategorileri getirme hatası:', error);
      setError(`Veri yüklenirken bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDeweyLevel = (deweyNo) => {
    const parts = deweyNo.split('.');
    return parts.length === 1 ? 1 : 2;
  };

  const getBaseNumber = (deweyNo, level) => {
    const parts = deweyNo.split('.');
    return level === 1 ? parts[0].slice(0, -1) : parts.join('.').slice(0, -1);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => {
        setSelectedCategory(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.categoryDeweyNo}>{item.real_dewey_no}</Text>
      <Text style={styles.categoryName}>{item.konu_adi}</Text>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>{selectedCategory?.real_dewey_no}</Text>
        <Text style={styles.modalSubtitle}>{selectedCategory?.konu_adi}</Text>
        <Text style={styles.modalDescription}>{selectedCategory?.aciklama || 'Açıklama bulunamadı.'}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Seçilen Kategori</Text>
        <View style={styles.selectedCategory}>
          <Text style={styles.selectedDeweyNo}>{item.dewey_no}</Text>
          <Text style={styles.selectedName}>{item.konu_adi}</Text>
        </View>
        <Text style={styles.title}>İlgili Kategoriler</Text>
      </View>
      <View style={styles.flatListContainer}>
        <FlatList
          data={relatedCategories}
          renderItem={renderItem}
          keyExtractor={(item) => item.real_dewey_no}
          ListEmptyComponent={<Text>İlgili kategori bulunamadı.</Text>}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  flatListContainer: {
    height: SCREEN_HEIGHT * 0.7, // Ekran yüksekliğinin %70'i
    paddingHorizontal: 10,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e9e9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedDeweyNo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#4CAF50',
  },
  selectedName: {
    fontSize: 16,
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  categoryDeweyNo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#4CAF50',
  },
  categoryName: {
    fontSize: 14,
    flex: 1,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
});

export default DeweyDetailsScreen;