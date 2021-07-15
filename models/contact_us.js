const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: String,
    lastname: String,
    country: String,
    feedback: String
});

const ContactUs = mongoose.model('contact', userSchema);

module.exports = ContactUs;
