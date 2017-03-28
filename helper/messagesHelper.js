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

messagesHelper.getMessagesMetadata = function(me, callBack){
   console.log("In message Helper");
   recieverModel.find({recipientId: me})
                .then(function(messages){
                    var messageList = [];
                    messages.forEach(function(message){
                        var messageListEntry = {
                            senderName: message.senderName,
                            subject: message.subject,
                            timestamp:message.timestamp
                        }
                        messageList.push(messageListEntry);
                    });
                    callBack(messageList);
                });
}


/*
    100 - new message not saved to reciever 
    102 - new message copy not saved for sender 
    103 - new message saved successfully

*/

messagesHelper.sendMessage = function(payload, callBack){
    payload.read = false;
    var new_message = new recieverModel(payload);
    new_message.save(function(err){
        if(err){
            console.log(err);
            return callBack(100);
        }else{
            delete payload.read;
            var new_message_sender = new senderModel(payload);
            new_message_sender.save(function(err){
                if(err){
                    //delete the message from sender
                    new_message.remove(function(err){if(err){console.log(header, "something messed up when deleting from reciever copy");}});
                    console.log(err);
                    return callBack(102);
                }else{
                    return callBack(103);
                }
            });
        }
    });
}

module.exports = messagesHelper;