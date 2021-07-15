const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');
const User1 = require('../models/User');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User1.findById(id).then((user) => {
        if (user) {
            done(null, user);
        } else {
            User.findById(id).then((user) => {
                done(null, user);
            })
        }
    })
})

passport.use(
    new GoogleStrategy({
        //options for the google stategy
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/redirect',
        proxy:true
    }, (accessToken, refreshToken, profile, done) => {
        //check if user already exists in our database
        // console.log(profile);
        User.findOne({ googleId: profile.id }).then((currentUser) => {
            if (currentUser) {
                //already have the user
                done(null, currentUser);
            } else {
                //if not,create new user in our db
                new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    thumbnail: profile._json.picture,
                    gmail:profile._json.email
                }).save().then((newUser) => {
                    done(null, newUser);
                });
            }
        });
    })
);

passport.use('normal-users', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function (email, password, done) {
        User1.findOne({ email: email }).then((currentUser) => {
            if (currentUser) {
                const auth = bcrypt.compareSync(password, currentUser.password);
                if (auth) {
                    done(null, currentUser);
                } else {
                    return done(null, false, {
                        message: "Password is incorrect"
                    })
                }
                //password authentication remaining
            } else {
                return done(null, false, {
                    message: "This email is not registered"
                });
            }
        })
    }
));