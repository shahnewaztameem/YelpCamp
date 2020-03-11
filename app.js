var express = require("express"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//DB connection
mongoose.connect("mongodb://localhost/yelp_camp",{ useNewUrlParser: true, useUnifiedTopology: true});

//Schema
var campgroundsSchema = new mongoose.Schema({
  name: String,
  image: String
});

var Campgrounds = mongoose.model("Campground", campgroundsSchema);

app.get("/", (req, res) => {
  res.render("landing");
});

app.get("/campgrounds", (req, res) => {
  Campgrounds.find({}, function(error, campgrounds) {
    if (error) {
      console.log(error);
    } else {
      res.render("campgrounds", { campgrounds: campgrounds });
    }
  });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("new");
});

app.post("/campgrounds", (req, res) => {
  //get data from form and add to the campgrounds array
  var name = req.body.name;
  var imageUrl = req.body.image;
  var newCampground = { name: name, image: imageUrl };
  Campgrounds.create(newCampground, function(error,campgrounds){
    if(error) {
      console.log(error);
    }
    else {
      //redirect back to the campgroundspage
      res.redirect('/campgrounds');
    }
  });
});
var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
