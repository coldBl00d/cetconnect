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
                    callback(channel);
                }else{
                    callback(false);
                }
            }).catch(function(err) {
                console.log(header,"Crashed when looking for channel "+ channelId);
                console.log(header,err);
                callback(false);
            });
}

channelHelper.getAllChannels = function(callBack){
    channelModel.find({},['channelName'], {sort:{channelName:1}}, function(err, docs){
        callBack(docs);
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
            channelHelper.ifChannel(channelName, function(channel){
                if(channel){
                    console.log(header, "Channel "+channelName+" found, Proceeding pushing user to channel");
                    uniquePush(channel.subscribers, userid)
                    channel.save();
                    uniquePush(user.subbedChannels, channelName);
                    user.save();
                    callback(200);
                    return;
                }else{
                    console.log(header,"Channel "+channelName+" not found in the database");
                    callback(422);
                    return;
                }
            });
            
        }
    });

}

channelHelper.unsubbed = function(userId, channelName, callback){
    userHelper.ifUser(userId, function(result, user){
        if(!result){
            callback(422);
            return;
        }else {
            channelHelper.ifChannel(channelName, function(channel){
                if(channel){
                    channel.subscribers.remove(userId);
                    channel.save();
                    user.subbedChannels.remove(channelName);
                    user.save();
                    callback(200);
                    return;
                }else{
                    callback(422);
                    return;
                }
            }); 
           
        }
    });
}

function uniquePush(array, content){
    var flag = true;
    for(var i=0; i< array.length; i++){
        if(array[i]==content){
            flag= false;
            break;
        }
    }

    if(flag){
        array.push(content);
    }

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