var mongoose = require('mongoose');

var messagesSchema = new mongoose.Schema({
	
	senderId : {
		type: String,
        required: true
	},

	recieverId : {
        type:String,
        required: true
    },

	message : {
		type : String,
        required: true
	}

});

var messagesModel = mongoose.model ('messages', messagesSchema);

module.exports = messagesModel; 