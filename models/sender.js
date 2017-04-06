var mongoose = require('mongoose');

var senderSchema = new mongoose.Schema({
	
	senderId : {
		type: String,
        required: true
	},


	senderName:{
		type:String, 
		required: true
	},

	recipientName:{
		type:String, 
		required: true
	},

	recipientId : {
        type:String,
        required: true
    },

	subject :{
		type:String, 
		required: true
	},

	message : {
		type : String
	},

	timestamp:{
		type:Date
	}
	
});

var senderModel = mongoose.model ('senderCopy', senderSchema);

module.exports = senderModel; 