import { firebase, firebaseConfig } from '../lib/firebase';

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import Constants from 'expo-constants';
import { auth } from '../lib/firebase';
import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { loginWithToken } from '../lib/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import { toE164 } from '../lib/utils';

// Define navigation prop for this screen
type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

export default function LoginScreen() {
  const recaptchaVerifier = useRef<any>(null);
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<LoginNavProp>();

  // Step 1: Send SMS
  const sendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const e164 = toE164(phone);
      const result = await signInWithPhoneNumber(
        auth,
        e164,
        recaptchaVerifier.current
      );
      setVerificationId(result.verificationId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error sending code');
    } finally {
      setLoading(false);
    }
  };
  

  // Step 2: Confirm SMS code and log in
  const confirmCode = async () => {
    if (!verificationId) return;
    setLoading(true);
    setError(null);

    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        code
      );
      await signInWithCredential(auth, credential);

      // Get ID token and call your backend via helper
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error('Missing ID token');
      await loginWithToken(idToken);

      // On success, navigate back
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error verifying code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Invisible reCAPTCHA */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />

      {!verificationId ? (
        // Phone input form
        <>
          <TextInput
            style={styles.input}
            placeholder="+1 555 555 5555"
            keyboardType="phone-pad"
            onChangeText={setPhone}
            value={phone}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={sendCode}
            disabled={loading || phone.length < 10}
          >
            {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Send Code</Text>}
          </TouchableOpacity>
        </>
      ) : (
        // Code confirmation form
        <>
          <TextInput
            style={styles.input}
            placeholder="123456"
            keyboardType="number-pad"
            onChangeText={setCode}
            value={code}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={confirmCode}
            disabled={loading || code.length < 6}
          >
            {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Confirm Code</Text>}
          </TouchableOpacity>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontSize: 16 },
  error: { color: 'red', textAlign: 'center', marginTop: 8 },
});
