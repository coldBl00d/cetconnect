var express = require('express');
var path = require('path');
var userHelper = require('../helper/userHelper')
var channelHelper = require('../helper/channelHelper');

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

module.exports=router;