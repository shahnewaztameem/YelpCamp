var mongoose = require('mongoose');
//Schema
var campgroundsSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
  });
  
module.exports = mongoose.model("Campground", campgroundsSchema);