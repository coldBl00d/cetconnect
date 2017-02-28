var express = require('express');
var router = express.Router();	
var path = require('path');
var userModel = require("../models/users");
/* GET home page. */

var appDir = path.dirname(require.main.filename);

//router.use(express.static(path.resolve(appDir,'public/controllers')));

router.get('/', function(req, res, next) {

    
  var options = {
    root: path.resolve(appDir, 'views')
  };

  var fileName = 'index.html';
  res.sendFile(fileName, options, function (err) {
    if (err) {
      //console.log(options.root+"/index.html");
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});

router.post('/', function(req, res, next){
    console.log ("In post")
     
    var currentUser =  {
        userid:req.body.admissionNumber,
        password:req.body.passwordLogin
    };
    
    userModel.findOne(currentUser).exec()
    .then(function(user){
        if (user) { 
            console.log(user);
            res.json({'status':'200'});
        }else {
            console.log("LOG: Location Index.js \n Message: Login failed, no matching user found");
            res.json({'status':'300'});
        }
    }).catch(function(err){
        res.status(304);
    });

});

module.exports = router;
