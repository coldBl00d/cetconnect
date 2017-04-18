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
   // addChannelToFirebaseList(channelId);
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

channelHelper.subbed= function(userToken, channelName, callback){

    userHelper.ifUserToken(userToken, function(result, user){
        if(!result){
            callback(422);
            return;
        }else {
            channelHelper.ifChannel(channelName, function(channel){
                if(channel){
                    console.log(header, "Channel "+channelName+" found, Proceeding pushing user to channel");
                    uniquePush(channel.subscribers, userToken)
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

channelHelper.unsubbed = function(userToken, channelName, callback){
    userHelper.ifUserToken(userToken, function(result, user){
        if(!result){
            callback(422);
            return;
        }else {
            channelHelper.ifChannel(channelName, function(channel){
                if(channel){
                    channel.subscribers.remove(userToken);
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

channelHelper.getSubbedUsers = function(channelName, callBack){
    channelModel.findOne({channelName: channelName}, function(err, doc){
        if(err) console.log(header, "Database may be down");
        else{
            if(doc){
                return callBack(doc.subscribers)
            }else{
                console.log(header, "Channel not found, cant notify");
            }
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

channelHelper.getSize = function(callBack){
    channelModel.collection.stats(function(err,stat){
        if(err){
            console.log(header,err);
            callBack(0);
        }else{
            callBack(stat.storageSize);
        }
    });
}


channelHelper.deleteUser = function(user, callBack){
    var header = '[deleteUser From Channel]';
    console.log(header,'User :'+user.userid);
    var adminOf = user.adminOf;
    var subc = user.subbedChannels;

    var lenAdminOf = adminOf.length;
    var operations =2;
    var lensubc = subc.length;

    if(lenAdminOf == 0 ){
        --operations;
    }

    if(lensubc == 0){
        --operations;
    }

    if(lensubc == 0 && lenAdminOf == 0){
        callBack(true);
    }
    

    for(var i=0; i<adminOf.length; i++){
        var current = adminOf[i];
        channelHelper.ifChannel(current, function(result){
            if(result){
                if(result.admins.indexOf(user.userid) != -1)
                    result.admins.splice(result.admins.indexOf(user.userid),1);
                result.save(function(err, doc){
                    if(err) callBack(false);
                });
            }

            if(--lenAdminOf == 0){
                if(--operations == 0){
                    callBack(true);
                }
            }
        });

    }

    for(var i=0; i<subc.length; i++){
        var current = subc[i];
        channelHelper.ifChannel(current, function(result){
            if(result){
                if(result.subscribers.indexOf(user.user_token) != -1){
                    result.subscribers.splice(result.subscribers.indexOf(user.user_token),1);
                    result.save(function(err, doc){
                        if(err){callBack(false)}
                    });
                }
            }
             if(--lensubc == 0){
                if(--operations == 0){
                    callBack(true);
                }
            }
        });
    }
}


module.exports = channelHelper;