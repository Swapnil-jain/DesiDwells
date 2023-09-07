const Campground = require("../models/campground"); //campground schema.
const Review = require("../models/review");

//posting the review.
module.exports.postReview = async (req, res) => {
    const { id } = req.params;
    const newReview = new Review(req.body.review); //make the new review.
    newReview.author = req.user._id; //sets the review author.
    const campground = await Campground.findById(id); //find the corresponding campground
    campground.reviews.push(newReview); //push the new review into db.
    await campground.save();
    await newReview.save();
    req.flash("success", "Successfully added review "); //adding the flash message.
    res.redirect(`/campgrounds/${id}`);
};

//deleting the review.
module.exports.deleteReview = async (req, res) => {
    let { id, reviewId } = req.params;
    //the first thing to do is go inside the correct campground and remove the id of the review which we are going to delete.
    //We use a mongo operator called 'pull' here.
    await Campground.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId); //delete the actual review.
    req.flash("success", "Review Deleted Successfully"); //adding the flash message.
    res.redirect(`/campgrounds/${id}`);
};
