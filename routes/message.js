var express = require('express');
var path = require('path');
var userHelper = require('../helper/userHelper')
var channelHelper = require('../helper/channelHelper');

var router = express.Router();
var appDir = path.dirname(require.main.filename);
var header = "[Messaging Router]";