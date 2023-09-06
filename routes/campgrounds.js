const express = require("express");
const router = express.Router(); 
const catchAsync = require("../utils/catchAsync"); //error function wrapper.
const Campground = require("../models/campground"); //campground schema.
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware"); //middleware for authenticating.

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
        newCampground.author = req.user._id; //req.user is provided by passport. so this line sets the campground.author. 
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
        const campground = await Campground.findById(id).populate("reviews").populate('author');
        console.log(campground);
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
    isAuthor,
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
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndUpdate(
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
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "Campground Deleted Successfully"); //adding the flash message.
        res.redirect("/campgrounds");
    })
);

module.exports = router;