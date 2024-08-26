import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, FlatList, ScrollView, StyleSheet, StatusBar } from 'react-native';
import config from './config';

const TNumbersScreen = ({ route, navigation }) => {
  const [tTables, setTTables] = useState([]);
  const [selectedTTable, setSelectedTTable] = useState(null);
  const [selectedTEntry, setSelectedTEntry] = useState(null);
  const [tEntries, setTEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(0);
  const [navigationStack, setNavigationStack] = useState([]);

  useEffect(() => {
    fetchTTables();
  }, []);

  const fetchTTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_URL}/api/t-tables`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setTTables(data);
      setLevel(0);
      setNavigationStack([]);
    } catch (error) {
      console.error('T tabloları alınırken hata:', error);
      setError('T tabloları yüklenemedi. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTEntries = async (tableNumber, category = null, level = 0) => {
    setIsLoadingEntries(true);
    try {
      let endpoint = `${config.API_URL}/api/t-tables/${tableNumber}-entries`;
      
      if (tableNumber === 'T1' && level === 1) {
        endpoint = `${config.API_URL}/api/t-tables/T1-subcategories/${category}`;
      } else if (tableNumber === 'T1' && level === 2) {
        endpoint = `${config.API_URL}/api/t-tables/T1-level2/${category}`;
      } else if (category) {
        endpoint = `${config.API_URL}/api/t-tables/${tableNumber}-subcategories/${category}`;
      }
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      setTEntries(data.map(item => ({
        ...item,
        tablo_no: item.tablo_no || item.g1 || 'N/A'
      })));
    } catch (error) {
      console.error(`Error fetching ${tableNumber} entries:`, error);
      setError(`${tableNumber} girişleri yüklenirken hata oluştu.`);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleTTablePress = (tTable) => {
    setSelectedTTable(tTable);
    setSelectedTEntry(null);
    fetchTEntries(tTable.tablo_no);
    setLevel(0);
    setNavigationStack([tTable]);
  };

  const handleTEntryPress = (tEntry) => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setSelectedTEntry(tEntry);
    
    if (newLevel === 1 || newLevel === 2) {
      setTTables(tEntries.map(item => ({
        ...item,
        tablo_no: item.tablo_no || item.g1 || 'N/A'
      })));
    }
    
    fetchTEntries(selectedTTable.tablo_no, tEntry.tablo_no, newLevel);
    setNavigationStack([...navigationStack, tEntry]);
  };

  const handleBackPress = () => {
    if (level > 0) {
      const newLevel = level - 1;
      setLevel(newLevel);
      const newStack = navigationStack.slice(0, -1);
      setNavigationStack(newStack);
      
      if (newLevel === 0) {
        fetchTTables();
      } else {
        const parentEntry = newStack[newStack.length - 1];
        fetchTEntries(selectedTTable.tablo_no, parentEntry.tablo_no, newLevel);
        setTTables(tEntries.map(item => ({
          ...item,
          tablo_no: item.tablo_no || item.g1 || 'N/A'
        })));
      }
    }
  };

  const handleInspectPress = (tEntry, event) => {
    event.stopPropagation();  // Prevent the outer TouchableOpacity from being triggered
    setSelectedTEntry(tEntry);
  };

  const renderTTableItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tTableItem,
        selectedTTable?.tablo_no === item.tablo_no && styles.selectedTTableItem
      ]}
      onPress={() => handleTTablePress(item)}
    >
      <Text style={styles.tTableNumber}>{item.tablo_no || item.g1 || 'N/A'}</Text>
      <Text style={styles.tTableTitle}>{item.konu_adi}</Text>
    </TouchableOpacity>
  );

  const renderTEntryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.tEntryItem,
        selectedTEntry?.tablo_no === item.tablo_no && styles.selectedTEntryItem
      ]}
      onPress={() => handleTEntryPress(item)}
    >
      <View style={styles.tEntryItemContent}>
        <Text style={styles.tEntryNumber}>{item.tablo_no || item.g1 || 'N/A'}</Text>
        <Text style={styles.tEntryTitle} numberOfLines={2} ellipsizeMode="tail">{item.konu_adi}</Text>
      </View>
      <TouchableOpacity 
        style={styles.inspectButton}
        onPress={(event) => handleInspectPress(item, event)}
      >
        <Text style={styles.inspectButtonText}>İncele</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTTables}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>T Tabloları</Text>
        {level > 0 && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
        )}
      </View>
      {renderErrorMessage()}
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <FlatList
            data={tTables}
            renderItem={renderTTableItem}
            keyExtractor={(item, index) => `${item.tablo_no}-${index}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
        <View style={styles.rightPanel}>
          <View style={styles.rightTopPanel}>
            {selectedTEntry ? (
              <ScrollView>
                <Text style={styles.selectedTitle}>{selectedTEntry.konu_adi}</Text>
                <Text style={styles.selectedNumber}>{selectedTEntry.tablo_no || selectedTEntry.g1 || 'N/A'}</Text>
                <Text style={styles.selectedDescription}>
                  {selectedTEntry.aciklama || 'Açıklama bulunamadı.'}
                </Text>
              </ScrollView>
            ) : selectedTTable ? (
              <ScrollView>
                <Text style={styles.selectedTitle}>{selectedTTable.konu_adi}</Text>
                <Text style={styles.selectedNumber}>{selectedTTable.tablo_no}</Text>
                <Text style={styles.selectedDescription}>
                  {selectedTTable.aciklama || 'Açıklama bulunamadı.'}
                </Text>
              </ScrollView>
            ) : (
              <Text style={styles.noSelectionText}>Lütfen sol taraftan bir T tablosu seçin.</Text>
            )}
          </View>
          <View style={styles.rightBottomPanel}>
            {selectedTTable && (
              <View>
                <Text style={styles.entriesTitle}>Girişler:</Text>
                {isLoadingEntries ? (
                  <ActivityIndicator size="small" color="#3498db" />
                ) : (
                  <FlatList
                    data={tEntries}
                    renderItem={renderTEntryItem}
                    keyExtractor={(item, index) => `${item.tablo_no}-${index}`}
                    numColumns={2}
                    columnWrapperStyle={styles.entryRow}
                    ListEmptyComponent={<Text style={styles.noEntriesText}>Giriş bulunamadı.</Text>}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#34495e',
    padding: 8,
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  rightPanel: {
    flex: 2,
  },
  rightTopPanel: {
    flex: 1,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rightBottomPanel: {
    flex: 2,
    padding: 15,
  },
  tTableItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedTTableItem: {
    backgroundColor: '#e6f3ff',
  },
  tTableNumber: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tTableTitle: {
    fontSize: 14,
  },
  tEntryItem: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  selectedTEntryItem: {
    backgroundColor: '#e6f3ff',
  },
  tEntryItemContent: {
    flex: 1,
  },
  tEntryNumber: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tEntryTitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  inspectButton: {
    backgroundColor: '#3498db',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  inspectButtonText: {
    color: 'white',
    fontSize: 12,
  },
  entryRow: {
    justifyContent: 'space-between',
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedNumber: {
    fontSize: 16,
    marginBottom: 10,
  },
  selectedDescription: {
    fontSize: 14,
  },
  noSelectionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noEntriesText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: '#ffcccc',
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#3498db',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
});

export default TNumbersScreen;