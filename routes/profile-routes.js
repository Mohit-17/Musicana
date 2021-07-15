const router = require('express').Router();
const express = require('express');
const path = require('path');
const user_choices = require('../models/user_choices');
const User1 = require('../models/User');
const User2 = require('../models/user-model');
const liked_songs = require('../models/liked_songs');
const { spawn } = require('child_process');
const fs = require('fs');
const csv = require('csv-parser');
const randomWords = require('random-words');


// // set view engine
express().set('views', path.join(__dirname, '/views/src'));
router.use(express.static('views/src'));

//Body Parser
const bodyParser = require('body-parser');
router.use(express.urlencoded({ extended: true }));
router.use(bodyParser.json());

const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/');
    } else {
        next();
    }
};

const authCheck1 = (req, res, next) => {
    if (!req.user) {
        res.redirect('/');
    } else {
        if (req.user.gmail) {
            console.log(req.user.gmail);
            user_choices.findOne({ gmail: req.user.gmail }).then(user => {
                if (user) {
                    res.redirect('/profile/dashboard');
                } else {
                    next();
                }
            })
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(user => {
                if (user) {
                    res.redirect('/profile/dashboard');
                } else {
                    next();
                }
            })
        }
    }
}

const authCheck2 = (req, res, next) => {
    if (!req.user) {
        res.redirect('/');
    } else {
        if (req.user.googleId) {
            user_choices.findOne({ gmail: req.user.gmail }).then(user => {
                if (user) {
                    next();
                } else {
                    res.redirect('/profile');
                }
            })
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(user => {
                if (user) {
                    next();
                } else {
                    res.redirect('/profile');
                }
            })
        }
    }
}

router.get('/', authCheck1, (req, res) => {
    let errors = [];
    res.render('select', { errors: errors });
});

router.post('/', authCheck, (req, res) => {
    // console.log(req.body);
    if (req.user.googleId) {
        let array = [];
        for (key of Object.keys(req.body)) {
            array.push(key);
        }
        let errors = [];
        console.log(array.length);
        if (array.length == 0) {
            errors.push({ msg: '"Please select atleast one artist?"' });
            return res.render('select', { errors: errors });
        }
        //push user details as well as all the artist he/she likes in the database
        const preferences = new user_choices({
            username: req.user.username,
            artist: array,
            gmail: req.user.gmail
        });
        preferences.save();
        return res.redirect('/profile/dashboard');
    } else {
        let array = [];
        for (key of Object.keys(req.body)) {
            array.push(key);
        }
        let errors = [];
        console.log(array.length);
        if (array.length == 0) {
            errors.push({ msg: '"Please select atleast one artist?"' });
            return res.render('select', { errors: errors });
        }
        //push user details as well as all the artist he/she likes in the database
        const preferences = new user_choices({
            username: req.user.username,
            artist: array,
            gmail: req.user.email
        });
        preferences.save();
        return res.redirect('/profile/dashboard');
    }
});

router.get('/playlist', authCheck2, async function (req, res) {
    let songs = [];
    let process = await spawn('python', ['./routes/song_recommender.py'], { stdio: 'inherit' });
    process.on('data', data => {
        console.log(data.toString());
    });
    process.on('exit',async function() {
        fs.createReadStream('./routes/ResultML.csv')
        .pipe(csv())
        .on('data', async function (row) {
            const input = row.song;
            await songs.push(input);
        })
        .on('end', async function () {
            fs.createReadStream('./routes/ResultML1.csv')
                .pipe(csv())
                .on('data', async function (row) {
                    const input = row.song;
                    await songs.push(input);
                })
                .on('end', async function () {
                    fs.createReadStream('./routes/ResultML2.csv')
                        .pipe(csv())
                        .on('data', async function (row) {
                            const input = row.song;
                            await songs.push(input);
                        })
                        .on('end', function () {
                            res.render('ply',{songs:songs});
                        })
                })
        })
    });
});

