var express = require('express');
var router = express.Router();	
var path = require('path');
var userModel = require("../models/users");
var md5 = require('md5');
/* GET home page. */
var header = '[index]'
var appDir = path.dirname(require.main.filename);
var systemVariables = require('../app.js');

router.get('/', function(req, res, next) {

  var options = {root: path.resolve(appDir, 'views')};
  var fileName = 'index.html';
  
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});

router.post('/', function(req, res, next){

    var userid = req.body.admissionNumber;
    var password = req.body.passwordLogin;



    userModel.findOne({userid:userid}).exec()
    .then(function(user){
        login(user, password, res);
    }).catch(function(err){
        res.status(304);
    });

});


/* when the database finds a user with matching 
username and password, this function packages the userdata 
for the client and sends the resposnse to the client. 
On successfull Login 
    response: 
        status: 210 
        data : name, userId, adminOf, subChannels
On failure: 
    response:
        status:410 
        data: null 
*/

function login(user, password, res){
        if (user) { 
            var login_token_recieved = md5(user.userid+password+user.regTime);
            var login_token = user.login_token;
            if(login_token_recieved==login_token){
                var user_response = {
                    'userId':user.userid,
                    'userToken':user.user_token,
                    'name':user.name,
                    'adminOf':user.adminOf,
                    'subChannels':user.subbedChannels,
                    'department':user.department,
                    'post':user.post
                }
                console.log("Sending data back")
                return res.status(210).json(user_response).end();
            }else{
                console.log(header, "Wrong password for "+ user.userid)
                return res.status(220).json({auth:false}).end(); 
            }
        }else {
            console.log("LOG: Location Index.js \n Message: Login failed, no matching user found");
            return res.status(220).json({auth:false}).end(); 
        }
}


module.exports = router;
