import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';

const API_URL = 'http://localhost:3000'; // Kendi IP adresinizi buraya yazın

const DeweyNumbersScreen = () => {
  const [mainDeweyNumbers, setMainDeweyNumbers] = useState([]);
  const [selectedDewey, setSelectedDewey] = useState(null);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    fetchMainDeweyNumbers();
  }, []);

  const fetchMainDeweyNumbers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/main-dewey-numbers`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setMainDeweyNumbers(data);
    } catch (error) {
      console.error('Ana Dewey numaraları alınırken hata:', error);
    }
  };

  const fetchDeweyDetails = async (dewey_no) => {
    try {
      const response = await fetch(`${API_URL}/api/dewey/details?dewey_no=${dewey_no}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSelectedDewey(data);
      console.log("Fetching sub categories for:", dewey_no);
      fetchSubCategories(dewey_no);
    } catch (error) {
      console.error('Dewey detayları alınırken hata:', error);
    }
  };

  const fetchSubCategories = async (mainCategory) => {
    console.log("Fetching sub categories for main category:", mainCategory);
    try {
      const response = await fetch(`${API_URL}/api/subcategories?mainCategory=${mainCategory}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log("Sub categories data:", data);
      setSubCategories(data);
    } catch (error) {
      console.error('Alt kategoriler alınırken hata:', error);
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

  const renderSubCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={styles.subCategoryButton}
      onPress={() => fetchDeweyDetails(item.dewey_no)}
    >
      <Text style={styles.subCategoryButtonText}>{item.dewey_no} - {item.konu_adi}</Text>
    </TouchableOpacity>
  );

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
          {selectedDewey ? (
            <View>
              <Text style={styles.selectedTitle}>{selectedDewey.konu_adi}</Text>
              <Text style={styles.selectedNumber}>{selectedDewey.dewey_no}</Text>
              <Text style={styles.selectedDescription}>
                {selectedDewey.aciklama || 'Açıklama bulunamadı.'}
              </Text>
              <View style={styles.subCategoriesContainer}>
                <Text style={styles.subCategoriesTitle}>Alt Kategoriler:</Text>
                <View style={styles.subCategoriesGrid}>
                    {subCategories.length > 0 ? (
                    subCategories.map((item) => (
                        <TouchableOpacity
                        key={item.dewey_no}
                        style={styles.subCategoryButton}
                        onPress={() => fetchDeweyDetails(item.dewey_no)}
                        >
                        <Text style={styles.subCategoryButtonText}>{item.dewey_no}</Text>
                        <Text style={styles.subCategoryButtonSubText}>{item.konu_adi}</Text>
                        </TouchableOpacity>
                    ))
                    ) : (
                    <Text>Alt kategori bulunamadı.</Text>
                    )}
                </View>
            </View>
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