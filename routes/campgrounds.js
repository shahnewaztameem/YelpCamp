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
router.get("/new", (req, res) => {
    res.render("campgrounds/new");
});

// CREATE - add a new campground to DV
router.post("/", (req, res) => {
    //get data from form and add to the campgrounds array
    var name = req.body.name;
    var imageUrl = req.body.image;
    var description = req.body.description;
    var newCampground = {
        name: name,
        image: imageUrl,
        description: description
    };
    Campground.create(newCampground, function (error, campgrounds) {
        if (error) {
            console.log(error);
        } else {
            //redirect back to the campgroundspage
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

module.exports = router;