var config = {
    apiKey: "AIzaSyDUHiaKVkTqU5Q5mshH3qdPcFGRbg8w9V0",
    authDomain: "projectprototype-7868f.firebaseapp.com",
    databaseURL: "https://projectprototype-7868f.firebaseio.com",
    storageBucket: "projectprototype-7868f.appspot.com",
    messagingSenderId: "290189100132"
};

firebase.initializeApp(config);

const rtdb = firebase.database();

const messaging = firebase.messaging();

