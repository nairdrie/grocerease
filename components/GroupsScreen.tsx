import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button
} from 'react-native';
import { getGroups, createGroup } from '../lib/api'; // you’ll need to implement these
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'GroupsScreen'>;

interface Group {
  id: string;
  name: string;
}

export default function GroupsScreen() {
  const navigation = useNavigation<NavProp>();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    getGroups().then(setGroups);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('ListScreen', { groupId: item.id })
            }
          >
            <Text style={styles.text}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Button
        title="Create Group"
        onPress={() => {
          // pop up a modal or navigate to a CreateGroup screen …
          createGroup('New Group').then(newGroup => {
            setGroups([...groups, newGroup]);
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  text: { fontSize: 16 },
});
