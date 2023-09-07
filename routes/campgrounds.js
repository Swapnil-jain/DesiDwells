const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync"); //error function wrapper.
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware"); //middleware for authenticating.
const campgrounds = require("../controllers/campgrounds"); //this represents our controller.
const multer = require("multer"); //middleware to handle uploading files.
const { storage } = require("../cloudinary");
//setup multer.
const upload = multer({ storage });


router.route("/")
    .get(catchAsync(campgrounds.index)) //main camp page
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); //where the new campground submits to

//form to add a new campground
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

//A note: The order of the code block having /campgrounds/new and the codeblock having /campgrounds/:id MATTERS.
//This is cuz otherwise /campgrounds/:id will try to find id='new' if it is declared first.

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground)) //getting details of a specific campground.
    .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(campgrounds.editCampground)) //positing the editing form
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //deleting the campground and the corresponding reviews.

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)) //editing editing form

module.exports = router;