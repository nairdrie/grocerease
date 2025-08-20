import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Item, Meal } from '../types/types';
import { LexoRank } from 'lexorank';

interface MealsViewProps {
  meals: Meal[];
  items: Item[];
  renderItem: (params: RenderItemParams<Item>) => React.ReactNode;
  reRankItems: (items: Item[]) => Item[];
  addMeal: () => void;
  onDragEnd: (params: { data: Item[] }) => void;
}

export default function MealsView({
  meals,
  items,
  renderItem,
  reRankItems,
  addMeal,
  onDragEnd,
}: MealsViewProps) {
  const allItems = [
    ...meals.flatMap(meal => [
      { id: meal.id, text: meal.name, isSection: true, order: LexoRank.middle().toString(), checked: false },
      ...meal.items,
    ]),
    { id: 'unassigned', text: 'Unassigned', isSection: true, order: LexoRank.middle().toString(), checked: false },
    ...items,
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addMealButton} onPress={addMeal}>
        <Text style={styles.addMealButtonText}>+ Add Meal</Text>
      </TouchableOpacity>
      <DraggableFlatList
        data={reRankItems(allItems)}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onDragEnd={onDragEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
      },
      addMealButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
      },
      addMealButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
      },
});
