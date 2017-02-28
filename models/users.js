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
	},

	subChannels: {
		type: Array,
		default: [],
	},

	adminOf : {
		type:Array,
		default:['all'],
	}

});

userSchema.methods.identify = function (){
	console.log("Name: " + this.name);
	console.log("UserId: "+ this.userid);
}

userSchema.methods.someMethod = function () { }

userSchema.methods.hasToken = function () {
	if(this.msgToken) 
		return true;
	else return false;
}

var userModel = mongoose.model ('user', userSchema);

module.exports = userModel; 