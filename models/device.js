var mongoose = require('mongoose');

var deviceSchema = new mongoose.Schema({
	
	deviceToken : {
		type: String,
        unique:true,
		index: true
	},

	userId : {
        type:String,
        index:true
    },

});

var deviceModel = mongoose.model ('device', deviceSchema);

module.exports = deviceModel; 