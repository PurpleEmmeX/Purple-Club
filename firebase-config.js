// Firebase Configuration for Purple Club
// Configurazione Firebase per Purple Club

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// La configurazione Firebase della tua app web
const firebaseConfig = {
  // SOSTITUISCI QUESTI VALORI CON I TUOI DATI FIREBASE
  // REPLACE THESE VALUES WITH YOUR FIREBASE DATA
  apiKey: "AIzaSyDONUlWkpq-0ZMPPmigQ6gczz2ghfem1hU",
  authDomain: "purple-club-d6080.firebaseapp.com",
  projectId: "purple-club-d6080",
  storageBucket: "purple-club-d6080.firebasestorage.app",
  messagingSenderId: "113484849723",
  appId: "1:113484849723:web:cde485c5028fa829f9321e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { db, auth };