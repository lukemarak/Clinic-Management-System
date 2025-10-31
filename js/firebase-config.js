const firebaseConfig = {
  apiKey: "AIzaSyDoDVhF2WXVe85B90_yyPu6FDl0iyAc2nM",
  authDomain: "clinic-management-system-9eab1.firebaseapp.com",
  databaseURL: "https://clinic-management-system-9eab1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "clinic-management-system-9eab1",
  storageBucket: "clinic-management-system-9eab1.firebasestorage.app",
  messagingSenderId: "727178114385",
  appId: "1:727178114385:web:0bbed84e3e42ed017e8f70"
};

// Initialize Firebase only ONCE
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
