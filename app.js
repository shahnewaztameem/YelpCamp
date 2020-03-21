var express   = require("express"),
  bodyParser  = require("body-parser"),
  mongoose    = require("mongoose"),
  Campground  = require('./models/campground'),
  Comment     = require('./models/comment'),
  seedDB      = require('./seeds'),
  app         = express();

seedDB();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//DB connection
mongoose.connect("mongodb://localhost/yelp_camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


app.get("/", (req, res) => {
  res.render("landing");
});

// INDEX - show all campgrounds
app.get("/campgrounds", (req, res) => {
  Campground.find({}, function (error, campgrounds) {
    if (error) {
      console.log(error);
    } else {
      res.render("campgrounds/index", {
        campgrounds: campgrounds
      });
    }
  });
});

// NEW - show form to create a new campground
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// CREATE - add a new campground to DV
app.post("/campgrounds", (req, res) => {
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
app.get("/campgrounds/:id", (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec(function(error, foundCampground){
    if(error) {
      console.log(error);
    } else {
      console.log(foundCampground);
      // render the show template with that campground
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

// ======================
// COMMENTS Routes
// ======================
app.get('/campgrounds/:id/comments/new', (req, res) => {
  // find campgroud by id
  Campground.findById(req.params.id, (error, campground) => {
    if(error) {
      console.log(error);
    }
    else {
      res.render("comments/new", {campground: campground});
    }
  });
  
});

app.post('/campgrounds/:id/comments' , (req, res) => {
    // lookup campground using id
    Campground.findById(req.params.id, (error, campground) => {
      if(error) {
        console.log(error);
        res.redirect('/campgrounds');
      }
      else {
        Comment.create(req.body.comment, (error, comment) => {
          if(error) {
            console.log(error);
          }
          else {
            campground.comments.push(comment);
            campground.save();
            res.redirect('/campgrounds/'+campground._id);
          }
        });
      }
    });
    // create a new comment
    // connect a new comment to campground
    // redirect to campgrounds showpage
});

var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});