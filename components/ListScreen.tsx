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
  Alert,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { isSameDay, startOfWeek } from 'date-fns';
import { Item, RootStackParamList, WeekList, Meal } from '../types/types';
import { categorizeList, createList, getList, getLists, listenToList, updateList, suggestIngredients } from '../lib/api'
import MealsView from './MealsView';
import { LexoRank } from 'lexorank';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import uuid from 'react-native-uuid'

export default function ListScreen() {
  type ListNav = NativeStackNavigationProp<RootStackParamList, 'ListScreen'>;
  const navigation = useNavigation<ListNav>();
  type ListRouteProp = RouteProp<RootStackParamList, 'ListScreen'>;
  const route = useRoute<ListRouteProp>();
  const { groupId, listId, weekStart } = route.params

  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const [items, setItems] = useState<Item[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [editingId, setEditingId] = useState<string>(''); // instead of null
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  const [isCategorizing, setIsCategorizing] = useState(false);
  const [viewMode, setViewMode] = useState<'ingredients' | 'meals'>('ingredients');


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
          const data = await getList(groupId, listId);
          const rawItems = Array.isArray(data.items) ? data.items : [];
          const rawMeals = Array.isArray(data.meals) ? data.meals : [];
  
          const withOrder = rawItems.map((item: Item) => ({
            ...item,
            order: item.order ?? LexoRank.middle().genNext().toString(),
          }));
  
          withOrder.sort((a: Item, b: Item) => a.order.localeCompare(b.order));
          setItems(withOrder);
          setMeals(rawMeals);
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
      const existingLists: WeekList[] = await getLists(groupId);
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
      const created = await createList(groupId, normalizedWeekStart);
      setItems([]);
      setEditingId('');
      navigation.setParams({
        listId: created.id,
        weekStart: created.weekStart
      });
    }
  
    fetchList();
  }, [groupId,  listId, weekStart]);
  
  
  
  useEffect(() => {
    if (!listId) return;
  
    const timeout = setTimeout(() => {
      updateList(groupId, listId, { items, meals }).catch((err) => {
        console.error('Error saving list:', err);
      });
    }, 300)
  
    return () => clearTimeout(timeout)
  }, [groupId, items, meals, listId]);

  useEffect(() => {
    if (!listId) return;
  
    const unsubscribe = listenToList(
      groupId,
      listId,
      (data: WeekList) => {
        setItems((prev) => {
          if (!Array.isArray(data.items)) return prev;
          const incoming = JSON.stringify(data.items);
          const current = JSON.stringify(prev);
          return current !== incoming ? data.items : prev;
        });
        if (data.meals) {
          setMeals((prev) => {
            const incoming = JSON.stringify(data.meals);
            const current = JSON.stringify(prev);
            return current !== incoming ? data.meals : prev;
          });
        }
      },
      (err: any) => {
        console.error('Stream closed or failed:', err);
      }
    );
  
    return () => {
      unsubscribe();
    };
  }, [groupId, listId]);
  
  
  

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
    setMeals(prev =>
        prev.map(meal =>
            meal.id === id ? {...meal, name: text} : meal
        )
    )
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
      id: uuid.v4() as string,
      text: '',
      checked: false,
      order: current.between(next).toString(),
      isSection: false,
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
      const newItem = { id: Date.now().toString(), text: '', checked: false, order: LexoRank.middle().toString(), isSection: false };
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

  const handleAutoCategorize = async () => {
    if (!listId) return;
    setIsCategorizing(true);
    try {
      const newItems = await categorizeList(groupId, listId);
      setItems(newItems);
      // (optional) clear any “editing” flags
      setEditingId('');
    } catch (err) {
      console.error('Auto-categorization failed', err);
    } finally {
      setIsCategorizing(false);
    }
  };

  const addMeal = () => {
    const newMeal: Meal = {
      id: uuid.v4() as string,
      name: 'New Meal',
      items: [],
    };
    setMeals(prev => [...prev, newMeal]);
  };

  const deleteMeal = (mealId: string) => {
    const mealToDelete = meals.find(meal => meal.id === mealId);
    if (mealToDelete) {
      setItems(prev => [...prev, ...mealToDelete.items]);
    }
    setMeals(prev => prev.filter(meal => meal.id !== mealId));
  };

  const handleSuggestIngredients = async (mealId: string) => {
    if (!listId) return;
    try {
      const suggestedItems = await suggestIngredients(groupId, mealId);
      Alert.alert(
        'Suggested Ingredients',
        suggestedItems.map(item => item.text).join('\n'),
        [
          {
            text: 'Add to meal',
            onPress: () => {
              setMeals(prevMeals =>
                prevMeals.map(meal => {
                  if (meal.id === mealId) {
                    return {
                      ...meal,
                      items: [...meal.items, ...suggestedItems],
                    };
                  }
                  return meal;
                })
              );
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error suggesting ingredients:', error);
      Alert.alert('Error', 'Could not suggest ingredients.');
    }
  };
  

  const renderItem = ({ item, drag }: RenderItemParams<Item>) => {
    const isEditing = editingId === item.id;
  
    if (item.isSection) {
        const isEditingMeal = editingMealId === item.id;
        if (viewMode === 'meals') {
            return (
                <View style={styles.mealHeader}>
                {isEditingMeal ? (
                    <TextInput
                    value={item.text}
                    onChangeText={text => updateItemText(item.id, text)}
                    onBlur={() => setEditingMealId(null)}
                    autoFocus
                    style={styles.mealNameInput}
                    />
                ) : (
                    <TouchableOpacity onPress={() => setEditingMealId(item.id)}>
                    <Text style={styles.sectionText}>{item.text}</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.mealActions}>
                    <TouchableOpacity onPress={() => handleSuggestIngredients(item.id)} style={styles.suggestButton}>
                        <Text style={styles.suggestButtonText}>Suggest</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteMeal(item.id)} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
                </View>
            )
        }
    }

    return (
      <View style={styles.itemRow}>
        <Pressable
          onPressIn={drag}
          style={styles.dragHandle}
          hitSlop={10} // adds extra 10px padding around the touch area
        >
          <Text style={styles.dragIcon}>≡</Text>
        </Pressable>

        { !item.isSection && ( 
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => toggleCheck(item.id)}
          >
            {item.checked ? <Text>✓</Text> : null}
          </TouchableOpacity>
        )}
        
  
        <TextInput
          ref={assignRef(item.id)}
          value={item.text}
          style={[styles.editInput, item.checked && styles.checked, item.isSection && styles.sectionText]}
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
  const onDragEndMeals = ({ data }: { data: Item[] }) => {
    const newMeals: Meal[] = [];
    const newItems: Item[] = [];
    let currentMeal: Meal | null = null;

    data.forEach(item => {
      if (item.isSection) {
        if (currentMeal) {
          newMeals.push(currentMeal);
        }
        if (item.id !== 'unassigned') {
          currentMeal = { id: item.id, name: item.text, items: [] };
        } else {
          currentMeal = null;
        }
      } else {
        if (currentMeal) {
          currentMeal.items.push(item);
        } else {
          newItems.push(item);
        }
      }
    });

    if (currentMeal) {
      newMeals.push(currentMeal);
    }
  
    setMeals(newMeals);
    setItems(newItems);
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'ingredients' && styles.toggleButtonActive]}
          onPress={() => setViewMode('ingredients')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'ingredients' && styles.toggleButtonTextActive]}>Ingredients</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'meals' && styles.toggleButtonActive]}
          onPress={() => setViewMode('meals')}
        >
          <Text style={[styles.toggleButtonText, viewMode === 'meals' && styles.toggleButtonTextActive]}>Meals</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 90 })}
      >
        <View style={{ flex: 1 }}>
          {viewMode === 'ingredients' ? (
            <DraggableFlatList
              data={items.slice().sort((a, b) => a.order.localeCompare(b.order))}
              onDragEnd={({ data }) => {
                const reRanked = reRankItems(data)
                setItems(reRanked)
              }}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              scrollEnabled={true} // optional
              keyboardDismissMode="interactive"
            />
          ) : (
            <MealsView
              meals={meals}
              items={items}
              renderItem={renderItem}
              reRankItems={reRankItems}
              addMeal={addMeal}
              onDragEnd={onDragEndMeals}
            />
          )}
        </View>

      </KeyboardAvoidingView>
      <View style={styles.buttonRow}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          const lastOrder = items[items.length - 1]?.order ?? LexoRank.middle().toString();
          const newItem: Item = {
            id: uuid.v4() as string,
            text: '',
            checked: false,
            order: LexoRank.parse(lastOrder).genNext().toString(),
            isSection: false,
          };
          setItems((prev) => [...prev, newItem]);
          setEditingId(newItem.id);
          setTimeout(() => inputRefs.current[newItem.id]?.focus(), 50);
        }}
      >
        <Text style={styles.buttonText}>+ Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          const lastOrder = items[items.length - 1]?.order ?? LexoRank.middle().toString();
          const newItem: Item = {
            id: uuid.v4() as string,
            text: 'New Section',
            checked: false,
            order: LexoRank.parse(lastOrder).genNext().toString(),
            isSection: true,
          };
          setItems((prev) => [...prev, newItem]);
          setEditingId(newItem.id);
          setTimeout(() => inputRefs.current[newItem.id]?.focus(), 50);
        }}
      >
        <Text style={styles.buttonText}>+ Section</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, isCategorizing && { opacity: 0.5 }]}
        onPress={handleAutoCategorize}
        disabled={isCategorizing}
      >
        <Text style={styles.buttonText}>
          {isCategorizing ? 'Categorizing…' : 'Auto-Categorize'}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10
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
  sectionText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 14,
    color: '#444',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // leave space for the button row
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleButtonText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  mealNameInput: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestButton: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
    suggestButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 5,
        marginLeft: 5,
    },
    deleteButtonText: {
        color: 'red',
        fontSize: 18,
    },
});
