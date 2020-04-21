var express     = require('express');
var router      = express.Router();
var Campground  = require('../models/campground');
var Comment     = require('../models/comment');
var middleware  = require('../middleware');


/* =====================================================
 /****************image upload*************************/
// ================================================= */
var multer  = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
    cloudinary.config({ 
        cloud_name: 'dwhdli8yc', 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
        });

// INDEX - show all campgrounds
router.get("/", (req, res) => {
    var perPage = 5;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allCampgrounds.length < 1) {
                        noMatch = "No campgrounds match that query, please try again.";
                    }
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});

// NEW - show form to create a new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// CREATE - add a new campground to DB
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.slug);
      });
    });
});


// SHOW - show more info about a specific campgrounds
router.get("/:slug", (req, res) => {
    Campground.findOne({slug: req.params.slug}).populate('comments likes').exec(function (error, foundCampground) {
        if (error) {
            console.log(error);
            req.flash('error', 'INVALID QUERY');
            res.redirect("/campgrounds");
        } else {
            console.log(foundCampground);
            // render the show template with that campground
            res.render("campgrounds/show", {
                campground: foundCampground,
                currentUser: req.user
            });
        }
    });
});

// EDIT campground 
router.get('/:slug/edit', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findOne({slug: req.params.slug}, (error, foundCampground) => {
        if(error) {
            req.flash('error', 'Campground not found');
            res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit',{campground: foundCampground, currentUser: req.user});
            
    });
});

// UPDATE campground 
router.put('/:slug',middleware.checkCampgroundOwnership, upload.single('image'), (req, res) => {
    Campground.findOne({slug:req.params.slug}, async (error, campground) => {
        if(error) {
            req.flash('error', error.message);
            res.redirect('/campgrounds');
        } else {
            if(req.file) {
            try {
                await cloudinary.v2.uploader.destroy(campground.imageId);
                var result = await cloudinary.v2.uploader.upload(req.file.path);
                campground.imageId = result.public_id;
                campground.image = result.secure_url;
            } catch (error) {
                req.flash('error', error.message);
                return res.redirect('/campgrounds');
            }
        }
            campground.name = req.body.name;
            campground.price = req.body.price;
            campground.description = req.body.description;
            campground.save(function(error) {
                if(error) {
                    console.log(err);
                    res.redirect("/campgrounds");
                } else {
                    res.redirect("/campgrounds/" + campground.slug);
                }
            });
            req.flash('success', 'Campground updated');
            res.redirect('/campgrounds/'+req.params.slug);
        }
    });
});

// DESTROY campground 
router.delete('/:slug', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findOneAndRemove({slug: req.params.slug}, (error, campgroundRemoved) => {
        if(error) {
            req.flash('error', 'Campground not found');
            res.redirect('/campgrounds');
        } else {
            Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
                if (err) {
                    console.log(err);
                }
                req.flash('error', ' Campground successfully deleted!');
                res.redirect("/campgrounds");
            });
        }
    });
});

// DELETE route
router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

// Campground Like route
router.post('/:slug/like', middleware.isLoggedIn, function(req, res) {
    Campground.findOne({slug: req.params.slug}, function(error, foundCampground){
        if(error) {
            req.flash('error', error.message);
            return res.redirect('/campgrounds');
        } // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground.slug);
        });
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}



module.exports = router;