router.get('/add_songs', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let artistRoute = {
                "Robbie Williams": '/profile/A1',
                "Foals": '/profile/A2',
                "Richard Galliano": '/profile/A3',
                "Joshua Redman": '/profile/A4',
                "Breyn Chritopher": '/profile/A5',
                "Lou Rhodes": '/profile/A6',
                "Robert Pollard": '/profile/A7',
                "Frenzal Rhomb": '/profile/A8'
            }
            return res.redirect(artistRoute[result.artist[0]]);
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let artistRoute = {
                    "Robbie Williams": '/profile/A1',
                    "Foals": '/profile/A2',
                    "Richard Galliano": '/profile/A3',
                    "Joshua Redman": '/profile/A4',
                    "Breyn Chritopher": '/profile/A5',
                    "Lou Rhodes": '/profile/A6',
                    "Robert Pollard": '/profile/A7',
                    "Frenzal Rhomb": '/profile/A8'
                }
                return res.redirect(artistRoute[result1.artist[0]]);
            });
        }
    });
});

router.get('/dashboard', authCheck2, (req, res) => {
    res.render('demo', { user: req.user });
});

router.get('/T50',authCheck,(req,res) => {
    res.render('T50');
})

//artist routes

router.get('/personal_profile', authCheck2, (req, res) => {
    if (req.user.gmail)
        res.render('prof', { name: req.user.username, email: req.user.gmail });
    else
        res.render('prof', { name: req.user.username, email: req.user.email });
})

router.post('/personal_profile', authCheck2, (req, res) => {
    User1.deleteMany({ email: req.body.remail }).then(tmp1 => {
        User2.deleteMany({ gmail: req.body.remail }).then(tmp2 => {
            user_choices.deleteMany({ gmail: req.body.remail }).then(tmp3 => {
                res.redirect('/logout');
            });
        });
    });
});

router.get('/A1', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let array = result.artist;
            return res.render('A1', { artist: array });
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let array = result1.artist;
                return res.render('A1', { artist: array });
            });
        }
    });
});

router.get('/A2', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let array = result.artist;
            return res.render('A2', { artist: array });
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let array = result1.artist;
                return res.render('A2', { artist: array });
            });
        }
    });
});

router.get('/A3', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let array = result.artist;
            return res.render('A3', { artist: array });
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let array = result1.artist;
                return res.render('A3', { artist: array });
            });
        }
    });
});

router.get('/A4', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let array = result.artist;
            return res.render('A4', { artist: array });
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let array = result1.artist;
                return res.render('A4', { artist: array });
            });
        }
    });
});

router.get('/A5', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let array = result.artist;
            return res.render('A5', { artist: array });
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let array = result1.artist;
                return res.render('A5', { artist: array });
            });
        }
    });
});

router.get('/A6', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let array = result.artist;
            return res.render('A6', { artist: array });
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let array = result1.artist;
                return res.render('A6', { artist: array });
            });
        }
    });
});

router.get('/A7', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let array = result.artist;
            return res.render('A7', { artist: array });
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let array = result1.artist;
                return res.render('A7', { artist: array });
            });
        }
    });
});

router.get('/A8', authCheck2, (req, res) => {
    user_choices.findOne({ gmail: req.user.gmail }).then(result => {
        if (result) {
            let array = result.artist;
            return res.render('A8', { artist: array });
        } else {
            user_choices.findOne({ gmail: req.user.email }).then(result1 => {
                let array = result1.artist;
                return res.render('A8', { artist: array });
            });
        }
    });
});

router.post('/A1', authCheck2, (req, res) => {
    let songs = [];
    for (key of Object.values(req.body)) {
        songs.push(key);
    }
    if (req.user.email) {
        liked_songs.findOne({ gmail: req.user.email }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A1');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.email
                });
                preferences.save();
                return res.redirect('/profile/A1');
            }
        });
    } else {
        liked_songs.findOne({ gmail: req.user.gmail }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A1');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.gmail
                });
                preferences.save();
                return res.redirect('/profile/A1');
            }
        });
    }
})


