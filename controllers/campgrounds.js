//controllers are essentially ways to shorten the code.
const Campground = require("../models/campground"); //campground schema.
const {cloudinary}=require("../cloudinary"); //used to handle images

//index page.
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

//new form render
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new.ejs");
};

//new form submission
module.exports.createCampground=async (req, res) => {
    const newCampground = new Campground(req.body.campground); //making the new campground.
    newCampground.images = req.files.map((f) => ({
        //req.files is an array having the uploaded files.
        url: f.path,
        filename: f.filename,
    })); 
    newCampground.author = req.user._id; //req.user is provided by passport. so this line sets the campground.author.
    await newCampground.save();
    req.flash("success", "Successfully made a new campground !"); //adding the flash message.
    res.redirect(`/campgrounds/${newCampground._id}`);
};

//show page 
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("author");
    if (!campground) {
        //in case campground doesn't exist.
        req.flash("error", "Campground doesn't exist");
        res.redirect("/campgrounds");
    }
    res.render("campgrounds/show.ejs", { campground });
};


//render the edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        //in case campground doesn't exist.
        req.flash("error", "Campground doesn't exist");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
};

//edit form submission
module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const editedCamp = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        {
            runValidators: true,
            //remember that runValidators is used to ensure the checks defined in schema are enforced.
        }
    );
    //make an array of the newly added images.
    const imgs = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }));
    editedCamp.images.push(...imgs); //notice are using 'push' to add additional images.

    //the below code is used to delete the selected images from mongodb and cloudinary.
    if (req.body.deleteImages) {
        //delete from cloudinary.
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        //delete from mongo.
        await editedCamp.updateOne({
            $pull: {
                images: { filename: { $in: req.body.deleteImages } },
            },
        });
    }

    await editedCamp.save();
    req.flash("success", "Successfully edited the campground"); //adding the flash message.
    res.redirect(`/campgrounds/${id}`);
};

//delete campground
module.exports.deleteCampground= async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground Deleted Successfully"); //adding the flash message.
    res.redirect("/campgrounds");
};