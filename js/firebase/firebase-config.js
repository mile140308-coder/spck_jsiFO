// js/firebase/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDrsTxejtQRFi_hDizpg6GGTbg66aeP1wU",
  authDomain: "spckf-732ce.firebaseapp.com",
  projectId: "spckf-732ce",
  storageBucket: "spckf-732ce.appspot.com",
  messagingSenderId: "785374431042",
  appId: "1:785374431042:web:9e74847a775acf6ede6adb",
  measurementId: "G-NKMJTVNTWL",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
