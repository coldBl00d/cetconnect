var express = require('express');
var router = express.Router();
var path = require('path');
var userHelper = require('../helper/userHelper')
var channelHelper = require('../helper/channelHelper');
var appDir = path.dirname(require.main.filename);
var header = "[channel router]";



router.post('/subunsub', function (req, res, next) {
    var userToken = req.body.payload.userToken;
    var channelName = req.body.payload.channelName;
    var status = req.body.payload.status;

    if (status) {
        console.log(header, "User subbed");
        channelHelper.subbed(userToken, channelName, function (result) {
            if (result == 200) {
                console.log(header, "channel " + channelName + " added successfully");
                res.status(200).end();
            } else {
                console.log(header, "channel " + channelName + " not added ");
                res.status(422).end();
            }
        });

    } else {
        console.log(header, "User unsubbed");

        channelHelper.unsubbed(userToken, channelName, function (result) {
            if (result == 200) {
                console.log(header, "channel " + channelName + " removed successfully");
                res.status(200).end();
            } else {
                console.log(header, "channel " + channelName + " not removed ");
                res.status(422).end();
            }
        });

    }



});


router.get('/getChannels', function(req, res, next){
    console.log('here');
    channelHelper.getAllChannels(function(list){
        if(list.length){
            JSONList = JSON.stringify(list);
            res.json({channels:JSONList}).status(200).end();
        }else{
            res.json({status:"Failed to get the channel list"}).status(404).end();
        }
    });
});




function validatePayload(payload) {
    if (payload.channelName && payload.admin) {
        return true;
    } else return false;
}

module.exports = router;
