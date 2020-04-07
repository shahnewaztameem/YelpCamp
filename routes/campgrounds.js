var express     = require('express');
var router      = express.Router();
var Campground  = require('../models/campground');

// INDEX - show all campgrounds
router.get("/", (req, res) => {
    Campground.find({}, function (error, campgrounds) {
        if (error) {
            console.log(error);
        } else {
            res.render("campgrounds/index", {
                campgrounds: campgrounds,
                currentUser: req.user
            });
        }
    });
});

// NEW - show form to create a new campground
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// CREATE - add a new campground to DV
router.post("/", isLoggedIn, (req, res) => {
    //get data from form and add to the campgrounds array
    var name = req.body.name;
    var imageUrl = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {
        name: name,
        image: imageUrl,
        description: description,
        author: author
    };
    Campground.create(newCampground, function (error, campgrounds) {
        if (error) {
            console.log(error);
        } else {
            //redirect back to the campgrounds page
            res.redirect('/campgrounds');
        }
    });
});

// SHOW - show more info about a specific campgrounds
router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate('comments').exec(function (error, foundCampground) {
        if (error) {
            console.log(error);
        } else {
            console.log(foundCampground);
            // render the show template with that campground
            res.render("campgrounds/show", {
                campground: foundCampground
            });
        }
    });
});

// EDIT campground 
router.get('/:id/edit', (req, res) => {
    Campground.findById(req.params.id, (error, foundCampground) => {
        if(error) {
            res.redirect('/campground');
        } else {
            res.render('campgrounds/edit',{campground: foundCampground});
        }
    })
    
});

// UPDATE campground 
router.put('/:id', (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (error, updatedCampground) => {
        if(error) {
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds/'+req.params.id);
        }
    });
});

// DESTROY campground 
router.delete('/:id', (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (error) => {
        if(error) {
            res.redirect('/campgrounds');
        } else {
            res.redirect('/campgrounds');
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