var express = require('express');
var router = express.Router();	
var path = require('path');
var userModel = require("../models/users");
var md5 = require('md5');
/* GET home page. */
console.log(md5('hello'+'s1304'));

var appDir = path.dirname(require.main.filename);

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
    var currentUser =  {
        userid:req.body.admissionNumber,
        password:req.body.passwordLogin
    };

    userModel.findOne(currentUser).exec()
    .then(function(user){
        login(user, res);
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

function login(user, res){
    if (user) { 
            console.log(user);
            var user_response = {
                'userId':user.userid,
                'name':user.name,
                'adminOf':user.adminOf,
                'subChannels':user.subbedChannels,
                'department':user.department,
                'post':user.post
            }
            console.log("Sending data back")
            return res.status(210).json(user_response).end();
        }else {
            console.log("LOG: Location Index.js \n Message: Login failed, no matching user found");
            return res.status(220).json({auth:false}).end(); 
        }
}

module.exports = router;
