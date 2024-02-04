const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    password: String
});

userSchema.plugin(passportLocalMongoose, { usernameQueryFields: ['email'], usernameField: 'email' });

module.exports = mongoose.model("User", userSchema);