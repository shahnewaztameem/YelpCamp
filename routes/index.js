var express     = require('express');
var router      = express.Router();
var passport    = require('passport');
var User        = require('../models/user');
var Campground  = require('../models/campground');
var nodemailer  = require('nodemailer');
var async       = require('async');
var crypto      = require('crypto');
require('dotenv').config()


router.get("/", (req, res) => {
    res.render("landing");
});

// ======================
// AUTH routes
// ======================

// show register form
router.get('/register', (req, res) => {
    res.render('register', {page: 'register'});
});

// signup logic
router.post('/register', (req, res) => {
    var newUser = new User({
        username: req.body.username,
        avatar: req.body.avatar,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
    });
    if(req.body.adminCode == 'xpiredbrain') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (error, user) => {
        if (error) {
            req.flash('error', error.message);
            return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', 'Successfully Signed Up! Welcome '+ user.username);
            res.redirect('/campgrounds')
        });
    });
});

// show login form
router.get('/login', (req, res) => {
    res.render('login', {page: 'login'});
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

// forgot password
router.get('/forgot', (req, res) => {
    res.render('forgot');
});

// router.post('/forgot', (req, res) => {
//     async.waterfall([
//         function(done) {
//             crypto.randomBytes(20, function(err, buf) {
//                 var token = buf.toString('hex');
//                 done(err, token);
//             });
//         },
//         function(token, done) {
//             User.findOne({email: req.body.email}, function(error, user) {
//                 if(!user) {
//                     req.flash('error', 'No account with this email address exists');
//                     return res.redirect('/forgot');
//                 }
//                 user.resetPasswordToken = token;
//                 user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour
//                 user.save(function(error) {
//                     done(error, token, user);
//                 });
//             });
//         },
//         function(token, user, done) {
//             var smtpTransport = nodemailer.createTestAccount({
//                service: 'Gmail',
//                auth: {
//                    user: 'shahnewaztamim@gmail.com',
//                    pass: process.env.GMAILPW
//                } 
//             });
//             var mailOptions = {
//                 to: user.email,
//                 from: 'shahnewaztamim@gmail.com',
//                 subject: 'Password Reset',
//                 text: ' You are receiving this because you (or someone else) have requested the reset of the password '+
//                 'Please click on the following link  or paste this into your browser to complete the process'+
//                 'http://'+ req.headers.host+'/reset/'+ token +'\n\n'+
//                 'If you did not request this please ignore this email and your password will remain unchanged'
//             };
//             smtpTransport.sendMail(mailOptions, function(error) {
//                 console.log('mail send');
//                 req.flash('success', 'An email has been sent to ' + user.email + ' with further instructions');
//                 done(error, done);
//             });
//         }
//     ], function(error) {
//         if(error) return next(error);
//         res.redirect('/forgot')
//     });
// });

router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'shahnewaztameem@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'shahnewaztameem@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'shahnewaztamim@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'shahnewaztamim@mail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/campgrounds');
    });
  });

// User profile
router.get('/users/:id', (req, res) => {
    User.findById(req.params.id, (error, foundUser) => {
        if(error) {
            req.flash('error', 'User not found');
            res.redirect('/campgrounds');
        } else {
            Campground.find().where('author.id').equals(foundUser._id).exec(function(error, campgrounds) {
                if(error) {
                    req.flash('error', 'User not found');
                    res.redirect('/campgrounds');
                } else {
                    res.render('users/show', {user: foundUser, campgrounds: campgrounds});
                }
                
            });
            
        }
    })
});



// // Login check Middleware
// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/login');
// }

module.exports = router;