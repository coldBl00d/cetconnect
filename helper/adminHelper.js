var adminModel = require('../models/admin');
var header = '[adminHelper]';
var adminHelper = {};
var md5 = require('md5');
var sys = require('../app');

adminHelper.findAdmin = function(userId, token, callback){
    
    adminModel.findOne({
        userId:userId, 
        loginToken:token} , function(err, doc){
            if(err){
                console.log(err);
                callback(false);
            }else{
                if(doc){
                    var time = new Date().toString();
                    return callback(md5(userId + token + time));
                } else{
                    console.log(header, "Failed to find the admin");
                    callback(false);
                }
            }
        });
}

adminHelper.changeLoginToken = function (userId, newToken, callback){
    adminModel.findOneAndUpdate({userId:userId}, {$set:{loginToken: newToken}}, function(err, doc){
        if(err){
            return callback(true);
        }else{
            if(doc){
                return callback(true);
            }else{
                return callback(true);
            }
        }
    });
}

adminHelper.send = function(event, content){
    var adminSocket = sys.adminSocket;
    console.log(header,'Going to send data to admin');
    if(adminSocket){
        console.log(header,'Admin is connected');
        adminSocket.emit(event, content);
    }else{
        console.log(header,'Admin not connected');
    }
}

module.exports = adminHelper;