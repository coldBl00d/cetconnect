var mongoose = require('mongoose');

var channelSchema = new mongoose.Schema({
	
	channelName : {
		type: String,
        unique:true,
	},

	subscribers : {
        type:Array,
        default:['jhon-doe']
    },

	admins : {
		type : Array, 
		default: []
	}

});

var channelModel = mongoose.model ('user', userSchema);

module.exports = channelModel; 