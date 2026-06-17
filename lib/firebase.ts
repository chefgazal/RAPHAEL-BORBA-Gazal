import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import config from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId || "(default)");
