var express = require('express');
var path = require('path');
var userHelper = require('../helper/userHelper')
var channelHelper = require('../helper/channelHelper');
var messageHelper = require('../helper/messagesHelper');
var router = express.Router();
var appDir = path.dirname(require.main.filename);
var header = "[Messaging Router]";

router.get('/getUsers', function(req, res, next) {
  var query = req.query.query;
  userHelper.getSimilar(query, function(userList){
    var userList_json = JSON.stringify(userList);
    console.log(userList_json);
    res.status(200).json(userList_json).end();
  });
});

router.post('/send', function(req, res, next){
  var payload = req.body.message;
  messageHelper.sendMessage(payload, function(code){
    console.log(header, "Code: "+code);
    if(code==103){
      res.status(200).end();
    }else{
      res.status(code).end();
    }
  });
});

router.get('/getMetadata', function(req, res, next){

});

router.get('/getMessage', function(req, res, next){

});

module.exports=router;