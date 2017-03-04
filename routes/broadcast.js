var express = require('express');
var router = express.Router();	
var path = require('path');
var firebaseadmin = require('../firebase-admin.js');
var rtdb = firebaseadmin.database();
var userModel = require("../models/users");

var header = "[BROADCAST]";

var appDir = path.dirname(require.main.filename);

router.get('/', function (req, res, next){

    var options = {
        root: path.resolve(appDir, 'public/html/broadcastForm')
    };

  var fileName = 'bForm.html';
  res.sendFile(fileName, options, function (err) {
    if (err) {
      //console.log(options.root+"/index.html");
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});

router.post('/', function(req,res,next){
    response = res;
    payload = req.body.payload;
    console.log(payload);
    if(payload.adminApproved){
        sendBroadcast(payload);
        res.send(200).end();
    }else{
        userModel.findOne({userid:payload.senderid})
        .exec()
        .then(function(user) {
                var flag =0;
                if(user){
                     console.log(header,"User found...");
                     console.log(header, "Proceeding to find if he is admin");
                    for(var i =0; i< user.adminOf.length; i++){
                    // console.log(user.adminOf[i]+"::::"+payload.channel);
                        if(user.adminOf[i] == payload.channel){
                            flag =1;
                            console.log(header, "user verified as admin, sending payload");
                            sendBroadcast(payload);
                            return res.status(200).end();
                        }
                    }
                    if (flag==0){
                        console.log(header,"user "+payload.senderid + "is not an admin for channel "+ payload.channel);
                        res.status(403).end();
                    }
                }else{
                    console.log(header,"user "+payload.senderid +" is not part of the system");
                    res.status(404).end();
                }

        })
        .catch(errorCallBack);
    }

});

function errorCallBack(err){
    console.log(err);
    console.log(header,"Database failure when finding the user identifyin the user who send the broadcast");
}


function sendBroadcast(payload){
    console.log(payload);
    var channel = payload.channel;
    var referenceToBroadcast = rtdb.ref('channel/'+channel+'/broadcasts');
    var key = referenceToBroadcast.push().key;
    var timestamp = new Date(payload.timestamp);
    var today = timestamp.getDate()+ '-'+
                    timestamp.getMonth().toString() + '-'+
                        timestamp.getFullYear().toString();
    
    var referenceToToday = rtdb.ref('today/'+today+'/'+key);


    rtdb.ref('channel/'+channel+'/broadcasts/'+key).set({
        message:payload.message,
        sender:payload.sendername,
        timestamp: payload.timestamp,
        senderid:payload.senderid
    });
    
    referenceToToday.set({
        message:payload.message,
        sender:payload.sendername,
        timestamp:payload.timestamp,
        senderid:payload.senderid,
        channel:payload.channel
    });

}

module.exports = router;