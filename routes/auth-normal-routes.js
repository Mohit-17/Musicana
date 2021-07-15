const passport = require('passport');
const router = require('express').Router();
const User = require('../models/User');
const User1 = require('../models/user-model')
const ContactUs = require('../models/contact_us');
const bodyParser = require('body-parser');
const { validationResult } = require('express-validator');
const express = require('express');

router.use(express.static('views/src'));

router.use(express.urlencoded({ extended: true }));

let jsonParser = bodyParser.json();
//auth login

const authCheck = (req, res, next) => {
    if(req.user){
        res.redirect('/profile/dashboard');
    } else {
        next();
    }
};

router.get('/', authCheck,(req, res) => {
    res.render('Index',{user:req.user});
});

router.get('/about', authCheck, (re1,res) => {
    res.render('About');
});

router.get('/contact_us', authCheck, (req,res) => {
    const errors = [];
    const response = [];
    res.render('Cont',{errors:errors,response:response});
});

router.post('/contact_us',authCheck,(req,res) => {
    let errors = []
    let response = [];
    const { firstname, lastname, country, subject} = req.body; 
    if(firstname == '' || lastname == '' || country == '' || subject == ''){
        errors.push({msg:'Please fill in all the details'});
    }
    let feedback = subject;
    if(errors.length > 0){
        res.render('Cont',{errors:errors,response:response});
    } else {
        const suggestion = new ContactUs({
            firstname,
            lastname,
            country,
            feedback
        });
        suggestion.save();
        response.push({msg:'Thank you for your feedback!'});
        res.render('Cont',{errors:errors,response:response});
        errors = [];
        response = [];
    }
});

// auth logout

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/local_signup',(req,res,next) => {
    let array = [];
    let user = '';
    if(!req.user){
        res.render('login',{array:array});
    } else {
        res.render('Index',{user:req.user});
    }
})

router.post('/sign_up',(req,res) => {
    const { name,email,password } = req.body;
    let username = name;
    let array = [];
    // const {name, contact_no } = req.body;
    if( (email == '') || (password == '') || (username == '')){
        array.push({msg:'Please enter all details'});   
    }
    else if(password.length <= 6){
        array.push({msg:'Password length must be of atleast 6 characters'});
    }
    if(array.length > 0) {
        return res.render('login',{array:array});
    } else {
        const user = new User({
            username,
            email,
            password
        });
        User.findOne({email:email}).then(user1 => {
            User1.findOne({gmail:email}).then(user2 => {
                if(user1 || user2){
                    array.push({msg:"This Email is already registered"});
                    return res.render('login',{array:array});
                } else {
                    user.save().then(usr => {
                        req.logIn(usr,function(err){
                            if (err) return res.send(err);
                            return res.redirect('/profile');
                        });
                    }).catch(error => {
                        let arr = [];
                        const errors = validationResult(req);
                        const extractedErrors = [];
                        errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
                        console.log(extractedErrors.err);
                        arr.push({msg:error});
                        return res.render('login',{array:arr});
                    });
                }
            })
        })
    }
})

router.post('/sign_in',(req,res,next) => {
    passport.authenticate('normal-users',function(err,normal_users,info){
        let error = err || info;
        let array = [];
        if(error)
            array.push({msg:error.message});
        if(error) return res.render('login',{user:req.user,array:array});
        req.logIn(normal_users,function(err){
            if (err) return res.send(err);
            return res.redirect('/profile');
        });
    })(req,res,next)
})

module.exports = router;