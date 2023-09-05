const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
});
//a review will be using a one-to-many relationship. 
module.exports = mongoose.model("Review", reviewSchema);