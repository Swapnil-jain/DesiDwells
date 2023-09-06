const express = require("express");
const router = express.Router({ mergeParams: true });
//IMP: mergeParams: true enables us to have access to :id parameter, which is otherwise inaccessible in a route.
const catchAsync = require("../utils/catchAsync"); //error function wrapper.
const ExpressError = require("../utils/ExpressError"); //error class.
const Campground = require("../models/campground"); //campground schema.
const Review = require("../models/review");
const { reviewSchema } = require("../joiSchema"); //joi schemas
const { isLoggedIn } = require("../middleware"); //middleware for authenticating.

//server side validation for reviews using Joi.
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else next();
};

//adding the review functionality.
router.post(
    "/",
    isLoggedIn,
    validateReview,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const newReview = new Review(req.body.review); //make the new review.
        const campground = await Campground.findById(id); //find the corresponding campground
        campground.reviews.push(newReview); //push the new review into db.
        await campground.save();
        await newReview.save();
        req.flash("success", "Successfully added review "); //adding the flash message.
        res.redirect(`/campgrounds/${id}`);
    })
);
//review deleting feature
router.delete(
    "/:reviewId",
    isLoggedIn,
    catchAsync(async (req, res) => {
        let { id, reviewId } = req.params;
        //the first thing to do is go inside the correct campground and remove the id of the review which we are going to delete.
        //We use a mongo operator called 'pull' here.
        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });
        await Review.findByIdAndDelete(reviewId); //delete the actual review.
        req.flash("success", "Review Deleted Successfully"); //adding the flash message.
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;