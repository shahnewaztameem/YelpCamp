var express = require('express');
var app = express();

app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/campgrounds', (req, res) => {
    var campgrounds = [{
            name: "Camp1",
            image: "https://media.istockphoto.com/photos/camping-tent-in-a-camping-in-a-forest-by-the-river-picture-id911995140?k=6&m=911995140&s=612x612&w=0&h=U-yG-2eR8pOxLX_G8Eg9fDI1SOWYifxbb4BiiOhNNiI="
        },
        {
            name: "Camp2",
            image: "https://media.istockphoto.com/photos/tourist-camp-with-fire-tent-and-firewood-picture-id941906052?k=6&m=941906052&s=612x612&w=0&h=TZDWIQdgHryloAw3YFveF_hyf1OeMxgaBdYl9F8BGJE="
        },
        {
            name: "Camp3",
            image: "https://media.istockphoto.com/photos/father-and-son-camping-together-picture-id833226490?k=6&m=833226490&s=612x612&w=0&h=uPmGHe4lnc4xIt9-qoS3_ps8q4Uq-9s7bHiU3XhEtSg="
        },
        {
            name: "Camp4",
            image: "https://media.istockphoto.com/photos/view-from-tent-to-the-mountain-sport-and-active-life-concept-picture-id865700880?k=6&m=865700880&s=612x612&w=0&h=6_GshQNwoh4xP_6-zCBIRxeVgS6vzMbzfE0yxBoRRao="
        },
        {
            name: "Camp5",
            image: "https://media.istockphoto.com/photos/camping-tents-in-pine-tree-forest-by-the-lake-picture-id649155058?k=6&m=649155058&s=612x612&w=0&h=lfeJxcM1n9_L25OpU3j5_8YRu-EI_O1mFscbla3q8nI="
        }
    ];
    res.render("campgrounds", {
        campgrounds: campgrounds
    });
});
var port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})