var mongoose    = require('mongoose');
var Campground  = require('./models/campground');
var Comment     = require('./models/comment');

var data = [{
        name: "Cloud's Rest",
        image: "https://pixabay.com/get/57e8d3444855a914f6da8c7dda793f7f1636dfe2564c704c7d2b7ddd9249cc5f_340.jpg",
        description: "blah blah blah blah blah blah blah "
    },
    {
        name: "Luka Luka",
        image: "https://pixabay.com/get/57e1d14a4e52ae14f6da8c7dda793f7f1636dfe2564c704c7d2b7ddd9249cc5f_340.jpg",
        description: "Lorem ipsum dolo sit amet"
    },
    {
        name: "Salmon's Creek",
        image: "https://pixabay.com/get/52e8d4444255ae14f6da8c7dda793f7f1636dfe2564c704c7d2b7ddd9249cc5f_340.jpg",
        description: "Salmon's Creek is a nice place!!"
    }
];

function seedDB() {
    // remove all campgrounds
    Campground.remove({}, function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log("campgrounds removed");
        }
        // add few campgrounds
        data.forEach(seed => {
            Campground.create(seed, (error, campground) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("campground added");

                    // create a comment
                    Comment.create({
                        text: "This is a nice campground but I wish there was internet!!",
                        author: "Tameem"
                    }, (error, comment) => {
                        if (error) throw error;
                        else {
                            campground.comments.push(comment);
                            campground.save();
                            console.log("comment added");
                        }

                    });
                }
            });
        });
    });


}
module.exports = seedDB;