var userModel = require('../models/users');
var header ='[userhelper]'
var userHelper = {};

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

module.exports = userHelper;