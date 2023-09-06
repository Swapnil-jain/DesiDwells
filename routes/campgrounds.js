const express = require("express");
const router = express.Router(); 
const catchAsync = require("../utils/catchAsync"); //error function wrapper.
const ExpressError = require("../utils/ExpressError"); //error class.
const Campground = require("../models/campground"); //campground schema.
const { campgroundSchema } = require("../joiSchema"); //joi schemas
const { isLoggedIn } = require('../middleware'); //middleware for authenticating.

//the below function is defined so that it is easier to use 'joi' library.
//Joi is used for server side validation for campgrounds.
const validateCampground = (req, res, next) => {
    //note that campgroundSchema is defined in joiSchema.js file.
    const { error } = campgroundSchema.validate(req.body); //ensures req.body has validation on server side using joi library.
    if (error) {
        const msg = error.details.map((el) => el.message).join(","); //basically 'error.details' is an array which we need to traverse to fetch the correct stuff which we need to use during throw.
        throw new ExpressError(msg, 400);
    } else next();
};

//main camp page
router.get(
    "/",
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

//form to add a new campground
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new.ejs");
});
//where the new campground submits to:
router.post(
    "/",
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res) => {
        
        const newCampground = new Campground(req.body.campground); //making the new campground.
        await newCampground.save();
        req.flash("success", "Successfully made a new campground !"); //adding the flash message.
        res.redirect(`/campgrounds/${newCampground._id}`);
    })
);

//A note: The order of the code block having /campgrounds/new and the codeblock having /campgrounds/:id MATTERS.
//This is cuz otherwise /campgrounds/:id will try to find id='new' if it is declared first.

//getting details of a specific campground.
router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate("reviews");
        if (!campground) { //in case campground doesn't exist.
            req.flash("error", "Campground doesn't exist"); 
            res.redirect("/campgrounds");
        }
        res.render("campgrounds/show.ejs", { campground });
    })
);

//editing product, part 1
router.get(
    "/:id/edit",
    isLoggedIn,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            //in case campground doesn't exist.
            req.flash("error", "Campground doesn't exist");
            return res.redirect("/campgrounds");
        }
        res.render("campgrounds/edit", { campground });
    })
);

//part-2: actualy replacing the campground.
router.put(
    "/:id",
    isLoggedIn,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const updatedCampground = await Campground.findByIdAndUpdate(
            id,
            { ...req.body.campground },
            {
                runValidators: true,
            }
        ); //remember that runValidators is used to ensure the checks defined in schema are enforced.
        req.flash("success", "Successfully edited the campground"); //adding the flash message.
        res.redirect(`/campgrounds/${id}`);
    })
);

//deleting the campground and the corresponding reviews.
router.delete(
    "/:id",
    isLoggedIn,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        req.flash("success", "Campground Deleted Successfully"); //adding the flash message.
        res.redirect("/campgrounds");
    })
);

module.exports = router;