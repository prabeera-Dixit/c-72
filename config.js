import * as firebase from 'firebase'
require('@firebase/firestore')
const firebaseConfig = {
    apiKey: "AIzaSyB-4eLGM9iLN7pxHfVRdyBc-4y3eujzUjs",
    authDomain: "willy-app-c854e.firebaseapp.com",
    projectId: "willy-app-c854e",
    storageBucket: "willy-app-c854e.appspot.com",
    messagingSenderId: "276756684031",
    appId: "1:276756684031:web:edae373e60fc2f1b8200ca"
  };
  firebase.initializeApp(firebaseConfig)
  export default firebase.firestore()