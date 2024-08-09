import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from 'react-native';

const API_URL = 'http://localhost:3000'; // Replace with your actual API URL

const DeweyNumbersScreen = () => {
  const [mainDeweyNumbers, setMainDeweyNumbers] = useState([]);
  const [selectedDewey, setSelectedDewey] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMainDeweyNumbers();
  }, []);

  const fetchMainDeweyNumbers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/main-dewey-numbers`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setMainDeweyNumbers(data);
    } catch (error) {
      console.error('Ana Dewey numaraları alınırken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeweyDetails = async (dewey_no) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dewey/details?dewey_no=${dewey_no}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSelectedDewey(data);
      setSelectedSubCategory(null);
      fetchSubCategories(data.dewey_no);
    } catch (error) {
      console.error('Dewey detayları alınırken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubCategories = async (deweyNo) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/subcategories/${deweyNo}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSubCategories(data);
    } catch (error) {
      console.error('Alt kategoriler alınırken hata:', error);
      setSubCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubCategoryPress = async (subCategory) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/dewey/details?dewey_no=${subCategory.real_dewey_no}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSelectedSubCategory(data);
    } catch (error) {
      console.error('Alt kategori detayları alınırken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDeweyItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deweyItem}
      onPress={() => fetchDeweyDetails(item.dewey_no)}
    >
      <Text style={styles.deweyNumber}>{item.dewey_no}</Text>
      <Text style={styles.deweyTitle}>{item.konu_adi}</Text>
    </TouchableOpacity>
  );

  const renderSubCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.subCategoryItem,
        selectedSubCategory?.real_dewey_no === item.real_dewey_no && styles.selectedSubCategoryItem
      ]}
      onPress={() => handleSubCategoryPress(item)}
    >
      <Text style={styles.subCategoryNumber}>{item.real_dewey_no}</Text>
      <Text style={styles.subCategoryTitle}>{item.konu_adi}</Text>
    </TouchableOpacity>
  );

  const displayedCategory = selectedSubCategory || selectedDewey;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dewey Onlu Sınıflama Sistemi</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <FlatList
            data={mainDeweyNumbers}
            renderItem={renderDeweyItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
        <ScrollView style={styles.rightPanel}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#3498db" />
          ) : displayedCategory ? (
            <View>
              <Text style={styles.selectedTitle}>{displayedCategory.konu_adi}</Text>
              <Text style={styles.selectedNumber}>{displayedCategory.dewey_no || displayedCategory.real_dewey_no}</Text>
              <Text style={styles.selectedDescription}>
                {displayedCategory.aciklama || 'Açıklama bulunamadı.'}
              </Text>
              {selectedDewey && (
                <View style={styles.subCategoriesContainer}>
                  <Text style={styles.subCategoriesTitle}>Alt Kategoriler:</Text>
                  <FlatList
                    data={subCategories}
                    renderItem={renderSubCategoryItem}
                    keyExtractor={(item) => item.real_dewey_no}
                    numColumns={2}
                    columnWrapperStyle={styles.subCategoryRow}
                  />
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noSelectionText}>Lütfen sol taraftan bir Dewey numarası seçin.</Text>
          )}
        </ScrollView>
      </View>
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
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: '30%',
    borderRightWidth: 1,
    borderRightColor: '#bdc3c7',
    backgroundColor: '#fff',
  },
  rightPanel: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  deweyItem: {
    padding: 15,
    backgroundColor: '#fff',
  },
  deweyNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2980b9',
    marginBottom: 5,
  },
  deweyTitle: {
    fontSize: 14,
    color: '#34495e',
  },
  separator: {
    height: 1,
    backgroundColor: '#ecf0f1',
  },
  selectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  selectedNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 20,
  },
  selectedDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    marginBottom: 20,
  },
  subCategoriesContainer: {
    marginTop: 20,
  },
  subCategoryItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '45%',
  },
  selectedSubCategoryItem: {
    backgroundColor: '#d4e6f1',
    borderColor: '#3498db',
    borderWidth: 1,
  },
  subCategoryNumber: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2980b9',
  },
  subCategoryTitle: {
    fontSize: 12,
    color: '#34495e',
  },
  subCategoryRow: {
    justifyContent: 'space-between',
  },
  subCategoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  subCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subCategoryButton: {
    backgroundColor: '#3498db',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    width: '47%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  subCategoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  subCategoryButtonSubText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  noSelectionText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default DeweyNumbersScreen;