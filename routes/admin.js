var express = require('express');
var router = express.Router();	
var path = require('path');
var md5 = require('md5');
var header = '[adminRouter]'
var appDir = path.dirname(require.main.filename);
var systemVariables = require('../app.js');
var serverKey = '7182af9b755a72f6f7c5fe88bb3d6dd2ecc5b99b';
var adminHelper = require('../helper/adminHelper');

router.post('/', function(req, res, next){

    var userId = req.body.userId;
    var password = req.body.password; 
    console.log(req.body);
    var loginToken = md5(userId + password + serverKey);
    console.log(loginToken);
    adminHelper.findAdmin(userId, loginToken, function(result){
        if(result){
            console.log(result);
            systemVariables.adminToken = result;
            console.log(systemVariables);
            res.status(200).json({adminToken:result}).end();
        }else{
            res.status(400).end();
        }
    });

});


module.exports = router; 