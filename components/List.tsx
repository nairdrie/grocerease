import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { isSameDay, startOfWeek } from 'date-fns';
import { Item, RootStackParamList, WeekList } from '../types/types';
import { createList, getList, getLists, updateList } from '../lib/api'
import { LexoRank } from 'lexorank';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function List() {
  type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;
  const navigation = useNavigation<HomeNav>();
  type HomeRouteProp = RouteProp<RootStackParamList, 'Home'>;
  const route = useRoute<HomeRouteProp>();
  const listId = route.params?.listId;
  const weekStart = route.params?.weekStart;

  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const [items, setItems] = useState<Item[]>([]);
  const [editingId, setEditingId] = useState<string>(''); // instead of null

  useEffect(() => {
    async function fetchList() {
      if (!weekStart) {
        console.warn('No weekStart provided. Cannot create or fetch list.');
        return;
      }
  
      const normalizedWeekStart = startOfWeek(new Date(weekStart), { weekStartsOn: 1 }).toISOString();
  
      // ✅ Try to fetch the list if we have an ID
      if (listId) {
        try {
          const data = await getList(listId);
          const rawItems = Array.isArray(data.items) ? data.items : [];
  
          const withOrder = rawItems.map((item: Item) => ({
            ...item,
            order: item.order ?? LexoRank.middle().genNext().toString(),
          }));
  
          withOrder.sort((a: Item, b: Item) => a.order.localeCompare(b.order));
          setItems(withOrder);
          setEditingId(withOrder[0]?.id ?? '');
  
          setTimeout(() => {
            inputRefs.current[withOrder[0]?.id || '']?.focus();
          }, 50);
          return;
        } catch {
          console.warn(`Invalid listId. Falling back to create.`);
          // fall through
        }
      }
  
      // 🧠 Create only if we don’t already have a list for this week
      const existingLists: WeekList[] = await getLists();
      const existing = existingLists.find(l =>
        isSameDay(new Date(l.weekStart), new Date(normalizedWeekStart))
      );
  
      if (existing) {
        navigation.setParams({
          listId: existing.id,
          weekStart: existing.weekStart
        });
        return;
      }
  
      // ✳️ Create new list
      const created = await createList(normalizedWeekStart);
      setItems([]);
      setEditingId('');
      navigation.setParams({
        listId: created.id,
        weekStart: created.weekStart
      });
    }
  
    fetchList();
  }, [listId, weekStart]);
  
  
  
  useEffect(() => {
    if (!listId || items.length === 0) return;
  
    const timeout = setTimeout(() => {
      updateList(listId, { items }).catch((err) => {
        console.error('Error saving list:', err);
      });
    }, 300)
  
    return () => clearTimeout(timeout)
  }, [items, listId]);
  

  const assignRef = useCallback(
    (id: string) => (ref: TextInput | null) => {
      inputRefs.current[id] = ref;
    },
    []
  );

  const updateItemText = (id: string, text: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, text } : item))
    );
  };

  const toggleCheck = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addItemAfter = (id: string) => {
    const index = items.findIndex(i => i.id === id)
    if (index === -1) return
  
    const current = LexoRank.parse(items[index].order)
    const next = items[index + 1]
      ? LexoRank.parse(items[index + 1].order)
      : current.genNext()
  
    const newItem: Item = {
      id: crypto.randomUUID(),
      text: '',
      checked: false,
      order: current.between(next).toString(),
    }
  
    const updated = [...items]
    updated.splice(index + 1, 0, newItem)
    setItems(updated)
    setEditingId(newItem.id)
  
    setTimeout(() => {
      inputRefs.current[newItem.id]?.focus()
    }, 50)
  }

  const reRankItems = (data: Item[]) => {
    let rank = LexoRank.middle()
    return data.map(item => {
      const updated = { ...item, order: rank.toString() }
      rank = rank.genNext()
      return updated
    })
  }
  
  const deleteItem = (id: string) => {
    if (items.length === 1) {
      const newItem = { id: Date.now().toString(), text: '', checked: false, order: LexoRank.middle().toString() };
      setItems([newItem]);
      setEditingId(newItem.id); // <- use the new item's ID
      return;
    }
  
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return;
  
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  
    const nextId = updated[Math.max(0, index - 1)]?.id;
    setEditingId(nextId);
  };
  

  const renderItem = ({ item, drag }: RenderItemParams<Item>) => {
    const isEditing = item.id === editingId;
  
    return (
      <View style={styles.itemRow}>
        <Pressable
          onPressIn={drag}
          style={styles.dragHandle}
          hitSlop={10} // adds extra 10px padding around the touch area
        >
          <Text style={styles.dragIcon}>≡</Text>
        </Pressable>

  
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleCheck(item.id)}
        >
          {item.checked ? <Text>✓</Text> : null}
        </TouchableOpacity>
  
        <TextInput
          ref={assignRef(item.id)}
          value={item.text}
          style={[styles.editInput, item.checked && styles.checked]}
          onChangeText={text => updateItemText(item.id, text)}
          onFocus={() => setEditingId(item.id)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace' && item.text === '') {
              const index = items.findIndex(i => i.id === item.id);
          
              if (index === 0) {
                // Don't delete the first item, just keep focus
                return;
              }
          
              const prevItem = items[index - 1];
              deleteItem(item.id);
          
              setTimeout(() => {
                if (prevItem) {
                  inputRefs.current[prevItem.id]?.focus();
                }
              }, 50);
            }
          }}          
          onSubmitEditing={() => addItemAfter(item.id)}
          blurOnSubmit={false}
          returnKeyType="done"
        />
  
  {isEditing && (
  <TouchableOpacity
    onPress={() => {
      // Blur the input and allow the system to fully process it
      inputRefs.current[item.id]?.blur();
      // Schedule delete for the next frame
      setTimeout(() => deleteItem(item.id), 0);
    }}
    style={styles.clearButton}
  >
    <Text style={styles.clearText}>✕</Text>
  </TouchableOpacity>
)}

      </View>
    );
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <DraggableFlatList
        data={items.slice().sort((a, b) => a.order.localeCompare(b.order))}
        onDragEnd={({ data }) => {
          const reRanked = reRankItems(data)
          setItems(reRanked)
        }}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        scrollEnabled={false} // optional
      />

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,              // bump this up a bit if needed
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  dragIcon: {
    fontSize: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  editInput: {
    fontSize: 16,
    flex: 1,
    paddingVertical: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}),
  },
  checked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  clearText: {
    fontSize: 16,
    color: '#999',
  },
});
