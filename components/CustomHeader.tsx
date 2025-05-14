import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { getWeekLabel, getPastWeeks } from '../utils/date'; // utils we’ll define

export default function CustomHeader() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekLabel = getWeekLabel(selectedDate);
  const pastWeeks = getPastWeeks(8); // 8 past weeks

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grocery List</Text>
      <Pressable onPress={() => setModalVisible(true)}>
        <Text style={styles.subtitle}>{weekLabel}</Text>
      </Pressable>

      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Select a Week</Text>
          <FlatList
            data={pastWeeks}
            keyExtractor={(item) => item.toISOString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)} style={styles.weekItem}>
                <Text>{getWeekLabel(item)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
  
const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      height: 56,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
    },
    subtitle: {
      fontSize: 12,
      color: '#888',
      marginTop: 2,
    },
    sheet: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      maxHeight: '70%',
    },
    sheetTitle: {
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 12,
    },
    weekItem: {
      paddingVertical: 10,
    },
  });
  
  