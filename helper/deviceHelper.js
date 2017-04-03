
var deviceModel = require('../models/device');
var channelHelper = require('../helper/channelHelper');
var userHelper = require('../helper/userHelper');

var header ='[devicehelper]'
var deviceHelper = {};


var FCM = require('fcm-push');
var serverKey = 'AAAAQ5CeRGQ:APA91bEinvbmz58n6NW5GTqGcqp__bhuLvCGfnKiqCf2hJ8jyocTsE07sihATA2UsaNdUK3SC9WCjTrDtoe2dW6foO4wkKzFQOIim8uHmODZui6Hjwr7XD9cSUxn7IiST4e-5ERZPfJFdWmlLcYOM_sQO2tmrHMu3g';
var fcm = new FCM(serverKey);





deviceHelper.ifDevice = function(deviceToken, callBack ){
    deviceModel.findOne({deviceToken:deviceToken}, function(err, doc){
        if(doc){
            return callBack(200);
        }else{
            return callBack(404);
        }
    });
}

deviceHelper.addDevice = function (deviceToken, callBack){
    var newDevice = new deviceModel({
        deviceToken : deviceToken,
        userToken : null
    });

    newDevice.save(function (err){
        if(err){
           return callBack(400);
        }else{
            return callBack(200);
        }
    });
}

deviceHelper.detachUser = function(deviceToken, callBack){
    deviceModel.findOneAndUpdate({deviceToken:deviceToken}, {$set:{userToken:null}}, function(err, doc){
        if(err){
            console.log(header,"User not detached from "+ deviceToken);
            callBack(400);
        }else{
            console.log(header, "User detached from device "+ deviceToken);
            callBack(200);
        }
    });
}

deviceHelper.attachUser = function(deviceToken, userId,callBack){
    deviceModel.findOneAndUpdate({deviceToken:deviceToken}, {$set:{userToken:userId}}, function(err, doc){
        if(err){
            console.log(header,"User not attached to "+ deviceToken);
            callBack(400);
        }else{
            console.log(header, "User attached to device ");
            callBack(200);
        }
    });
}

/* 200 -- attached
   400 -- not attached 
   404 -- no device 
   900 -- error
*/

deviceHelper.ifAttached = function(deviceToken, callBack){
    deviceModel.findOne({deviceToken:deviceToken}, function(err, doc){
        if(err){
            callBack(900);
        }else{
            if(doc){
                console.log("device is found, checking if attached");
                if(doc.userToken != null){
                    return callBack(200);
                }else{
                    return callBack(400);
                }
            }else{
                return callBack(404);
            }
        }
    });
}

deviceHelper.getDeviceToken = function(userToken, callBack){
    console.log('In getDeviceToken');
    deviceModel.find({userToken:userToken}, function(err, doc){
        if(err) console.log(err);
        else {
            doc.forEach(function(doc){
                callBack(doc.deviceToken);
            });
        }
    });
}

deviceHelper.notify = fcm;


var message = {
    to:'',
    notification: {
        title: '',
        body: '',
        icon: 'http://localhost:3000/res/icon_place_holder.png',
        'click_action': 'http://localhost:3000'
    }
};



deviceHelper.notifyChannel = function(channelName, content){
    channelHelper.getSubbedUsers(channelName, function(subList){
        subList.forEach(function(token){
            deviceHelper.getDeviceToken(token, function(deviceToken){
                if(deviceToken != null){
                    message.to = deviceToken;
                    message.notification.title = channelName; 
                    message.notification.body = content.title;
                    console.log (message);
                    fcm.send(message, function(err, res){console.log(res);});
                }
            });
        });
    });
}

module.exports = deviceHelper;