router.post('/A2', authCheck2, (req, res) => {
    let songs = [];
    for (key of Object.values(req.body)) {
        songs.push(key);
    }
    if (req.user.email) {
        liked_songs.findOne({ gmail: req.user.email }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A2');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.email
                });
                preferences.save();
                return res.redirect('/profile/A2');
            }
        });
    } else {
        liked_songs.findOne({ gmail: req.user.gmail }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A2');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.gmail
                });
                preferences.save();
                return res.redirect('/profile/A2');
            }
        });
    }
})


router.post('/A3', authCheck2, (req, res) => {
    let songs = [];
    for (key of Object.values(req.body)) {
        songs.push(key);
    }
    if (req.user.email) {
        liked_songs.findOne({ gmail: req.user.email }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A3');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.email
                });
                preferences.save();
                return res.redirect('/profile/A3');
            }
        });
    } else {
        liked_songs.findOne({ gmail: req.user.gmail }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A3');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.gmail
                });
                preferences.save();
                return res.redirect('/profile/A3');
            }
        });
    }
})

router.post('/A4', authCheck2, (req, res) => {
    let songs = [];
    for (key of Object.values(req.body)) {
        songs.push(key);
    }
    if (req.user.email) {
        liked_songs.findOne({ gmail: req.user.email }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A4');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.email
                });
                preferences.save();
                return res.redirect('/profile/A4');
            }
        });
    } else {
        liked_songs.findOne({ gmail: req.user.gmail }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A4');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.gmail
                });
                preferences.save();
                return res.redirect('/profile/A4');
            }
        });
    }
})

router.post('/A5', authCheck2, (req, res) => {
    let songs = [];
    for (key of Object.values(req.body)) {
        songs.push(key);
    }
    if (req.user.email) {
        liked_songs.findOne({ gmail: req.user.email }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A5');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.email
                });
                preferences.save();
                return res.redirect('/profile/A5');
            }
        });
    } else {
        liked_songs.findOne({ gmail: req.user.gmail }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A5');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.gmail
                });
                preferences.save();
                return res.redirect('/profile/A5');
            }
        });
    }
})

router.post('/A6', authCheck2, (req, res) => {
    let songs = [];
    for (key of Object.values(req.body)) {
        songs.push(key);
    }
    if (req.user.email) {
        liked_songs.findOne({ gmail: req.user.email }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A6');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.email
                });
                preferences.save();
                return res.redirect('/profile/A6');
            }
        });
    } else {
        liked_songs.findOne({ gmail: req.user.gmail }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A6');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.gmail
                });
                preferences.save();
                return res.redirect('/profile/A6');
            }
        });
    }
})
router.post('/A7', authCheck2, (req, res) => {
    let songs = [];
    for (key of Object.values(req.body)) {
        songs.push(key);
    }
    if (req.user.email) {
        liked_songs.findOne({ gmail: req.user.email }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A7');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.email
                });
                preferences.save();
                return res.redirect('/profile/A7');
            }
        });
    } else {
        liked_songs.findOne({ gmail: req.user.gmail }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A7');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.gmail
                });
                preferences.save();
                return res.redirect('/profile/A7');
            }
        });
    }
})

router.post('/A8', authCheck2, (req, res) => {
    let songs = [];
    for (key of Object.values(req.body)) {
        songs.push(key);
    }
    if (req.user.email) {
        liked_songs.findOne({ gmail: req.user.email }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A8');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.email
                });
                preferences.save();
                return res.redirect('/profile/A8');
            }
        });
    } else {
        liked_songs.findOne({ gmail: req.user.gmail }).then(result => {
            if (result) {
                let extracted = result.song;
                extracted.forEach(Element1 => {
                    for (let i = 0; i < songs.length; i++) {
                        if (Element1 == songs[i]) {
                            songs.splice(i, 1);
                        }
                    }
                });
                songs.forEach(Element => {
                    extracted.push(Element);
                });
                result.song = extracted;
                result.save();
                res.redirect('/profile/A8');
            } else {
                const preferences = new liked_songs({
                    username: req.user.username,
                    song: songs,
                    gmail: req.user.gmail
                });
                preferences.save();
                return res.redirect('/profile/A8');
            }
        });
    }
})
module.exports = router;
