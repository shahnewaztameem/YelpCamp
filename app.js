var express       = require("express"),
  bodyParser      = require("body-parser"),
  mongoose        = require("mongoose"),
  passport        = require('passport'),
  flash           = require('connect-flash'),
  LocalStrategy   = require('passport-local'),
  Campground      = require('./models/campground'),
  methodOverride  = require('method-override'),
  Comment         = require('./models/comment'),
  seedDB          = require('./seeds'),
  User            = require('./models/user'),
  app             = express();
  require('dotenv').config()
// routes
var campgroundRoutes = require('./routes/campgrounds'),
    commentRoutes    = require('./routes/comments'),
    indexRoutes      = require('./routes/index');

// seedDB();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
//DB connection
mongoose.connect(process.env.CONNECTION_URI, {
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
  res.locals.error       = req.flash('error');
  res.locals.success     = req.flash('success');
  next();
});
app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(indexRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:slug/comments',commentRoutes);

var port = process.env.PORT || 3000;
app.listen(process.env.IP,port, () => {
  console.log(`Server started on port ${port}`);
});