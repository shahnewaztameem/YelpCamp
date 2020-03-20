var express   = require("express"),
  bodyParser  = require("body-parser"),
  mongoose    = require("mongoose"),
  Campground  = require('./models/campground'),
  app         = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//DB connection
mongoose.connect("mongodb://localhost/yelp_camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Campgrounds.create({
//   name: "Salmon Creek",
//   image: "https://dailygazette.com/sites/default/files/styles/article_image/public/180702d.jpg?itok=6L_qDMLP",
//   description: "This is a huge campground, no water, no bathrooms but a beautiful campground"
// });

app.get("/", (req, res) => {
  res.render("landing");
});

// INDEX - show all campgrounds
app.get("/campgrounds", (req, res) => {
  Campground.find({}, function (error, campgrounds) {
    if (error) {
      console.log(error);
    } else {
      res.render("index", {
        campgrounds: campgrounds
      });
    }
  });
});

// NEW - show form to create a new campground
app.get("/campgrounds/new", (req, res) => {
  res.render("new");
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
  Campground.findById(req.params.id, function(error, foundCampground){
    if(error) {
      console.log(error);
    } else {
      // render the show template with that campground
      res.render("show", {campground: foundCampground});
    }
  });
});
var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});