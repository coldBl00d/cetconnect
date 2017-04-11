var mongoose = require('mongoose');

var schemaFormat = {

    userId : {
        type: String, 
        required: true, 
        unique: true
    },

    loginToken :{
        type: String, 
        required : true, 
        unique : true
    }

};

var adminSchema = new mongoose.Schema(schemaFormat);
var adminModel = mongoose.model(adminSchema);
module.exports = adminModel;

