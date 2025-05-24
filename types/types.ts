export type Item = {
    id: string;
    text: string;
    checked: boolean;
    order: string; // LexoRank string
    isSection: boolean; // Optional property to indicate if the item is a section
  };
  
export type WeekList = {
    id: string; // Firestore document ID
    weekStart: string; // ISO string of week start (used as a key)
    items?: Item[];
};

export type RootStackParamList = {
  GettingStarted: undefined;
  ListScreen: {
    groupId: string;        // which group was chosen
    listId?: string;
    weekStart?: string;
  };
  GroupsScreen: undefined;
};

// types/types.ts
export interface Group {
  id: string;
  name: string;
}