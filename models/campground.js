//Main purpose of creating this file is to separate code to appear cleaner and just define the schema.
const mongoose = require("mongoose");
const Schema = mongoose.Schema; //so that later instead of writing mongoose.Schema everywhere, we can just call it Schema so code remains shorter.
const Review = require("./review");

const imageSchema = new Schema({
    url: String,
    filename: String,
});

//We are splitting the url to include w_200, so that cloudinary can autosize the images uploaded to it.
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const CampgroundSchema = new Schema({
    title: {
        type: String,
    },
    price: {
        type: Number,
        min: 0,
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    //reviews follows one to many relationship.
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ["Point"], // 'location.type' must be 'Point'
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    creationDate: String
});

//This is a MONGOOSE middleware (not an express middleware).
//The below written lines of code helps us to delete campground and the corresponding reviews. Temember, we will need a post middleware, not a premiddleware because the post middleware will first delete our campground, and then pass it as an argument in justDeletedCampground. So we still have access to it, even tho it is gone from database.
CampgroundSchema.post("findOneAndDelete", async function (justDeletedCampground) {
    if (justDeletedCampground.reviews.length) {
        await Review.deleteMany({ _id: { $in: justDeletedCampground.reviews } });
        //means delete all the reviews whose id matches with the one in campground.reviews.
    }
});

module.exports = mongoose.model("Campground", CampgroundSchema);