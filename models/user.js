const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema ({
    username: {
        type: String,
        required: true,
    },
    gpNum: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    }
});

userSchema.plugin(passportLocalMongoose); //username, hashing, saling done here

module.exports = mongoose.model('User', userSchema);