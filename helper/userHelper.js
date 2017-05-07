var userModel = require('../models/users');
var header ='[userhelper]'
var userHelper = {};

userHelper.userModel = userModel;

userHelper.ifUser = function (userId, callback){
    userModel.findOne({userid:userId})
            .then(function(user){
                if(user){
                    callback(true, user);
                }else{
                    callback(false, user);
                }
            }).catch(function(err) {
                console.log( header,"crashed when looking for user with userid " +err);
                callback(false, null);
            });
}

userHelper.ifUserToken = function(token, callback){
     userModel.findOne({user_token:token})
            .then(function(user){
                if(user){
                    callback(true, user);
                }else{
                    callback(false, user);
                }
            }).catch(function(err) {
                console.log( header,"crashed when looking for user with user token " +err);
                callback(false, null);
            });   
}

userHelper.getAllUserBasic = function(callback){
    userModel.find({},function(err, users){
        if(!err){
            var userList = [];
            users.forEach(function(user){
                var user_basic = {
                    name: user.name,
                    userid: user.userid,
                    department: user.department,
                    post: user.post
                };

                userList.push(user_basic);
            });
            callback(userList);
        }else{
            console.log(header, "Error loading the user list for auto complete to the user");
        }
    });
}

userHelper.getSimilar = function(name, callback){
    userModel.find({name: new RegExp('^'+name+'[a-zA-Z]*', "i")}, function(err, users) {
        if(!err){
            var userList = [];
            users.forEach(function(user){
                var user_basic = {
                    name: user.name,
                    userId: user.userid,
                    department: user.department,
                    post: user.post
                };
                userList.push(user_basic);
            });
            callback(userList);
        }else{
            console.log(header, "Error loading the user list for auto complete to the user");
            callback();
        }
    });
}

userHelper.addUser = function(user, callBack){
    var new_user = new userModel(user);
    new_user.save(function(err){
        if(err){
            console.log(header, err);
            callBack(false);
        }else{
            callBack(true);
        }
    });
}

userHelper.getCount = function(callBack){
    userModel.count({},function(err, count){
        if(err){
            console.log(header,err);
            callBack(-1);
        }else{
            callBack(count);
        }
    });
}

userHelper.deleteToken = function (token, callback){
    userModel.findOneAndRemove({user_token: token }, function (err, doc){
        if(err){
            console.log(header,err);
            callback(false);
        }else{
            console.log(header,'user deleted');
            callback(true);
        }
    });
}

userHelper.deleteBatch = function (batch, callback){
    userModel.remove({batch: batch }, function (err){
        if(err){
            console.log(header,err);
            callback(false);
        }else{
            console.log(header,'users deleted');
            callback(true);
        }
    });
}

userHelper.getBatchData = function(array, callBack){
    var numberOfItem = array.length;
    if(numberOfItem == 0) return callBack([]);
    var users = [];
    console.log(header,'Number of item '+ numberOfItem);
    array.forEach(function(item){
        userHelper.ifUser(item, function(result, user){
            if(result){
                    var user_limited = {
                    name:user.name,
                    userid:user.userid,
                    batch:user.batch,
                    post:user.post, 
                    department: user.department

                }
                console.log(header,user);
                users.push(user_limited);
                
            }
            if(--numberOfItem == 0){
                    callBack(users);
            }   
        });
    });
}


userHelper.getBatchDataToken = function(array, callBack){
    var numberOfItem = array.length;
    if(numberOfItem == 0) return callBack([]);
    var users = [];
    console.log(header,'Number of item '+ numberOfItem);
    array.forEach(function(item){
        userHelper.ifUserToken(item, function(result, user){
            if(result){
                    var user_limited = {
                    name:user.name,
                    userid:user.userid,
                    batch:user.batch,
                    post:user.post,
                    department: user.department

                }
                console.log(header,user);
                users.push(user_limited);
                
            }
            if(--numberOfItem == 0){
                    callBack(users);
            }   
        });
    });
}


userHelper.getSize = function(callBack){
    userModel.collection.stats(function(err,stat){
        if(err){
            console.log(header,err);
            callBack(0);
        }else{
            callBack(stat.storageSize);
        }
    });
}

userHelper.updateUser = function(edits, callBack){
    userHelper.ifUserToken(edits.userToken, function(result, user){
        if(result){
            user.name = edits.name;
            user.batch = edits.batch;
            user.department = edits.department;
            user.post = edits.post;
            user.save(function(err){
                if(err){
                    return callBack(false);
                }else{
                    return callBack(true);
                }
            });
        }else{
            callBack(false);
        }
    });
}

module.exports = userHelper;