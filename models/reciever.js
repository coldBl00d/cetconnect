var mongoose = require('mongoose');

var recieverSchema = new mongoose.Schema({
	
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

var recieverModel = mongoose.model ('recieverCopy', recieverSchema);

module.exports = recieverModel; 