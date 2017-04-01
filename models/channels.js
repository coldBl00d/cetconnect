var mongoose = require('mongoose');

var channelSchema = new mongoose.Schema({
	
	channelName : {
		type: String,
        unique:true,
		index: true
	},

	subscribers : {
        type:Array,
        default:[]
    },

	admins : {
		type : Array, 
		default: []
	}

});

var channelModel = mongoose.model ('channel', channelSchema);

module.exports = channelModel; 