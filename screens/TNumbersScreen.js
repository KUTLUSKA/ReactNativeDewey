import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import config from './config';

const TNumbersScreen = ({ navigation }) => {
  const [mainTTables, setMainTTables] = useState([]);
  const [selectedTTable, setSelectedTTable] = useState(null);
  const [tTableEntries, setTTableEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMainTTables();
  }, []);

  const fetchMainTTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_URL}/api/t-tables`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log('Main T Tables:', data);
      setMainTTables(data);
    } catch (error) {
      console.error('T tabloları alınırken hata:', error);
      setError('T tabloları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTTableEntries = async (tableNumber) => {
    setIsLoadingEntries(true);
    setError(null);
    try {
      const response = await fetch(`${config.API_URL}/api/t-tables/${tableNumber}/entries`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log(`T Table ${tableNumber} Entries:`, data);
      setTTableEntries(data);
    } catch (error) {
      console.error(`T Tablo ${tableNumber} girişleri alınırken hata:`, error);
      setError(`T Tablo ${tableNumber} girişleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.`);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleTTablePress = (tTable) => {
    setSelectedTTable(tTable);
    fetchTTableEntries(tTable.tablo_no);
  };

  const renderTTableItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tTableItem,
        selectedTTable?.id === item.id && styles.selectedTTableItem
      ]}
      onPress={() => handleTTablePress(item)}
    >
      <Text style={styles.tTableNumber}>{item.tablo_no}</Text>
      <Text style={styles.tTableTitle}>{item.konu_adi}</Text>
    </TouchableOpacity>
  );

  const renderTTableEntryItem = ({ item }) => (
    <View style={styles.tTableEntryItem}>
      <Text style={styles.tTableEntryNumber}>
        {`${item.g1 || ''}${item.g2 ? '.' + item.g2 : ''}${item.g3 ? '.' + item.g3 : ''}${item.g4 ? '.' + item.g4 : ''}${item.g5 ? '.' + item.g5 : ''}${item.g6 ? '.' + item.g6 : ''}${item.g7 ? '.' + item.g7 : ''}`}
      </Text>
      <Text style={styles.tTableEntryTitle}>{item.konu_adi}</Text>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchMainTTables}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <FlatList
            data={mainTTables}
            renderItem={renderTTableItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
        <View style={styles.rightPanel}>
          {selectedTTable ? (
            <View>
              <Text style={styles.selectedTitle}>{selectedTTable.konu_adi}</Text>
              <Text style={styles.selectedNumber}>{selectedTTable.tablo_no}</Text>
              {selectedTTable.aciklama && (
                <Text style={styles.selectedDescription}>
                  {selectedTTable.aciklama}
                </Text>
              )}
              <Text style={styles.subEntriesTitle}>Alt Girişler:</Text>
              {isLoadingEntries ? (
                <ActivityIndicator size="small" color="#3498db" />
              ) : (
                <FlatList
                  data={tTableEntries}
                  renderItem={renderTTableEntryItem}
                  keyExtractor={(item) => item.id.toString()}
                  ListEmptyComponent={() => <Text style={styles.noEntriesText}>Alt giriş bulunamadı.</Text>}
                />
              )}
            </View>
          ) : (
            <Text style={styles.noSelectionText}>Lütfen sol taraftan bir T tablosu seçin.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
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
  tTableItem: {
    padding: 15,
    backgroundColor: '#fff',
  },
  selectedTTableItem: {
    backgroundColor: '#e8f4fd',
  },
  tTableNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2980b9',
    marginBottom: 5,
  },
  tTableTitle: {
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
  subEntriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  tTableEntryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tTableEntryNumber: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2980b9',
  },
  tTableEntryTitle: {
    fontSize: 14,
    color: '#34495e',
    marginTop: 5,
  },
  tTableEntryDescription: {
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
  noSelectionText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noEntriesText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default TNumbersScreen;