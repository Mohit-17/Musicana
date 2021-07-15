const router = require('express').Router();
const passport = require('passport');
const user_choices = require('../models/user_choices');

// auth login
router.get('/login', (req, res) => {
    let array = [];
    res.render('login', { user: req.user,array:array});
});

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// auth with google+
router.get('/google', passport.authenticate('google', {
    scope: ['profile',"email"]
}));

// callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // res.send(req.user);
    user_choices.findOne({gmail:req.user.gmail}).then(User => {
        if(User){
            res.redirect('/profile/dashboard');
        } else {
            res.redirect('/profile');
        }
    });
});

module.exports = router;
