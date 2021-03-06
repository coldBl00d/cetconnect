var express = require('express');
var path = require('path');
var userHelper = require('../helper/userHelper')
var channelHelper = require('../helper/channelHelper');
var messageHelper = require('../helper/messagesHelper');
var deviceHelper = require('../helper/deviceHelper');
var router = express.Router();
var appDir = path.dirname(require.main.filename);
var header = "[Messaging Router]";
var systemVariables = require('../app.js');
var socketHelper = require('../helper/socketHelper');
var clientHelper = require('../helper/clientHelper');


router.get('/getUsers', function(req, res, next) {
  var query = req.query.query;
  userHelper.getSimilar(query, function(userList){
    var userList_json = JSON.stringify(userList);
    res.status(200).json(userList_json).end();
  });
});

router.post('/send', function(req, res, next){
  var payload = req.body.message;
  messageHelper.sendMessage(payload, function(code){
    console.log(header, "Code: "+code);
    if(code==103){
      console.log(header,'looking for socket');
      clientHelper.getClientSockets(payload.recipientId, function(socket){
        if(socket){
          socketHelper.emitToClient(socket, 'newMessage');
          console.log(header,'Found socket notifying user about the message');
        }
        else{
          console.log(header,'FCM for message');
          deviceHelper.notifyUser(payload.recipientId, payload);
        }
      });
      res.status(200).end();
    }else{
      res.status(code).end();
    }
  });
});

router.get('/getMetadata/:token', function(req, res, next){
   var userToken = req.params.token;
   console.log(header,'getMetadata '+userToken);
   messageHelper.getMessagesMetadata(userToken,true, function(messageList){
     messageListJSON = JSON.stringify(messageList);
     console.log(header,messageListJSON);
     res.json(messageListJSON).status(200).end();
   });
});

router.get('/getMessageInbox/:id', function(req, res, next){

  var id = req.params.id;
  messageHelper.getMessage(id, true, function(message){
    var content = message.message;
    res.json({message:content}).status(200).end();
  });
  
});

router.get('/getMessageSent/:id', function(req, res, next){
  var id = req.params.id;
  messageHelper.getMessage(id, false, function(message){
    var content = message.message;
    res.json({message:content}).status(200).end();
  });
  
});

router.get('/getMetadataSent/:token', function(req, res, next){
  var userToken = req.params.token;
   messageHelper.getMessagesMetadata(userToken,false, function(messageList){
     messageListJSON = JSON.stringify(messageList);
     console.log(messageListJSON);
     res.json(messageListJSON).status(200).end();
   });
});

router.get('/deleteInbox/:id', function(req, res, next){

  var messageId = req.params.id;
  console.log(header,'Delete Inbox Id '+ messageId);
  const INBOX = true;

  messageHelper.deleteMessage(messageId, INBOX, function(result){
    if(result)
      res.status(200).end();
    else 
      res.status(300).end();
  });

});

router.get('/deleteSent/:id', function(req, res, next){

  var messageId = req.params.id;
  const INBOX = false;

  messageHelper.deleteMessage(messageId, INBOX, function(result){
    if(result)
      res.status(200).end();
    else 
      res.status(300).end();
  });
});


module.exports=router;