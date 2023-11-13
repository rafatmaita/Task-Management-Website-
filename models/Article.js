const Mongoose = require("mongoose")
const Schema = Mongoose.Schema
const UsersSchema = new Schema({
    id : String,
    username: String,
    email : String,
    password : String
})
const Users = Mongoose.model("users",UsersSchema)


module.exports = {Users};