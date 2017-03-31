var systemVariables = require('../app.js'); 
var md5 = require('md5');
var express = require('express');
var router = express.Router();	
var path = require('path');
var appDir = path.dirname(require.main.filename);
var userHelper = require('../helper/userHelper');
var header = "[Register Router]";

/*

    200 : The userid already exist in the system.
    901 : The database failed to add the user try again.    

*/

router.post('/', function(req, res, next){

    if(systemVariables.openRegistration){

        var userId = req.body.payload.userId;
        var password = req.body.payload.password;
        var name = req.body.payload.name;
        var post = req.body.payload.post;
        var department = req.body.payload.department;

        userHelper.ifUser(userId, function(result, user){
            if(!result){
                var user_token, login_token;
                var regTime = new Date();
                user_token = md5(userId+password);
                login_token = md5(userId + password + regTime);
                var newUser = {
                    name: name,
                    userid: userId, 
                    user_token: user_token,
                    login_token: login_token,
                    department: department,
                    post: post,
                    regTime:regTime
                }

                //adding to database
                userHelper.addUser(newUser, function(result){
                    if(result){
                        res.status(200).end();
                    }else{
                        res.status(901).end();
                    }
                });
            }else{
                console.log(header, "The userid "+ userId +" already exist");
                res.status(200).end();
            }
        });
    }else{
        res.status(404).json({message:"Not open for registration"}).end();
    }
    
});

module.exports = router;