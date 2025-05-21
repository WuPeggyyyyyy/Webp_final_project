// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBlOsoyGlG-ovbdGzSWkBTopmJZ01kyFr4",
  authDomain: "cgu-foodtruck.firebaseapp.com",
  projectId: "cgu-foodtruck",
  storageBucket: "cgu-foodtruck.firebasestorage.app",
  messagingSenderId: "515377468300",
  appId: "1:515377468300:web:7db34548da74c4ad41bca9",
  measurementId: "G-ZZHCL1DLD9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
