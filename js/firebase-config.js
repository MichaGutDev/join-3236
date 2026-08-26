import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDgb6_oZTEO6-NnYFIYtQyuAAef7AszIY0",
    authDomain: "join-3236.firebaseapp.com",
    projectId: "join-3236",
    storageBucket: "join-3236.firebasestorage.app",
    messagingSenderId: "1075341106587",
    appId: "1:1075341106587:web:94df0c65166a709f6b953e",
    databaseURL: "https://join-3236-default-rtdb.europe-west1.firebasedatabase.app"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);