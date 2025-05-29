import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button
} from 'react-native';
import { getGroups, createGroup } from '../lib/api';
import { getAuth } from 'firebase/auth';               // ← assuming Firebase
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
  const auth = getAuth();

  useEffect(() => {
    getGroups().then(setGroups);
  }, []);

  const handleCreateGroup = async () => {
    const user = auth.currentUser;
    if (!user || user.isAnonymous) {
      // if there’s no real user, send them to Login (or modal) first
      navigation.navigate('LoginScreen' /* make sure this route exists */);
      return;
    }

    // otherwise, proceed with creation
    try {
      const newGroup = await createGroup('New Group');
      setGroups((prev) => [...prev, newGroup]);
    } catch (err) {
      console.error('failed to create group', err);
      // you might show a toast or alert here
    }
  };

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
        onPress={handleCreateGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  text: { fontSize: 16 },
});
