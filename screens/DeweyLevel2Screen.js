import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import config from './config';
//burası 645 gibi kategorilerden seçtiysek 111.5 112.6 113.7 gibi kategorilerin main olarak görüntülendiği sayfadır
const DeweyLevel2Screen = ({ route, navigation }) => {
  const { level1Category } = route.params;
  const [level2Categories, setLevel2Categories] = useState([]);
  const [selectedLevel2Category, setSelectedLevel2Category] = useState(null);
  const [level3Categories, setLevel3Categories] = useState([]);
  const [isLoadingLevel2, setIsLoadingLevel2] = useState(true);
  const [isLoadingLevel3, setIsLoadingLevel3] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLevel2Categories();
  }, []);

  const fetchLevel2Categories = async () => {
    setIsLoadingLevel2(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_URL}/api/dewey-level2/${level1Category.real_dewey_no}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setLevel2Categories(data);
      if (data.length > 0) {
        handleLevel2CategoryPress(data[0]);
      }
    } catch (error) {
      console.error('Level 2 kategoriler alınırken hata:', error);
      setError('Kategoriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoadingLevel2(false);
    }
  };

  const fetchLevel3Categories = async (deweyNo) => {
    setIsLoadingLevel3(true);
    try {
      const response = await fetch(`${config.API_URL}/api/dewey-level3/${deweyNo}`);
      if (response.status === 404) {
        setLevel3Categories([]);
        return;
      }
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setLevel3Categories(data);
    } catch (error) {
      console.error('Level 3 alt kategoriler alınırken hata:', error);
      setLevel3Categories([]);
    } finally {
      setIsLoadingLevel3(false);
    }
  };

  const handleLevel2CategoryPress = (category) => {
    setSelectedLevel2Category(category);
    fetchLevel3Categories(category.real_dewey_no);
  };

  const handleLevel3CategoryPress = (category) => {
    navigation.navigate('DeweyLevel3Screen', {
      level2Category: selectedLevel2Category,
      level3Category: category
    });
  };

  const renderLevel2CategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedLevel2Category?.real_dewey_no === item.real_dewey_no && styles.selectedCategoryItem
      ]}
      onPress={() => handleLevel2CategoryPress(item)}
    >
      <View style={styles.categoryItemContent}>
        <View>
          <Text style={styles.categoryNumber}>{item.real_dewey_no}</Text>
          <Text style={styles.categoryTitle}>{item.konu_adi}</Text>
        </View>
        {item.hasSubcategories && (
          <Text style={styles.subcategoryIndicator}>{'>>'}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderLevel3CategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subCategoryItem}
      onPress={() => handleLevel3CategoryPress(item)}
    >
      <Text style={styles.subCategoryNumber}>{item.real_dewey_no}</Text>
      <Text style={styles.subCategoryTitle}>{item.konu_adi}</Text>
    </TouchableOpacity>
  );

  if (isLoadingLevel2) {
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchLevel2Categories}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{level1Category.konu_adi} - Alt Kategoriler</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <FlatList
            data={level2Categories}
            renderItem={renderLevel2CategoryItem}
            keyExtractor={(item) => item.real_dewey_no}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
        <ScrollView style={styles.rightPanel}>
          {selectedLevel2Category && (
            <View>
              <Text style={styles.selectedTitle}>{selectedLevel2Category.konu_adi}</Text>
              <Text style={styles.selectedNumber}>{selectedLevel2Category.real_dewey_no}</Text>
              <Text style={styles.selectedDescription}>
                {selectedLevel2Category.aciklama || 'Açıklama bulunamadı.'}
              </Text>
              {selectedLevel2Category.not1 && (
                <Text style={styles.note}>Not 1: {selectedLevel2Category.not1}</Text>
              )}
              {selectedLevel2Category.not2 && (
                <Text style={styles.note}>Not 2: {selectedLevel2Category.not2}</Text>
              )}
              <Text style={styles.subCategoriesTitle}>Alt Kategoriler:</Text>
              {isLoadingLevel3 ? (
                <ActivityIndicator size="small" color="#3498db" />
              ) : level3Categories.length > 0 ? (
                <FlatList
                  data={level3Categories}
                  renderItem={renderLevel3CategoryItem}
                  keyExtractor={(item) => item.real_dewey_no}
                  numColumns={2}
                  columnWrapperStyle={styles.subCategoryRow}
                />
              ) : (
                <Text style={styles.noSubCategoriesText}>Bu kategoride alt kategori bulunmamaktadır.</Text>
              )}
            </View>
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
  note: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
    fontStyle: 'italic',
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
  categoryItem: {
    padding: 15,
    backgroundColor: '#fff',
  },
  selectedCategoryItem: {
    backgroundColor: '#e8f4fd',
  },
  categoryNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2980b9',
    marginBottom: 5,
  },
  categoryTitle: {
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
  subCategoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  subCategoryItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  noSubCategoriesText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subcategoryIndicator: {
    fontSize: 18,
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default DeweyLevel2Screen;