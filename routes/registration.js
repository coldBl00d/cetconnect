var systemVariables = require('../app.js'); 
var md5 = require('md5');
var express = require('express');
var router = express.Router();	
var path = require('path');
var appDir = path.dirname(require.main.filename);
var header = "[Register Router]";
