var express = require('express');
var router = express.Router();	
var path = require('path');
var md5 = require('md5');
var header = '[adminRouter]'
var appDir = path.dirname(require.main.filename);
var systemVariables = require('../app.js');
var serverKey = '7182af9b755a72f6f7c5fe88bb3d6dd2ecc5b99b';
var adminHelper = require('../helper/adminHelper');
var userHelper = require("../helper/userHelper");

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

router.post('/validate', function(req, res, next){
    console.log('inside validate');
    var adminToken = req.body.adminToken;
    if(systemVariables.adminToken == adminToken){
        res.status(200).end();
    }else{
        res.status(201).end();
    }
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

router.post('/findUser',function(req, res, next){
    console.log(header,'find user request');
    console.log(header,req.body.userId);
    
    var userId = req.body.userId;
    var adminToken = req.body.adminToken; 

    if(systemVariables.adminToken == adminToken){
        setTimeout(function() {
            userHelper.ifUser(userId, function(result, user){
                if(result){
                    var user = {
                        name: user.name, 
                        user_token: user.user_token, 
                        post: user.post, 
                        department: user.department, 
                        batch: user.batch
                    }

                    var payload = {
                        user: user, 
                        message: "Found user"
                    }

                    res.status(200).json(payload).end();
                }else{
                    res.status(202).json({message:"No such user"}).end();
                }
            });
        }, 4000);
    }else{
        res.json({message:"You do not have admin previlage"}).staus(201).end();
    }

});


router.post('/deleteUser',function(req, res, next){

    var payload = req.body.payload;
    console.log(header,payload);
    
    if(systemVariables.adminToken == payload.adminToken){
        var user_token = payload.user_token;
        userHelper.ifUserToken(user_token, function(result,user){
            if(result){
                userHelper.deleteToken(user_token, function(result){
                    if(result){
                         res.json({message:"User deleted"}).status(200).end();
                         userHelper.getCount(function(count){
                                if(count !=0)
                                adminHelper.send('registeredCount', {registeredCount: count});
                        });
                    }else{
                        res.json({message:"Deletion Failed"}).status(203).end();
                    }
                })
            }else{
                res.json({message:"This user does not exist"}).status(203).end();
            }
        }); 
    }else{
        res.json({message:'You have no previlage for the operation'}).status(202).end();
    }
});


router.post('/addUser',function(req, res, next){
    var payload = req.body.payload;
    if(payload.adminToken == systemVariables.adminToken){
        console.log(header,'recieved payload for adding user');
        console.log(header,payload);
        function checkForm() {
            if(payload.name && payload.userid && payload.password && payload.department && payload.post){
                return true;
            }else{
                return false
            }
        }

        if( checkForm() ) {

            console.log(header,'Checking if user is already in the system');
            userHelper.ifUser(payload.userid, function(result, user){
                if(result){
                    console.log(header,'The userid '+ 'is already present in the system');
                    res.status(201).end();
                }else{
                    delete payload.adminToken;
                    var regTime = new Date();
                    var userId = payload.userid;
                    var password = payload.password;
                    var user_token = md5(userId+password);
                    var login_token = md5(userId+password+regTime);
                    
                    delete payload.newPassword;
                    payload.user_token = user_token;
                    payload.login_token = login_token;
                    payload.regTime = regTime;
                    console.log(header,'completed forming payload for registration');
                    console.log(header,payload);
                    
                    userHelper.addUser(payload, function(result){
                        if(result){
                            console.log(header,'The user is added');
                            res.status(200).end();
                            userHelper.getCount(function(count){
                                if(count !=0)
                                adminHelper.send('registeredCount', {registeredCount: count});
                            });
                        }else{
                            console.log(header,'Database didnt add the user');
                            res.status(207).end()
                        }
                    });
                }
            });

        }else{
            console.log(header,'Form is malformed, not gonna add the User');
            res.status(204).end();
        }

    }else{
        console.log(header,'User not added bad token');
        res.status(202).end();
    }
});


router.post('/batchDelete',function(req, res, next){
    var payload = req.body.payload;
    var header = '[batchDelete]';
    
    console.log(header,'recieved request');
    
    console.log(header,payload);
    
    if(systemVariables.adminToken == payload.adminToken){
        var batch = payload.batch;
        if(!batch) return  res.json({message:'Batch is not defined'}).status(202).end();
        userHelper.deleteBatch(batch, function(result){
            if(result){
                setTimeout(function() {
                    
                     res.json({message:'Deleted Batch '+ batch}).status(200).end();
                     userHelper.getCount(function(count){
                                if(count !=-1)
                                adminHelper.send('registeredCount', {registeredCount: count});
                     });

                }, 2000);
                
            }else{
                res.json({message:'Something went wrong'}).status(202).end();
            }
        }) 
    }else{
        res.json({message:'You have no previlage for the operation'}).status(202).end();
    }
});


module.exports = router; 