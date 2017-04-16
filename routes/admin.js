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
var channelHelper = require('../helper/channelHelper');

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



router.post('/addChannel', function (req, res, next) {
    var payload = req.body.payload;
    
    if(!payload) return  res.json({message:'No Payload'}).status(201).end();
    var header = '[addChannelRequest]';

    function validatePayload(payload) {
        if (payload.channelName && payload.admin) {
            return true;
        } else return false;
    }

    if(payload.adminToken == systemVariables.adminToken){

        if (validatePayload(payload)) {
            console.log(header, "Recieved proper payload, going to look for channel if it already exist");
            channelHelper.ifChannel(payload.channelName, function (result) {
                if (result) {
                    console.log(header, "channel already exist, choose another name");
                    res.status(201).json({message:'channel already exist'}).end();
                } else {
                    console.log(header, "Channel name is unique, proceeding to check if the admin exist");
                    userHelper.ifUser(payload.admin, function (result, db_admin) {
                        if (result) {
                            console.log(header, "Verfied admin exist in system, Proceeding to add channel to system");
                            channelHelper.addBareboneChannel(payload.channelName, payload.admin, function (result) {
                                if (result) {
                                    console.log(header, "The new channel is added successfully");
                                    console.log(header, "Updating channel to admins entry");
                                    db_admin.adminOf.push(payload.channelName);
                                    db_admin.save();
                                    res.json({message:'Channel added'}).status(200).end();
                                } else {
                                    console.log(header, "MongoDB failed to add channel to its database rolled back firebase");
                                    res.status(201).json({message:'Oops... something went wrong at my end'}).end();
                                }
                            })
                        } else {
                            console.log(header, "Admin does not check out in the system. Select another admin");
                            res.status(201).json({message:'The user you selected does not exist'}).end();
                        }
                    })
                }
            });
        } else {
            console.log(header, "Payload is malformed");
            res.status(201).json({message:'Your request is invalid'}).end();
        }

    }else{
        console.log(header,'Token mismatch');
        res.status(201).json({message:"You do not have previlage"}).end();
        

    }
});


router.get('/getChannelData/:channelName',function(req, res, next){
    var header = '[getChannelData]';
    console.log(header,'Requested data for '+req.params.channelName);
    var channelName = req.params.channelName;

    if(true){
        channelHelper.ifChannel(channelName, function(result){
            if(result){
                console.log(header,result);
                var admins = result.admins; 
                userHelper.getBatchData(admins, function(adminDetails){
                    result.admins = adminDetails;
                    console.log(header,result);
                    userHelper.getBatchDataToken(result.subscribers, function(subs){
                        result.subscribers = subs; 
                        res.json({message:'Found channel', channel: result}).status(201).end();

                    });
                });
            }else{
                res.json({message:'Channel not found'}).status(201).end();
                console.log(header,'Channel does not exist');
            }
        });
    }else{
        res.json({message:'You have no previlage for the operation'}).status(202).end();
    }
});


router.post('/addMod',function(req, res, next){
    var header = '[addMod]';
    var payload = req.body.payload;
    if(systemVariables.adminToken == payload.adminToken){
        console.log(header,'Admin token matched');
        userHelper.ifUser(payload.userId, function(result, user){
            if(result){
                console.log(header,'Found user, going to check if he is already admin');
                var adminOf = user.adminOf;
                var index = adminOf.indexOf(payload.channelName);
                if(index != -1){
                    console.log(header,'User already admin of the channel');
                    return res.json({message:'User already is an admin of '+ payload.channelName}).status(201).end();
                }else{
                    console.log(header,'Channel not found in  user');
                    console.log(header,'Proceeding to add to channel');
                    channelHelper.ifChannel(payload.channelName, function(channel){
                        if(channel){
                            var admins = channel.admins; 
                            var index = admins.indexOf(payload.userId);
                            console.log(header,'index '+ index);

                            if(index == -1){
                                admins.push(payload.userId);
                                channel.save(function(err, uchannel){
                                    if(err){
                                        return res.json({message:'Failed to add moderator'}).status(201).end();
                                    }else{
                                        adminOf.push(payload.channelName);
                                        user.save(function(err, uuser){
                                            if(err){
                                                var i = uchannel.admins.indexOf(payload.userId);
                                                uchannel.admins.splice(i,1);
                                                uchannel.save(function(err, doc){
                                                    if(err){
                                                        return res.json({message:'Database failure!'}).status(201).end();
                                                    }else{
                                                        return res.json({message:'Failed to add moderator'}).status(201).end();
                                                    }
                                                });
                                            }else{
                                                var modAdded = {
                                                    name: uuser.name,
                                                    department: uuser.department, 
                                                    post: uuser.post, 
                                                    batch: uuser.batch
                                                };
                                                return res.json({message:'Moderator added successfully', mod: modAdded}).status(200).end();
                                            }
                                        })
                                    }
                                });
                            }else{
                                console.log(header,'user is already a channel admin');

                                return res.json({message:'User is already a channel admin'}).status(201).end();
                            }
                        }else{
                           return res.json({message:''}).status(201).end();
                        }
                    })
                }
            }else{
                res.json({message:'The user does not exist in the system'}).status(201).end();
            }
        });
    }else{
        res.json({message:'You have no previlage for the operation'}).status(202).end();
    }
});



module.exports = router; 