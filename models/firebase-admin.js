var firebaseAdmin = require('firebase-admin');

var serviceAccount = require("./servicekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://projectprototype-7868f.firebaseio.com"
});

module.exports = firebaseAdmin;
