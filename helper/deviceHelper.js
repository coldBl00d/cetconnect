
var deviceModel = require('../models/device');
var header ='[devicehelper]'
var deviceHelper = {};

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

module.exports = deviceHelper;
