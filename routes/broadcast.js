var express = require('express');
var router = express.Router();	
var path = require('path');
var firebaseadmin = require('../firebase-admin.js');
var rtdb = firebaseadmin.database();
var userModel = require("../models/users");

var header = "[BROADCAST]";

router.post('/', function(req,res,next){
    response = res;
    payload = req.body.payload;
    if(payload.adminApproved){
        sendBroadcast(payload);
        res.send(200).end();
    }else{
        userModel.findOne({userid:payload.senderid})
        .exec()
        .then(function(user) {
                console.log(user);
                var flag =0;
                if(user){
                    for(var i =0; i< user.adminOf.length; i++){
                    // console.log(user.adminOf[i]+"::::"+payload.channel);
                        if(user.adminOf[i] == payload.channel){
                            flag =1;
                            console.log(header, "user verified, sending payload");
                            sendBroadcast(payload);
                            return res.status(200).end();
                        }
                    }
                    if (flag==0)
                        console.log(header,"user "+payload.senderid + "is not an admin for channel "+ payload.channel);
                        res.status(403).end();
                }else{
                    console.log(header,"user "+payload.senderid +" is not part of the system");
                    res.status(404).end();
                }

        })
        .catch(errorCallBack);
    }

});

/*function databaseCallback (user){
    
    console.log(user);
    var flag =0;
    if(user){
        for(var i =0; i< user.adminOf.length; i++){
           // console.log(user.adminOf[i]+"::::"+payload.channel);
            if(user.adminOf[i] == payload.channel){
                flag =1;
                console.log(header, "user verified, sending payload");
                sendBroadcast(payload);
                return response.status(200).end();
            }
        }
        if (flag==0)
            console.log(header,"user "+payload.senderid + "is not an admin for channel "+ payload.channel);
            response.status(403).end();
    }else{
        console.log(header,"user "+payload.senderid +" is not part of the system");
         return response.status(404).end();
    }
}*/

function errorCallBack(err){
    console.log(header,"Database failure when finding the user identifyin the user who send the broadcast");
}


function sendBroadcast(payload){
    var channel = payload.channel;
    var referenceToBroadcast = rtdb.ref('channel/'+channel+'/broadcasts');
    var key = referenceToBroadcast.push().key;
    rtdb.ref('channel/'+channel+'/broadcasts/'+key).set({
        message:payload.message,
        sender:payload.sendername,
        timestamp: payload.timestamp
     });
}

module.exports = router;