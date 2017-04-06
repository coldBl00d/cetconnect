var mongoose = require('mongoose');

var recieverSchema = new mongoose.Schema({
	
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

	subject:{recipientName:{
		type:String, 
		required: true
	},

		type:String,
		required:true
	},

	message : {
		type : String
	},

    timestamp:{
		type:Date
	},

	read :{
		type:Boolean
	}

});

var recieverModel = mongoose.model ('recieverCopy', recieverSchema);

module.exports = recieverModel; 