var userModel = require('../models/users');

var userHelper = {};

userHelper.ifUser = function (userid, callback){
    userModel.findOne({userid:userid})
            .then(function(user){
                if(user){
                    callback(true, user);
                }else{
                    callback(false, user);
                }
            }).catch(function(err) {
                console.log("Userhelper crashed when looking for user with userid "+ userid );
                callback(false, null);
            });
}

module.exports = userHelper;