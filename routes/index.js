var express = require('express');
var router = express.Router();	
var path = require('path');
var userModel = require("../models/users");
/* GET home page. */

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
                'subChannels':user.subChannels
            }
            console.log("Sending data back")
            return res.status(210).json(user_response).end();
        }else {
            console.log("LOG: Location Index.js \n Message: Login failed, no matching user found");
            return res.status(410).end(); 
        }
}

module.exports = router;
