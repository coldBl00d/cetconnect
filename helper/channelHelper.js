var channelModel = require('../models/channels');
var firebaseadmin = require('../firebase-admin.js');
var rtdb = firebaseadmin.database();
var userHelper = require('./userHelper');
var header = "[channelHelper]";
var channelListURI = "channelList/";
var channelHelper = {};

channelHelper.ifChannel = function (channelId, callback){
    channelModel.findOne({channelName:channelId})
            .then(function(channel){
                if(channel){
                    callback(true);
                }else{
                    callback(false);
                }
            }).catch(function(err) {
                console.log(header,"Crashed when looking for channel "+ channelId);
                callback(false);
            });
}

channelHelper.addBareboneChannel = function(channelId, admin, callback){
    addChannelToFirebaseList(channelId);
    var newChannel = new channelModel({
        channelName:channelId, 
        subscribers:[],
        admins:[admin]
    });
    newChannel.save(function(err){
        if(err){
            /* TODO remove from firebase too here */
            callback(false);
        }else{
            callback(true);
        }
    })
}

channelHelper.subbed= function(userid, channelName, callback){

    userHelper.ifUser(userid, function(result, user){
        if(!result){
            callback(422);
            return;
        }else {
            user.subbedChannels.push(channelName);
            user.save();
            callback(200);
            return;
        }
    });

}

channelHelper.unsubbed = function(userId, channelName, callback){
    userHelper.ifUser(userId, function(result, user){
        if(!result){
            callback(422);
            return;
        }else { 
            user.subbedChannels.remove(channelName);
            user.save();
            callback(200);
            return;
        }
    });
}

function addChannelToFirebaseList(channelId){
    var refToList = rtdb.ref(channelListURI);
    var key = refToList.push().key;
    var timestamp = new Date();
    refToList.child(key).set({
        channelName: channelId
    });
}

module.exports = channelHelper;