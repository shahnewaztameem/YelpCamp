var express     = require('express');
var router      = express.Router({mergeParams: true});
var Campground  = require('../models/campground');
var Comment     = require('../models/comment');
// ======================
// COMMENTS Routes
// ======================

// Comments NEW
router.get('/new', isLoggedIn, (req, res) => {
    // find campgroud by id
    Campground.findById(req.params.id, (error, campground) => {
        if (error) {
            console.log(error);
        } else {
            res.render("comments/new", {
                campground: campground
            });
        }
    });

});

// Comments CREATE
router.post('/', isLoggedIn, (req, res) => {
    // lookup campground using id
    Campground.findById(req.params.id, (error, campground) => {
        if (error) {
            console.log(error);
            res.redirect('/campgrounds');
        } else {
            Comment.create(req.body.comment, (error, comment) => {
                if (error) {
                    console.log(error);
                } else {
                    // add username and id to comment
                    comment.author.id        = req.user._id;
                    comment.author.username  = req.user.username;
                    // save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
    
});


// Login check Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;