/// <reference path="/node_modules/firebase/firebase-database.js" />
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');


//var register = require('./routes/register');
var index = require('./routes/index');
var users = require('./routes/users');
var broadcast = require('./routes/broadcast');
var channel = require('./routes/channels.js');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/broadcast',broadcast);
app.use('/channel',channel);

var options ={
    user:"coldBl00d",
    pass:'somesomepassword'
}

mongoose.connect('localhost:27017/test', function(err){
    if (err){
        console.log("Database connection failed");
    }else{
        console.log("Database connection successfull");
    }
});




http.createServer(app).listen(process.env.PORT| 3000, function() {
	console.log("CET CONNECT running at 3000" );
});

console.log('App running at 3000');


module.exports = app;
