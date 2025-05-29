// src/firebase.ts
import { Platform } from 'react-native';

// pull in everything from your platform-specific files
import { auth      as webAuth,     firebase,    firebaseConfig } from './firebase.web';
import { auth      as nativeAuth }                              from './firebase.native';

// pick the right auth instance
export const auth = Platform.OS === 'web' ? webAuth : nativeAuth;

// re-export for LoginScreen, etc.
export { firebase, firebaseConfig };
