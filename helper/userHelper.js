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

module.exports = userHelper;