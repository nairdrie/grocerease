import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCcWf4ImzldQDYMMEK5UmAgTCpLZ_vBlTo",
    authDomain: "grocerease-5abbb.firebaseapp.com",
    projectId: "grocerease-5abbb"
}

const app  = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
