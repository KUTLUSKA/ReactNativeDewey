import { StyleSheet } from 'react-native';

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
  tTableItem: {
    padding: 15,
    backgroundColor: '#fff',
  },
  selectedTTableItem: {
    backgroundColor: '#e0f2f1',
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
  tEntryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tEntryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  tEntryNumber: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 5,
  },
  tEntryDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  tEntryDetails: {
    fontSize: 14,
    color: '#34495e',
  },
  tableInfo: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  tableInfoText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
  },
  tableInfoDescription: {
    fontSize: 14,
    color: '#7f8c8d',
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
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
  },
  selectedEntryItem: {
    backgroundColor: '#3498db',
  },
  rightTopPanel: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
  },
  rightBottomPanel: {
    flex: 1,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedNumber: {
    fontSize: 16,
    marginBottom: 5,
  },
  selectedDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  selectedDetails: {
    fontSize: 14,
  },
});


export default styles;