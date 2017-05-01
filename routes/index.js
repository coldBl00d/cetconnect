/// <reference path="../helper/deviceHelper.js" />
var express = require('express');
var router = express.Router();	
var path = require('path');
var userModel = require("../models/users");
var deviceHelper = require('../helper/deviceHelper');
var md5 = require('md5');
var serverKey = '7182af9b755a72f6f7c5fe88bb3d6dd2ecc5b99b';
/* GET home page. */
var header = '[index]'
var appDir = path.dirname(require.main.filename);
var systemVariables = require('../app.js');

router.get('/', function(req, res, next) {

  var options = {root: path.resolve(appDir, 'views')};
  var fileName = 'index.html';
  
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});

router.get('/admin', function(req, res, next) {

  var options = {root: path.resolve(appDir, 'views')};
  var fileName = 'admin.html';
  
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});

router.get('/registrationStatus', function(req, res, next){
    if(systemVariables.openRegistration){
        return res.status(200).end();
    }else{
        return res.status(201).end();
    }
});

router.post('/', function(req, res, next){

    var userid = req.body.userId;
    var password = req.body.password;
    var deviceToken = req.body.deviceToken;


    userModel.findOne({userid:userid}).exec()
    .then(function(user){
        login(user, password,deviceToken, res);
    }).catch(function(err){
        res.status(304);
    });

});

router.post('/newDevice', function(req, res, next){

    console.log(req.body.deviceToken);
    var deviceToken = req.body.deviceToken;
    deviceHelper.ifDevice(deviceToken, function(code){
        if(code ==200){
            return  res.status(code).json({m:'Device Identified'}).end();
        }else {
             deviceHelper.addDevice(deviceToken, function(status){
                if(status==200)
                    res.status(status).json({m:'Device Identified'}).end();
                else 
                    res.status(status).end();
             });
        }
    });
});

router.post('/tokenUpdated', function(req, res, next){

});

router.post('/detachUser', function(req, res, next){
    var token = req.body.deviceToken;
    deviceHelper.detachUser(token, function(code){
        if(code ==200){
            res.status(200).end();
        }else{
            res.status(400).end();
        }
    });
})


/* when the database finds a user with matching 
username and password, this function packages the userdata 
for the client and sends the resposnse to the client. 
On successfull Login 
    response: 
        status: 210 
        data : name, userId, adminOf, subChannels
On failure: 
    response:
        status:410 
        data: null 
*/

function login(user, password, deviceToken, res){
        if (user) { 
            console.log(header,user.userid);
            console.log(header,'userid '+ user.userid);
            console.log(header,'password '+ password);
            var login_token_recieved = md5(user.userid+password+serverKey);
            var login_token = user.login_token;
            console.log(header,'Login token from database '+ login_token);
            console.log(header,'Login token generated '+ login_token_recieved);
            if(login_token_recieved==login_token){
                var user_response = {
                    'userId':user.userid,
                    'userToken':user.user_token,
                    'name':user.name,
                    'adminOf':user.adminOf,
                    'subChannels':user.subbedChannels,
                    'department':user.department,
                    'post':user.post
                }
                console.log("Sending data back");
                if(deviceToken != null){
                    deviceHelper.attachUser(deviceToken, user_response.userToken, function(status){
                        console.log("Attachment status: "+status);
                    });
                }else{
                    console.log("user either not want notification or this is a remeberMe login");
                }
                return res.status(210).json(user_response).end();
            }else{
                console.log(header, "Wrong password for "+ user.userid)
                return res.status(220).json({auth:false}).end(); 
            }
        }else {
            console.log("LOG: Location Index.js \n Message: Login failed, no matching user found");
            return res.status(220).json({auth:false}).end(); 
        }
}


module.exports = router;
