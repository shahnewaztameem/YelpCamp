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
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
               if(allCampgrounds.length < 1) {
                   noMatch = "No campgrounds match that query, please try again.";
               }
               res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
            }
         });
    } else {
        Campground.find({}, function (error, campgrounds) {
            if (error) {
                req.flash('error', 'Campground not found');
                console.log(error);
            } else {
                res.render("campgrounds/index", {
                    campgrounds: campgrounds,
                    currentUser: req.user,
                    page: 'campgrounds',
                    noMatch: noMatch
                });
            }
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
    Campground.findOne({slug: req.params.slug}).populate('comments').exec(function (error, foundCampground) {
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}



module.exports = router;