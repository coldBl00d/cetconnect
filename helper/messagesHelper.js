var firebaseadmin = require('../firebase-admin.js');
var senderModel = require('../models/sender');
var recieverModel = require('../models/reciever');
var rtdb = firebaseadmin.database();
var userHelper = require('./userHelper');
var header = "[messagesHelper]";
var messageSocketURI = "messageSocket/";
var messagesHelper = {};
var messageCollection = [];

messagesHelper.getSentMessages = function(userId, callBack){
    senderModel.find({senderId: userId})
                 .then(function(message){
                    if(message){
                        console.log(message);
                    }else{
                        console.log("No messages");
                        return;
                    }
                 });
}

messagesHelper.getRecievedMessages = function(me, callBack){
   recieverModel.find({recieverId: me})
                .then(function(message){
                   console.log(message); 
                });
}

/*
    100 - new message not saved to reciever 
    102 - new message copy not saved for sender 
    103 - new message saved successfully

*/

messagesHelper.sendMessage = function(payload, callBack){

    var new_message = new recieverModel(payload);
    new_message.save(function(err){
        if(err){
            return callBack(100);
        }else{
            var new_message_sender = new senderModel(payload);
            new_message_sender.save(function(err){
                if(err){
                    //delete the message from sender
                    new_message.remove(function(err){if(err){console.log(header, "something messed up when deleting from reciever copy");}});
                    return callBack(102);
                }else{
                    return callBack(103);
                }
            });
        }
    });
}


/* 
    100 - message was not added to existing documents array 
    101 - message added to documents array 
    102 - new message document not added 
    103 - new message document added. 

*/

/*messagesHelper.addMessage = function(payload, callBack){
    
    messagesHelper.getMessagesFrom(payload.recieverId, payload.senderId, function(result){
        if(result){
            result.message.push(payload.message);
            result.save(function(err){
                if(err) {
                    console.log(header, "Some error while adding new message to array");
                    callBack(100);
                    return;
                }else{
                    console.log(header, "Message added to array successfully");
                    callBack(101);
                    return;
                }
            });
        }else{
            var new_message = new messagesModel({
                senderId: payload.senderId,
                recieverId: payload.recieverId,
                message: [payload.message]
            });
            new_message.save(function(err){
               if(err) {
                    console.log(header,"New message from this reciever, but it was not added to databse");
                    callBack(102);
                    return;
               }else{
                   console.log(header, "New message document added");
                   callBack(103);
                   return;
               }
            })
        }
    });

}*/

module.exports = messagesHelper;