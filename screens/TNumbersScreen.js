import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, FlatList, ScrollView, StyleSheet, StatusBar, Linking } from 'react-native';
import config from './config';

const TNumbersScreen = ({ route, navigation }) => {
  const [tTables, setTTables] = useState([]);
  const [selectedTTable, setSelectedTTable] = useState(null);
  const [tEntries, setTEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (error) {
      console.error('T tabloları alınırken hata:', error);
      setError('T tabloları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTEntries = async (tableNumber) => {
    setIsLoadingEntries(true);
    try {
      const response = await fetch(`${config.API_URL}/api/t-tables/${tableNumber}-entries`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setTEntries(data);
    } catch (error) {
      console.error(`Error fetching ${tableNumber} entries:`, error);
      setError(`${tableNumber} girişleri yüklenirken hata oluştu.`);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleTTablePress = (tTable) => {
    setSelectedTTable(tTable);
    fetchTEntries(tTable.tablo_no);
  };

  const renderTextWithLinks = (text) => {
    if (!text) return null;
  
    const linkRegex = /<a href='(http:\/\/www\.verinova\.com\.tr\/\?page_id=415\/#\w+)' target='_blank'>(.*?)<\/a>/g;
    const directLinkRegex = /http:\/\/www\.verinova\.com\.tr\/\?page_id=415\/#\w+/g;
  
    let parts = [];
    let lastIndex = 0;
    let match;
  
    const processMatch = (match) => {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
  
      parts.push(
        <Text
          key={match[1]}
          style={styles.link}
          onPress={() => Linking.openURL(match[1])}
        >
          {match[2]}
        </Text>
      );
  
      lastIndex = match.index + match[0].length;
    };
  
    while ((match = linkRegex.exec(text)) !== null) {
      processMatch(match);
    }
  
    let directLinkMatch;
    while ((directLinkMatch = directLinkRegex.exec(text)) !== null) {
      if (!text.substring(directLinkMatch.index - 15, directLinkMatch.index).includes('<a ')) {
        if (directLinkMatch.index > lastIndex) {
          parts.push(text.substring(lastIndex, directLinkMatch.index));
        }
  
        parts.push(
          <Text
            key={directLinkMatch[0]}
            style={styles.link}
            onPress={() => Linking.openURL(directLinkMatch[0])}
          >
            Kılavuz
          </Text>
        );
  
        lastIndex = directLinkMatch.index + directLinkMatch[0].length;
      }
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
  
    return parts;
  };

  const renderTTableItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tTableItem,
        selectedTTable?.tablo_no === item.tablo_no && styles.selectedTTableItem
      ]}
      onPress={() => handleTTablePress(item)}
    >
      <Text style={styles.tTableNumber}>{item.tablo_no}</Text>
      <Text style={styles.tTableTitle}>{item.konu_adi}</Text>
    </TouchableOpacity>
  );

  const renderTEntryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tEntryItem}
      onPress={() => {/* Navigate to detail screen if needed */}}
    >
      <View style={styles.tEntryItemContent}>
        <Text style={styles.tEntryNumber}>{item.tablo_no}</Text>
      </View>
      <Text style={styles.tEntryTitle}>{item.konu_adi}</Text>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchTTables}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>T Tabloları</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <FlatList
            data={tTables}
            renderItem={renderTTableItem}
            keyExtractor={(item) => item.tablo_no}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
        <View style={styles.rightPanel}>
          <View style={styles.rightTopPanel}>
            {selectedTTable ? (
              <ScrollView>
                <Text style={styles.selectedTitle}>{selectedTTable.konu_adi}</Text>
                <Text style={styles.selectedNumber}>{selectedTTable.tablo_no}</Text>
                <Text style={styles.selectedDescription}>
                  {renderTextWithLinks(selectedTTable.aciklama) || 'Açıklama bulunamadı.'}
                </Text>
                {selectedTTable.not1 && (
                  <Text style={styles.note}>Not 1: {renderTextWithLinks(selectedTTable.not1)}</Text>
                )}
                {selectedTTable.not2 && (
                  <Text style={styles.note}>Not 2: {renderTextWithLinks(selectedTTable.not2)}</Text>
                )}
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
                    keyExtractor={(item) => item.tablo_no}
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
    backgroundColor: '#fff',
  },
  rightTopPanel: {
    flex: 1,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
  },
  rightBottomPanel: {
    flex: 1,
    padding: 20,
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
  note: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  entriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  entryRow: {
    justifyContent: 'space-between',
  },
  tEntryItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '47%',
  },
  tEntryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tEntryNumber: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2980b9',
  },
  tEntryTitle: {
    fontSize: 12,
    color: '#34495e',
  },
  noEntriesText: {
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
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default TNumbersScreen;