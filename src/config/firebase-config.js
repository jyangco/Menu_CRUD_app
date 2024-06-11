import { initializeApp } from "firebase/app"
import { getFirestore } from "@firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyDpH9eZ6TtPioBBRKG5URKftu-uD-Iw930",
    authDomain: "menu-crud-app.firebaseapp.com",
    projectId: "menu-crud-app",
    storageBucket: "menu-crud-app.appspot.com",
    messagingSenderId: "644064271375",
    appId: "1:644064271375:web:1a3c53ae14242b1b94577a",
    measurementId: "G-S0XV6GNSJ4"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)