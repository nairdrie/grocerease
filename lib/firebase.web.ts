// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// compat imports for expo-firebase-recaptcha
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// Grab these from your Firebase Console → Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyCcWf4ImzldQDYMMEK5UmAgTCpLZ_vBlTo", // safe to expose
    authDomain: "grocerease-5abbb.firebaseapp.com",
    projectId: "grocerease-5abbb"
}

// initialize the modular SDK
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// initialize the compat SDK if it hasn’t been already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// also export your config so you can pass it directly
export { firebase, firebaseConfig };