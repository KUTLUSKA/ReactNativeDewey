import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import config from './config';

const DeweyLevel1Screen = ({ route, navigation }) => {
  const { mainCategory } = route.params;
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [level2SubCategories, setLevel2SubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLevel2, setIsLoadingLevel2] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_URL}/api/dewey-level1/${mainCategory.dewey_no}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSubCategories(data);
    } catch (error) {
      console.error('Alt kategoriler alınırken hata:', error);
      setError('Alt kategoriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLevel2SubCategories = async (deweyNo) => {
    setIsLoadingLevel2(true);
    try {
      const response = await fetch(`${config.API_URL}/api/dewey-level2/${deweyNo}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Alt kategorileri kontrol et ve işaretle
      const markedData = await Promise.all(data.map(async (category) => {
        const hasSubcategories = await checkForSubcategories(category.real_dewey_no);
        return { ...category, hasSubcategories };
      }));
      
      setLevel2SubCategories(markedData);
    } catch (error) {
      console.error('Level 2 alt kategoriler alınırken hata:', error);
      setLevel2SubCategories([]);
    } finally {
      setIsLoadingLevel2(false);
    }
  };

  const checkForSubcategories = async (deweyNo) => {
    try {
      const response = await fetch(`${config.API_URL}/api/dewey-level3/${deweyNo}`);
      if (response.status === 200) {
        const data = await response.json();
        return data.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Alt kategori kontrolü sırasında hata:', error);
      return false;
    }
  };

  const handleSubCategoryPress = (subCategory) => {
    setSelectedSubCategory(subCategory);
    fetchLevel2SubCategories(subCategory.real_dewey_no);
  };

  const handleLevel2Press = (level2Category) => {
    navigation.navigate('DeweyLevel2', { 
      level1Category: selectedSubCategory,
      level2Category: level2Category
    });
  };

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

  const renderLevel2SubCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.level2Item}
      onPress={() => handleLevel2Press(item)}
    >
      <View style={styles.level2ItemContent}>
        <Text style={styles.level2Number}>{item.real_dewey_no}</Text>
        {item.hasSubcategories && <Text style={styles.subcategoryIndicator}>{'>>'}</Text>}
      </View>
      <Text style={styles.level2Title}>{item.konu_adi}</Text>
    </TouchableOpacity>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchSubCategories}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{mainCategory.konu_adi} - Alt Kategoriler</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <FlatList
            data={subCategories}
            renderItem={renderSubCategoryItem}
            keyExtractor={(item) => item.real_dewey_no}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
        <ScrollView style={styles.rightPanel}>
          {selectedSubCategory ? (
            <View>
              <Text style={styles.selectedTitle}>{selectedSubCategory.konu_adi}</Text>
              <Text style={styles.selectedNumber}>{selectedSubCategory.real_dewey_no}</Text>
              <Text style={styles.selectedDescription}>
                {selectedSubCategory.aciklama || 'Açıklama bulunamadı.'}
              </Text>
              <Text style={styles.level2Title}>Alt Kategoriler:</Text>
              {isLoadingLevel2 ? (
                <ActivityIndicator size="small" color="#3498db" />
              ) : (
                <FlatList
                  data={level2SubCategories}
                  renderItem={renderLevel2SubCategoryItem}
                  keyExtractor={(item) => item.real_dewey_no}
                  numColumns={2}
                  columnWrapperStyle={styles.subCategoryRow}
                  ListEmptyComponent={<Text style={styles.noLevel2Text}>Alt kategori bulunamadı.</Text>}
                />
              )}
            </View>
          ) : (
            <Text style={styles.noSelectionText}>Lütfen sol taraftan bir alt kategori seçin.</Text>
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
  selectedDeweyItem: {
    backgroundColor: '#e8f4fd',
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
  subCategoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  subCategoryRow: {
    justifyContent: 'space-between',
  },
  subCategoryItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '47%',
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
  noSubCategoriesText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  noSelectionText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
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
  },level2ItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryIndicator: {
    marginLeft: 5,
    color: '#3498db',
    fontWeight: 'bold',
  },
  level2Item: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '47%',
  },
  level2Number: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2980b9',
  },
  level2Title: {
    fontSize: 12,
    color: '#34495e',
  },
  subCategoryRow: {
    justifyContent: 'space-between',
  },
});

export default DeweyLevel1Screen;