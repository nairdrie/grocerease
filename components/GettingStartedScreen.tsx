import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; 

const stores = [
  { id: '1', name: 'Walmart' },
  { id: '2', name: 'Costco' },
  { id: '3', name: 'Loblaws' },
  { id: '4', name: 'No Frills' },
  { id: '5', name: 'Whole Foods' },
];

export default function GettingStartedScreen() {
  const navigation = useNavigation();

  const handleSelect = (storeName: string) => {
    console.log(`Selected: ${storeName}`);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Grocerease</Text>
      <Text style={styles.subHeader}>Where do you shop?</Text>

      <FlatList
        data={stores}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.tileWrapper}>
            <TouchableOpacity
              style={styles.tile}
              onPress={() => handleSelect(item.name)}
            >
              <Text style={styles.tileText}>{item.name}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.skipButton}>
        <Button title="Skip for now" onPress={() => navigation.navigate('Home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fc', paddingTop: 60 },
  header: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  subHeader: { fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#555' },
  grid: { paddingHorizontal: 20 },
  tileWrapper: { flexBasis: '48%', margin: '1%' },
  tile: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tileText: { fontSize: 16, fontWeight: '600' },
  skipButton: { padding: 20, alignItems: 'center' },
});
