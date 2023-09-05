const express = require("express");
const path = require("path"); //needed to configure path.
const mongoose = require("mongoose");
const Campground = require("./models/campground"); //custom defined file.
const methodOverride = require("method-override"); //library to handle editing comments and form.
const ejsMate = require("ejs-mate"); //a library used to handle css and beautification.
const ExpressError = require("./utils/ExpressError"); //error class.
const catchAsync = require("./utils/catchAsync"); //error function wrapper.
const { campgroundSchema, reviewSchema } = require("./joiSchema"); //joi schemas
const Review = require("./models/review");

const app = express();
const port = 3000;

//middleware
app.use(express.urlencoded({ extended: true })); //handling form data
app.use(methodOverride("_method")); //put/patch wale requests.

app.set("view engine", "ejs"); //use ejs module.
app.set("views", path.join(__dirname, "/views"));
app.engine("ejs", ejsMate);

//mongodb connection
main();
async function main() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/desidwells");
        console.log("Mongo connection opened\n");
    } catch (err) {
        console.log("Mongo connection failed\n");
        console.log(err);
    }
}

//the below function is defined so that it is easier to use 'joi' library.
//server side validation for campgrounds.
const validateCampground = (req, res, next) => {
    //note that campgroundSchema is defined in joiSchema.js file.
    const { error } = campgroundSchema.validate(req.body); //ensures req.body has validation on server side using joi library.
    if (error) {
        const msg = error.details.map((el) => el.message).join(","); //basically 'error.details' is an array which we need to traverse to fetch the correct stuff which we need to use during throw.
        throw new ExpressError(msg, 400);
    } else next();
};

//server side validation for reviews using Joi.
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else next();
};

app.get("/", (req, res) => {
    res.render("home.ejs");
});

//main camp page
app.get(
    "/campgrounds",
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

//form to add a new campground
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new.ejs");
});
//where the new campground submits to:
app.post(
    "/campgrounds",
    validateCampground,
    catchAsync(async (req, res) => {
        const newCampground = new Campground(req.body.campground); //making the new campground.
        await newCampground.save();
        res.redirect(`/campgrounds/${newCampground._id}`);
    })
);

//A note: The order of the code block having /campgrounds/new and the codeblock having /campgrounds/:id MATTERS.
//This is cuz otherwise /campgrounds/:id will try to find id='new' if it is declared first.

//getting details of a specific campground.
app.get(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate("reviews");
        console.log(campground.reviews);
        res.render("campgrounds/show.ejs", { campground });
    })
);

//editing product, part 1
app.get(
    "/campgrounds/:id/edit",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        res.render("campgrounds/edit", { campground });
    })
);

//part-2: actualy replacing the campground.
app.put(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const updatedCampground = await Campground.findByIdAndUpdate(
            id,
            { ...req.body.campground },
            {
                runValidators: true,
            }
        ); //remember that runValidators is used to ensure the checks defined in schema are enforced.
        res.redirect(`/campgrounds/${id}`);
    })
);

//deleting the campground and the corresponding reviews.
app.delete(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground=await Campground.findByIdAndDelete(id);
        res.redirect("/campgrounds");
    })
);

//adding the review functionality.
app.post(
    "/campgrounds/:id/reviews",
    validateReview,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const newReview = new Review(req.body.review); //make the new review.
        const campground = await Campground.findById(id); //find the corresponding campground
        campground.reviews.push(newReview); //push the new review into db.
        await campground.save();
        await newReview.save();
        res.redirect(`/campgrounds/${id}`);
    })
);
//review deleting feature
app.delete(
    "/campgrounds/:id/reviews/:reviewId",
    catchAsync(async (req, res) => {
        let { id, reviewId } = req.params;
        //the first thing to do is go inside the correct campground and remove the id of the review which we are going to delete.
        //We use a mongo operator called 'pull' here.
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId); //delete the actual review.
        res.redirect(`/campgrounds/${id}`);
    })
);

//Error handling
app.all("*", (req, res, next) => {
    //the app.all means all kinds of methods including get,post,put,delete etc. on all paths (that is what * indicates) will redirct to 404 page if they don't exist.
    next(new ExpressError("Page Not Found", 404)); //handling unknown webpages.
});

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Something went wrong"; //ensures all errors have message.
    res.status(status).render("error.ejs", { err });
});

//generic stuff.
app.listen(port, () => {
    console.log("listening on port " + port);
});

//bla bla bla this is a test.