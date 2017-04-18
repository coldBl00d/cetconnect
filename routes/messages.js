var express = require('express');
var path = require('path');
var userHelper = require('../helper/userHelper')
var channelHelper = require('../helper/channelHelper');
var messageHelper = require('../helper/messagesHelper');
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
    //console.log(userList_json);
    res.status(200).json(userList_json).end();
  });
});

router.post('/send', function(req, res, next){
  var payload = req.body.message;
  messageHelper.sendMessage(payload, function(code){
    console.log(header, "Code: "+code);
    if(code==103){
      clientHelper.getClientSockets(payload.recipientId, function(socket){
        console.log(header,'once');
        var messageListEntry = {
                                read: false,
                                senderName: payload.senderName,
                                subject: payload.subject,
                                timestamp:payload.timestamp,
                                senderId: payload.senderId
                                
        }
        socket.emit('newMessage', {message:messageListEntry});
      });
      res.status(200).end();
    }else{
      res.status(code).end();
    }
  });
});

router.get('/getMetadata/:token', function(req, res, next){
   var userToken = req.params.token;
   messageHelper.getMessagesMetadata(userToken,true, function(messageList){
     messageListJSON = JSON.stringify(messageList);
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