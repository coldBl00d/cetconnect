importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');

var config = {
    apiKey: "AIzaSyDUHiaKVkTqU5Q5mshH3qdPcFGRbg8w9V0",
    authDomain: "projectprototype-7868f.firebaseapp.com",
    databaseURL: "https://projectprototype-7868f.firebaseio.com",
    storageBucket: "projectprototype-7868f.appspot.com",
    messagingSenderId: "290189100132"
};

firebase.initializeApp(config);
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.'
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});
