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
	}

});

userSchema.methods.identify = function (){
	console.log("Name: " + this.name);
	console.log("UserId: "+ this.userid);
}

var userModel = mongoose.model ('user', userSchema);

module.exports = userModel; 