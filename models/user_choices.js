const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const list = new Schema([String]);

const userSchema = new Schema({
    username: String,
    artist: [{
        type:String
    }],
    gmail: String
});

const user_choices = mongoose.model('choice', userSchema);

module.exports = user_choices;
