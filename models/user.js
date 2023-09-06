const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose); //from passport-local-mongoose docs.
// Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value. Additionally, Passport-Local Mongoose adds some methods to your Schema.

module.exports = mongoose.model('User',userSchema);
