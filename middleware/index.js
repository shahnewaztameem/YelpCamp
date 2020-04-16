var Campground = require('../models/campground');
var Comment = require('../models/comment');

var middlewareObj = {};

// check for campground ownership
middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (error, foundCampground) => {
            if (error) {
                req.flash('error', 'Something went wrong');
                res.redirect('back');
            } else {
                // Added this block, to check if foundCampground exists, and if it doesn't to throw an error via connect-flash and send us back to the homepage
                if (!foundCampground) {
                    req.flash("error", "Item not found.");
                    return res.redirect("back");
                }
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error', 'You do not have permission to do that');
                    res.redirect('back');
                }

            }
        });
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('/campgrounds');
    }
}

// check for comment ownership
middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (error, foundComment) => {
            if (error) {
                req.flash('error', 'Something went wrong');
                res.redirect('back');
            } else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error', 'You do not have permission to do that');
                    res.redirect('/campgrounds');
                }

            }
        });
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('/campgrounds');
    }
}

// Login check Middleware
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You need to login first to do that!');
    res.redirect('/login');

}
module.exports = middlewareObj;