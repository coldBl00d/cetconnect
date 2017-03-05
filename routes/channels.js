var express = require('express');
var router = express.Router();
var path = require('path');
var userHelper = require('../helper/userHelper')
var channelHelper = require('../helper/channelHelper');
var appDir = path.dirname(require.main.filename);
var header = "[channel router]";

router.get('/', function(req, res, next) {
  var options = {root: path.resolve(appDir, 'public/html/addChannel')};
  var fileName = 'addChannel.html';
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

router.post('/', function(req, res, next){
    var payload = req.body.payload;

    if(validatePayload(payload)){
        console.log(header,"Recieved proper payload, going to look for channel if it already exist");
        channelHelper.ifChannel(payload.channelName, function(result){
            if(result){
                console.log(header, "channel already exist, choose another name");
                res.status(421).end();
            }else{
                console.log(header, "Channel name is unique, proceeding to check if the admin exist");
                userHelper.ifUser(payload.admin, function(result,db_admin){
                    if(result){
                        console.log(header, "Verfied admin exist in system, Proceeding to add channel to system");
                        channelHelper.addBareboneChannel(payload.channelName, payload.admin, function(result) {
                            if(result){
                                console.log(header,"The new channel is added successfully");
                                console.log(header, "Updating channel to admins entry");
                                db_admin.adminOf.push(payload.channelName);
                                db_admin.save();
                                res.status(200).end();
                            }else{
                                console.log(header, "MongoDB failed to add channel to its database rolled back firebase");
                                res.status(423).end();
                            }
                        })
                    }else {
                        console.log(header, "Admin does not check out in the system. Select another admin");
                        res.status(422).end();
                    }
                })
            }
        });
    }else{
        console.log(header, "Payload is malformed");
        res.status(420).end();
    }
});

router.post('/subunsub',function(req, res, next){
    var userId = req.body.payload.userId;
    var channelName = req.body.payload.channelName;
    var status = req.body.payload.status;

    if(status){
        console.log( header,"User subbed");
        channelHelper.subbed(userId, channelName, function(result){
            if(result == 200){
                console.log(header, "channel "+ channelName +"added successfully");
                res.status(200).end();
            }else{
                console.log(header, "channel "+ channelName +" not added ");
                res.status(422).end();
            }
        });

    }else {
        console.log(header, "User unsubbed");

        channelHelper.unsubbed(userId, channelName, function(result){
            if(result == 200){
                console.log(header, "channel "+ channelName +"removed successfully");
                res.status(200).end();
            }else{
                console.log(header, "channel "+ channelName +" not removed ");
                res.status(422).end();
            }
        });

    }
   


});







function validatePayload(payload){
    if (payload.channelName && payload.admin){
        return true;
    }else return false;
}

module.exports = router;
