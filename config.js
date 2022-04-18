// Import the functions you need from the SDKs you need
//import firebase from 'firebase'
//import { initializeApp } from "firebase/app";
//require ("@firebase/firestore")
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAghc7xlxS3StzJfQsBtPkw_dhYExA8CwM",
  authDomain: "e-library-8c68a.firebaseapp.com",
  projectId: "e-library-8c68a",
  storageBucket: "e-library-8c68a.appspot.com",
  messagingSenderId: "444710135740",
  appId: "1:444710135740:web:8dc2efc83ee28b64f12db9"
};

// Initialize Firebase
//const app = initializeApp(firebaseConfig);

firebase.initializeApp(firebaseConfig)

export default firebase.firestore()