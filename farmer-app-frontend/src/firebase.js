import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPqjyhtWp7pDYxtMKwjDwUO112yYlaYp4",
  authDomain: "my-app-72abe.firebaseapp.com",
  projectId: "my-app-72abe",
  storageBucket: "my-app-72abe.appspot.com",
  messagingSenderId: "420829732154",
  appId: "1:420829732154:web:fae9ab9581e90162874403"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const firebaseGoogleLogin = async () => {
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
};

export { auth, firebaseGoogleLogin };
