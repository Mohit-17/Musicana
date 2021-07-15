const express = require('express');
const cookieSession = require('cookie-session');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const normal_route = require('./routes/auth-normal-routes');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
app.use(express.static('views/src'));
const port = process.env.PORT || 3000;
// set view engine
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views/src'));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// set up session cookies

app.use(cookieParser(keys.session.cookieKey));

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, { useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true }, () => {
    console.log('connected to mongodb');
});
// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/normal_login',normal_route);

app.use('/',normal_route);

app.listen(port, () => {
    console.log('app now listening for requests on port 3000');
});
