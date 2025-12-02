const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    lastname:String,
    email:{type:String,unique:true},
    password:String,
    phone:String
})

module.exports = mongoose.model("User",userSchema)