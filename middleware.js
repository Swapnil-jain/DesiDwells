const Campground = require("./models/campground"); //campground schema.
const Review = require("./models/review"); //review schema.
const { campgroundSchema, reviewSchema } = require("./joiSchema"); //joi schemas
const ExpressError = require("./utils/ExpressError"); //error class.

//middleware to ensure authentication.
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; //we are storing where the user was trying to go before getting prompted for credentials. Storing this will help us redirect the user back to the same page after he logins in.
        req.flash("error", "You must be logged in first");
        return res.redirect("/login");
    }
    next();
};

//stores the returnTo thingy cuz passport clears our session.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

//authorisation middleware.
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        //we check for authorisation here.
        req.flash("error", "You do not have permission to do this.");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

//authorisation middleware of review
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        //we check for authorisation here.
        req.flash("error", "You do not have permission to do this.");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

//the below function is defined so that it is easier to use 'joi' library.
//Joi is used for server side validation for campgrounds.
module.exports.validateCampground = (req, res, next) => {
    //note that campgroundSchema is defined in joiSchema.js file.
    const { error } = campgroundSchema.validate(req.body); //ensures req.body has validation on server side using joi library.
    if (error) {
        const msg = error.details.map((el) => el.message).join(","); //basically 'error.details' is an array which we need to traverse to fetch the correct stuff which we need to use during throw.
        throw new ExpressError(msg, 400);
    }
    else next();
};

//server side validation for reviews using Joi.
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    else next();
};