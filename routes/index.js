var express = require('express');
var router = express.Router();	
var path = require('path');
/* GET home page. */

var appDir = path.dirname(require.main.filename);

router.use(express.static(path.resolve(appDir,'public/controllers')));
//router.use(express.static(path.resolve(appDir,'public/css')));

router.get('/', function(req, res, next) {
  console.log("Inside Index Route");
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

	console.log("I got the name: "+ req.body.name);
	res.json({'status':'200'});

});

module.exports = router;
