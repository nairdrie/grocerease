import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Grab these from your Firebase Console → Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyCcWf4ImzldQDYMMEK5UmAgTCpLZ_vBlTo",
    authDomain: "grocerease-5abbb.firebaseapp.com",
    projectId: "grocerease-5abbb"
}

const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
