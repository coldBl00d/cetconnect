var firebaseadmin = require('../firebase-admin.js');
var messagesModel = require('../models/messages');
var rtdb = firebaseadmin.database();
var userHelper = require('./userHelper');
var header = "[messagesHelper]";
var messageSocketURI = "messageSocket/";
var messagesHelper = {};
var messageCollection = [];

messagesHelper.getMessages = function(userId, callBack){
    messagesModel.find({senderId: userId})
                 .then(function(message){
                    if(message){
                        console.log(message);
                    }else{
                        console.log("No messages");
                        return;
                    }
                 });
}

messagesHelper.addMessage = function(payload, callBack){
    var new_message = new messagesModel(payload);
    new_message.save(function(err){
        if(err){
            console.log(header, "Message is not added to the database");
            callBack(false);
            return;
        }else{
            console.log(header, "Message is added to the database");
            return callBack(true);
        }
    });
}

module.exports = messagesHelper;