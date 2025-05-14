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

type Item = {
  id: string;
  text: string;
  checked: boolean;
};

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([
    { id: Date.now().toString(), text: '', checked: false },
  ]);
  const [editingId, setEditingId] = useState<string>(items[0].id);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[editingId]?.focus();
    }, 50);
  }, [editingId]);

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
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return;
    const newItem: Item = {
      id: Date.now().toString(),
      text: '',
      checked: false,
    };
    const updated = [...items];
    updated.splice(index + 1, 0, newItem);
    setItems(updated);
    setEditingId(newItem.id);
  };

  const deleteItem = (id: string) => {
    if (items.length === 1) return;
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
              deleteItem(item.id);
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
        data={items}
        onDragEnd={({ data }) => setItems(data)}
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
