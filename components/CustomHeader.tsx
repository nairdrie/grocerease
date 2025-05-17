import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import { getWeekLabel } from '../utils/date';
import { useWeek } from '../context/WeekContext';
import { getLists } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { isSameDay, startOfWeek } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, WeekList } from '../types/types';

export default function CustomHeader() {
  type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;
  const navigation = useNavigation<HomeNav>();

  const { selectedDate, setSelectedDate } = useWeek();
  const [lists, setLists] = useState<WeekList[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  const now = new Date();
  const thisWeek = startOfWeek(now, { weekStartsOn: 1 });
  const nextWeek = startOfWeek(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), { weekStartsOn: 1 });

  const allWeeks = [
    thisWeek,
    nextWeek,
    ...lists
      .map((l) => startOfWeek(new Date(l.weekStart), { weekStartsOn: 1 }))
      .filter(
        (date) =>
          !isSameDay(date, thisWeek) && !isSameDay(date, nextWeek)
      ),
  ]
    .filter((date, idx, arr) =>
      arr.findIndex((d) => isSameDay(d, date)) === idx
    )
    .sort((a, b) => b.getTime() - a.getTime()); // newest to oldest

  const weekLabel = getWeekLabel(selectedDate);

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    setModalVisible(false);

    const matched = lists.find((l) =>
      isSameDay(startOfWeek(new Date(l.weekStart), { weekStartsOn: 1 }), date)
    );

    if (matched?.id) {
      navigation.setParams({ listId: matched.id, weekStart: matched.weekStart });
    } else {
      navigation.setParams({ listId: undefined, weekStart: date.toISOString() });
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const fetched = await getLists();
        setLists(fetched);
  
        // Sort lists by newest weekStart first
        const sorted = [...fetched].sort(
          (a, b) =>
            new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
        );
  
        const mostRecent = sorted[0];
  
        if (mostRecent) {
          setSelectedDate(new Date(mostRecent.weekStart));
          navigation.setParams({
            listId: mostRecent.id,
            weekStart: mostRecent.weekStart, // ✅ pass this along too
          });
        } else {
          setSelectedDate(thisWeek);
          navigation.setParams({
            listId: undefined,
            weekStart: thisWeek.toISOString(), // ✅ fallback case
          });
        }
        
      } catch (err) {
        console.error('Failed to fetch lists:', err);
      }
    }
  
    init();
  }, []);
  

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Grocery List</Text>
      <Pressable onPress={() => setModalVisible(true)}>
        <Text style={styles.subtitle}>{weekLabel}</Text>
      </Pressable>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        backdropOpacity={0.4}
      >
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Select a Week</Text>
          <FlatList
            data={allWeeks}
            keyExtractor={(item) => item.toISOString()}
            renderItem={({ item }) => {
              const hasList = lists.some((l) =>
                isSameDay(startOfWeek(new Date(l.weekStart), { weekStartsOn: 1 }), item)
              );

              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  style={styles.weekItem}
                >
                  <View style={styles.weekRow}>
                    <View>
                      <Text style={styles.weekText}>{getWeekLabel(item)}</Text>
                      <Text style={styles.weekRange}>
                        {item.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(item.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    {/* {hasList && <Text style={styles.existsBadge}>✓</Text>} */}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 48,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#007AFF',
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
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekText: {
    fontSize: 16,
  },
  weekRange: {
    fontSize: 12,
    color: '#999',
  },
  existsBadge: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
