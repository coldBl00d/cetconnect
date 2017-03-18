var mongoose = require('mongoose');

var senderSchema = new mongoose.Schema({
	
	senderId : {
		type: String,
        required: true
	},

	recieverId : {
        type:String,
        required: true
    },

	message : {
		type : String
	},

	timeStamp:{
		type:Date
	}
	
});

var senderModel = mongoose.model ('senderCopy', senderSchema);

module.exports = senderModel; 