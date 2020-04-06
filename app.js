var express     = require("express"),
  bodyParser    = require("body-parser"),
  mongoose      = require("mongoose"),
  passport      = require('passport'),
  LocalStrategy = require('passport-local'),
  Campground    = require('./models/campground'),
  Comment       = require('./models/comment'),
  seedDB        = require('./seeds'),
  User          = require('./models/user'),
  app           = express();

// routes
var campgroundRoutes = require('./routes/campgrounds'),
    commentRoutes    = require('./routes/comments'),
    indexRoutes      = require('./routes/index');

// seedDB();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

//DB connection
mongoose.connect("mongodb://localhost/yelp_camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// ======================
// PASSPORT Configuration
// ======================
app.use(require('express-session') ({
  secret : "there is no place like 127.0.0.1",
  resave : false,
  saveUninitialized : false
}));
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(indexRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/comments',commentRoutes);

var port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});