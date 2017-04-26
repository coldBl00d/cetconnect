var express = require('express');
var router = express.Router();
var userHelper = require('../helper/userHelper');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/updateUserData', function(req, res, next){

  var payload = req.body.payload;
  var userToken = payload.userToken; 
  
  userHelper.ifUserToke(userToken, function(result, user){
      if(result){
        if(payload.post){
          user.post = payload.post;
        }else if(payload.department){
          user.department = payload.department;
        }else if(payload.batch){
          user.batch = payload.batch;
        }
        user.save(function(err){
          if(err){
            res.status(500).json({message:'Server errored out while updating'}).end();
          }else{
            res.status(200).json({message:'Details Updated'}).end();
          }
        });
      }else{
        console.log(header,'There is no user with the token '+ userToken);
        res.status(201).json({message:'Invalid user token'}).end();
      }
  });
});

router.post('/updatePassword', function(req, res, next){

  var payload = req.body.payload; 
  

});

module.exports = router;
