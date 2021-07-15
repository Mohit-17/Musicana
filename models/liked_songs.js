const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    song: [{
        type:String
    }],
    gmail: String
});

const liked_songs = mongoose.model('liked_song', userSchema);

module.exports = liked_songs;
