// src/firebase.ts
import { Platform } from 'react-native';

// these two imports point to your existing files:
import { auth as webAuth } from './firebase.web';
import { auth as nativeAuth } from './firebase.native';

// pick the right auth instance
export const auth = Platform.OS === 'web' ? webAuth : nativeAuth;