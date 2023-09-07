const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");


//associating our account.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

//from cloudinary docs.
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "DesiDwells",
        // format: async (req, file) => "png", // supports promises as well
        // public_id: (req, file) => "computed-filename-using-request",
        allowedFormats: ["png", "jpg", "jpeg"]
    },
});

module.exports = {
    cloudinary,
    storage,
};