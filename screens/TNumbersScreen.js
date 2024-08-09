import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TNumbersScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Dewey Sayıları Ekranı</Text>
      {/* Dewey sayıları ile ilgili içerik buraya gelecek */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TNumbersScreen;