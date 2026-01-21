
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser,
  Auth
} from "firebase/auth";

/**
 * Validated Firebase Configuration
 * Note: apiKey is strictly obtained from process.env.API_KEY as per system requirements.
 * Other fields match the specific Firebase Project 'agriadvisoryai' provided by the user.
 */
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "agriadvisoryai.firebaseapp.com",
  projectId: "agriadvisoryai",
  storageBucket: "agriadvisoryai.firebasestorage.app",
  messagingSenderId: "498163867458",
  appId: "1:498163867458:web:d53de085f0f56acbc472db"
};

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Login Error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Logout Error:", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
