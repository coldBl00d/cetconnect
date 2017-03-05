var channelModel = require('../models/channels');
var firebaseadmin = require('../firebase-admin.js');
var rtdb = firebaseadmin.database();

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
        subscribers:[''],
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

function addChannelToFirebaseList(channelId){
    var refToList = rtdb.ref(channelListURI);
    var key = refToList.push().key;
    var timestamp = new Date();
    refToList.child(key).set({
        channelName: channelId
    });
}

module.exports = channelHelper;