var mongoose    = require('mongoose');
var Campground  = require('./models/campground');
var Comment     = require('./models/comment');

var data = [{
        name: "Cloud's Rest",
        image: "https://cdn.pixabay.com/photo/2017/09/26/13/50/rv-2788677__340.jpg",
        description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc"
    },
    {
        name: "Luka Luka",
        image: "https://cdn.pixabay.com/photo/2017/11/24/03/04/tent-2974050__340.jpg",
        description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc"
    },
    {
        name: "Salmon's Creek",
        image: "https://cdn.pixabay.com/photo/2017/07/27/00/14/tent-2543627__340.jpg",
        description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc"
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