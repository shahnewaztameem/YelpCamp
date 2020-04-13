var Campground = require('../models/campground');
var Comment = require('../models/comment');

var middlewareObj = {};

// check for campground ownership
middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (error, foundCampground) => {
            if (error) {
                res.redirect('back');
            } else {
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect('back');
                }

            }
        });
    } else {
        res.redirect('back');
    }
}

// check for comment ownership
middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (error, foundComment) => {
            if (error) {
                res.redirect('back');
            } else {
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect('back');
                }

            }
        });
    } else {
        res.redirect('back');
    }
}

// Login check Middleware
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');

}
module.exports = middlewareObj;