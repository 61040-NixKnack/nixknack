// HOW TO FIREBASE - https://www.youtube.com/watch?v=YOAeBSCkArA
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzv8LOAyHj98wDQF9BLd8KF4PAe3tzaJw",
  authDomain: "nixknack-carl.firebaseapp.com",
  projectId: "nixknack-carl",
  storageBucket: "nixknack-carl.appspot.com",
  messagingSenderId: "226583238028",
  appId: "1:226583238028:web:a28c0f31f5243ad96b32a9",
  measurementId: "G-2D5BCTF263",
};

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBfXS8-t6l9rMbdECZ3_v3vH2Vrkhz_c60",
//   authDomain: "nixknack-76f84.firebaseapp.com",
//   projectId: "nixknack-76f84",
//   storageBucket: "nixknack-76f84.appspot.com",
//   messagingSenderId: "869127455488",
//   appId: "1:869127455488:web:31d2f572e436f34efe29e5",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const storage = getStorage(app);
