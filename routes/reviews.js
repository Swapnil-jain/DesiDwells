const express = require("express");
const router = express.Router({ mergeParams: true });
//IMP: mergeParams: true enables us to have access to :id parameter, which is otherwise inaccessible in a route.
const catchAsync = require("../utils/catchAsync"); //error function wrapper.
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware"); //middleware for authenticating.
const reviews = require("../controllers/reviews"); //this represents our controller.

//adding the review functionality.
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.postReview));

//review deleting feature
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    catchAsync(reviews.deleteReview)
);

module.exports = router;