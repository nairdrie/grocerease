export type Item = {
    id: string;
    text: string;
    checked: boolean;
    order: string; // LexoRank string
  };
  
export type WeekList = {
    id: string; // Firestore document ID
    weekStart: string; // ISO string of week start (used as a key)
    items?: Item[];
};

export type RootStackParamList = {
  GettingStarted: undefined;
  Home: {
    listId?: string;
    weekStart?: string;
  };
};