var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	
	name : {
		type: String
	},

	userid : {
		type:String,
		required : true,
		unique : true
	},

	password : {
		type : String, 
		required : true
	},

	msgToken : {
		type : String,
		unique : true
	},

	subChannels: {
		type: Array,
		default: ['all']
	}

});

userSchema.methods.identify = function (){
	console.log("User Document\n");
	console.log("Name: " + this.name);
	console.log("UserId: "+ this.userid);
}

userSchema.methods.hasToken = function () {
	if(this.msgToken) 
		return true;
	else return false;
}

var userModel = mongoose.model ('user', userSchema);

module.exports = userModel; 