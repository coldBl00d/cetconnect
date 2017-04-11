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
    var loginToken = md5(userId + password + serverKey);
    adminHelper.findAdmin(userId, loginToken, function(result){
        if(result){
            systemVariables.adminToken = result;
            res.status(200).json({adminToken:result}).end();
        }else{
            console.log(header,"userid and password doesnt checkout");
            res.statusText = "Credential Error";
            res.status(201).end();
        }
    });

});

router.post('/changePassword', function(req, res, next){

    var userId = req.body.userId;
    var newPassword = req.body.newPassword;
    var adminToken = req.body.adminToken; 

    if(adminToken == systemVariables.adminToken){
        var newToken = md5(userId+newPassword+serverKey);
        adminHelper.changeLoginToken(userId, newToken, function(result){
            if(result){
                res.json(200).end();
            }else{
                res.json(401).end();
            }
        });
    }else{
        console.log(header, "You are not an admin or your session is overridden by someone");
        res.json({message: "Your token is invalid"}).status(400).end();
    }

});

module.exports = router; 