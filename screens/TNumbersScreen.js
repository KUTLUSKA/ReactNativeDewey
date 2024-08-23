import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, FlatList, ScrollView, StyleSheet, StatusBar, Linking } from 'react-native';
import config from './config';
import styles from '../img/globalStyles'

const TNumbersScreen = ({ route, navigation }) => {
  const [tTables, setTTables] = useState([]);
  const [selectedTTable, setSelectedTTable] = useState(null);
  const [selectedTEntry, setSelectedTEntry] = useState(null);
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
    setSelectedTEntry(null);
    fetchTEntries(tTable.tablo_no);
  };

  const handleTEntryPress = (tEntry) => {
    setSelectedTEntry(tEntry);
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
      style={[
        styles.tEntryItem,
        selectedTEntry?.tablo_no === item.tablo_no && styles.selectedTEntryItem
      ]}
      onPress={() => handleTEntryPress(item)}
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
            {selectedTEntry ? (
              <ScrollView>
                <Text style={styles.selectedTitle}>{selectedTEntry.konu_adi}</Text>
                <Text style={styles.selectedNumber}>{selectedTEntry.tablo_no}</Text>
                <Text style={styles.selectedDescription}>
                  {renderTextWithLinks(selectedTEntry.aciklama) || 'Açıklama bulunamadı.'}
                </Text>
                {selectedTEntry.not1 && (
                  <Text style={styles.note}>Not 1: {renderTextWithLinks(selectedTEntry.not1)}</Text>
                )}
                {selectedTEntry.not2 && (
                  <Text style={styles.note}>Not 2: {renderTextWithLinks(selectedTEntry.not2)}</Text>
                )}
              </ScrollView>
            ) : selectedTTable ? (
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

export default TNumbersScreen;