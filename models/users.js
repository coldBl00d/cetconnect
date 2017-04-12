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

	login_token : {
		type : String,
		unique : true, 
		required : true
	},

	user_token:{
		type: String, 
		unique:true,
		required: true
	},

	subbedChannels: {
		type: Array,
		default: [],
	},

	adminOf : {
		type:Array,
		default:['all'],
	},

	department:{
		type: String
	},

	batch : {
		type: Number
	},

	regTime:{
		type:Date,
		required: true
	},

	post:{
		type:String
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