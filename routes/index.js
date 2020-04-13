var express     = require('express');
var router      = express.Router();
var passport    = require('passport');
var User        = require('../models/user');
router.get("/", (req, res) => {
    res.render("landing");
});

// ======================
// AUTH routes
// ======================

// show register form
router.get('/register', (req, res) => {
    res.render('register');
});

// signup logic
router.post('/register', (req, res) => {
    var newUser = new User({
        username: req.body.username
    })
    User.register(newUser, req.body.password, (error, user) => {
        if (error) {
            req.flash('error', error.message);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', 'Welcome '+ user.username)
            res.redirect('/campgrounds')
        });
    });
});

// show login form
router.get('/login', (req, res) => {
    res.render('login');
});

// login logic
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}));

// LOGOUT route
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'logged you out');
    res.redirect('/campgrounds');
});

// // Login check Middleware
// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/login');
// }

module.exports = router;