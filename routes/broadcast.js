var express = require('express');
var router = express.Router();
var path = require('path');
var firebaseadmin = require('../firebase-admin.js');
var rtdb = firebaseadmin.database();
var userModel = require("../models/users");
var channelHelper = require('../helper/channelHelper');
var userHelper = require('../helper/userHelper');

var header = "[BROADCAST]";
var appDir = path.dirname(require.main.filename);

router.get('/', function (req, res, next) {

    var options = {
        root: path.resolve(appDir, 'public/html/broadcastForm')
    };

    var fileName = 'bForm.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            //console.log(options.root+"/index.html");
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });

});

router.get('/request', function (req, res, next) {
    var options = {
        root: path.resolve(appDir, 'public/html/incomingRequest')
    };

    var fileName = 'incomingRequest.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err);
        } else {
            console.log('Sent:', fileName);
        }
    });

});

router.post('/', function (req, res, next) {
    response = res;
    payload = req.body.payload;
    console.log(payload);
    if (payload.adminApproved) {
        sendBroadcast(payload);
        res.send(200).end();
    } else {
        userModel.findOne({ userid: payload.userId })
            .exec()
            .then(function (user) {
                var flag = 0;
                if (user) {
                    console.log(header, "User found...");
                    console.log(header, "Proceeding to find if he is admin");
                    for (var i = 0; i < user.adminOf.length; i++) {
                        //make sure the channel name in payload is small case
                        if (user.adminOf[i] == payload.channel) {
                            flag = 1;
                            console.log(header, "user verified as admin, sending payload");
                            sendBroadcast(payload);
                            return res.status(200).end();
                        }
                    }
                    if (flag == 0) {
                        console.log(header, "user " + payload.userId + "is not an admin for channel " + payload.channel);
                        res.status(403).end();
                    }
                } else {
                    console.log(header, "user " + payload.userId + " is not part of the system");
                    res.status(404).end();
                }

            })
            .catch(errorCallBack);
    }

});

router.post('/request', function (req, res, next) {
    var header = '[BROADCAST REQUEST]';
    var payload = req.body.payload;

    var userId = payload.userId;
    var channel = payload.channel;

    userHelper.ifUser(userId, function (result, user) {
        if (result) {
            console.log(header, "User " + userId + " is validated, proceeding to check if the channel is valid");
            channelHelper.ifChannel(channel, function (result) {
                if (result) {
                    console.log(header, "The channel " + channel + " exist, proceeding to post to firebase");
                    sendRequest(payload, res);
                } else {
                    console.log(header, "The channel " + channel + " does not exist");
                    return res.status(425).end();
                }
            });

        } else {
            console.log(header, "The user " + payload.userName + " does not exist in the system");
            return res.status(424).end();
        }
    })



});

router.post('/request/accept', function (req, res, next) {
    var header = '[request accept]';
    var payload = req.body.payload;
    var admin = payload.approvedBy;
    userHelper.ifUser(admin, function (result, user) {
        if (result) {
            console.log(header, "Proposed admin exist in the system");
            var adminOf = Array.from(user.adminOf);
            var index = adminOf.findIndex(function (item) { return item == payload.channel });
            if (index != -1) {
                console.log(header, "The proposed admin is indeed the admin of the channel");
                console.log(payload);
                acceptedRequest(payload);
                res.status(200).json({ message: "Broadcast approved" }).end();
            } else {
                console.log(header, "Not an admin to accept this request");
                res.status(400).json({ message: "You are not an admin to accept this request" }).end();
            }
        } else {
            console.log(header, "The admin does not exist in the system");
            res.status(404).json({ message: "You are not part of the system" }).end();
        }

    });
});

function acceptedRequest(payload) {
    sendBroadcast(payload);
    removeRequest(payload.key);

}

function errorCallBack(err) {
    console.log(err);
    console.log(header, "Database failure when finding the user identifyin the user who send the broadcast");
}

function removeRequest(key) {
    var requestUri = '/request/';
    var requestRef = rtdb.ref(requestUri).child(key);
    requestRef.remove();
}

function sendBroadcast(payload) {
    //console.log(payload);
    var channel = payload.channel;
    var referenceToBroadcast = rtdb.ref('channel/' + channel + '/broadcasts');
    var key = referenceToBroadcast.push().key;
    var timestamp = new Date();
    var today = timestamp.getDate() + '-' +
        timestamp.getMonth().toString() + '-' +
        timestamp.getFullYear().toString();
    var referenceToToday = rtdb.ref('today/' + today + '/' + key);


    rtdb.ref('channel/' + channel + '/broadcasts/' + key).set(payload);
    referenceToToday.set(payload);

}

function sendRequest(payload, res) {
    var header = '[sendBroadcast]';
    var requestUri = '/request';
    var requestReference = rtdb.ref(requestUri);
    var key = requestReference.push({}, function (err) {
        if (err) {
            console.log(header, "Writing key failed into firebase");
            res.status(426).end();
        } else {
            console.log(header, "Writing key successfull into firebase");
        }
    }).key;

    requestReference.child(key).set({
        userId: payload.userId,
        userName: payload.userName,
        department: payload.department,
        post: payload.post,
        channel: payload.channel,
        title: payload.title,
        message: payload.message,
        timestamp: payload.timestamp
    }, function (err) {
        if (err) {
            console.log(header, "failed writing the data to firebase, you should probably delete the key");
            res.status(427).end();
        } else {
            console.log(header, "Request succesffully posted to firebase");
            res.status(200).end();
        }
    });
}

module.exports = router;