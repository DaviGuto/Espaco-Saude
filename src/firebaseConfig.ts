// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyAzoHBTxwkJivFuJjSwBowUuDN3NE0K6vw",
  authDomain: "espacosaude-4d84e.firebaseapp.com",
  projectId: "espacosaude-4d84e",
  storageBucket: "espacosaude-4d84e.appspot.com",
  messagingSenderId: "647123958890",
  appId: "1:647123958890:web:d205fa917dc02f6eec1e13",
  measurementId: "G-BVB6HP400Z"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
export { app, auth }; 
