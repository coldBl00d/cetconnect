/// <reference path="/node_modules/firebase/firebase-database.js" />
var express = require('express');
var app = express();
var server = require('http').Server(app);
/*****************Basic Stuffs*************** */
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var header ="[APP]";
/********************************************* */

/*****************Socket Stuffs********* */
var io = require('socket.io')(server);
var systemVariables = {
    openRegistration: false, 
    clients: new Map(), 
    io:io
}
module.exports = systemVariables;
var clientHelper = require('./helper/clientHelper');
var socketHelper = require('./helper/socketHelper');
/***************************************** */


/******************Routers ************* */
var index = require('./routes/index');
var users = require('./routes/users');
var broadcast = require('./routes/broadcast');
var channel = require('./routes/channels.js');
var messages = require('./routes/messages.js');
var register = require('./routes/register');
var admin = require('./routes/admin');
/****************************************** */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/', index);
app.use('/users', users);
app.use('/broadcast',broadcast);
app.use('/channel',channel);
app.use('/messages', messages);
app.use('/register', register);
app.use('/admin', admin);

//'mongodb://coldBl00d:somesomepassword@ds115870.mlab.com:15870/test9847'



var heroku = false;
var port, dbAddr;

if(heroku){
    port=process.env.PORT;
    dbAddr = 'mongodb://coldBl00d:somesomepassword@ds115870.mlab.com:15870/test9847';
}else{
    port=3000;
    dbAddr='localhost:27017/campusConnect';
}


mongoose.connect('mongodb://coldBl00d:somesomepassword@ds115870.mlab.com:15870/test9847', function(err){
    if (err){
        console.log("Database connection failed");
    }else{
        console.log("Database connection successfull");
    }
});

server.listen(port, function(){
    console.log('Campus connect running at '+ port);
});

var firebaseadmin = require('./firebase-admin.js');

