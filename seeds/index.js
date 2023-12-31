//This file will be run whenever we need to add some seeddata to our database.
//will be executed using 'node seeds/index.js' command.

const mongoose = require("mongoose");
const Campground = require("../models/campground"); //custom defined file.
const cities=require("./cities");
const { places, descriptors } = require("./seedHelpers.js");
const dateFormatter = require("../utils/date.js");

//db Connection
main();
async function main() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/desidwells");
        console.log("Mongo connection opened\n");
    } catch (err) {
        console.log("Mongo connection failed\n");
        console.log(err);
    }
}

const sample = (array) => array[Math.floor(Math.random() * array.length)];
//will be used to generate a valid number inside the array, for our seedDB function.

const seedDB = async () => {
    await Campground.deleteMany({}); //delete everything first.
    for (let i = 0; i < 100; i++) {
        const price = Math.floor(Math.random() * 10000) + 10; //generating a random price value.
        const camp = new Campground({
            location: `${cities[i+1].City}, ${cities[i+1].State}`,
            title: `${sample(descriptors)} ${sample(places)}`, //basically picking one word each from 'descriptors' and 'places' array to generate a random name.
            description:
                "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim quidem asperiores cupiditate perferendis, nobis vel quod, dolor at placeat quam fugiat? Officiis praesentium natus tenetur exercitationem placeat beatae, molestiae ratione!",
            creationDate: dateFormatter.getCurrentFormattedDate(),
            price: price,
            author: "64f86a57aa44fa7d460fbd3c", //belongs to account named admin, change it if u delete all accounts.
            images: [
                {
                    url: "https://res.cloudinary.com/do9jjdqd9/image/upload/v1694149831/DesiDwells/sg2sai6tv9y8ks2hhdel.webp",
                    filename: "DesiDwells/sg2sai6tv9y8ks2hhdel",
                },
            ],
            geometry: {
                type: "Point",
                coordinates: [
                    cities[i+1].Longitude,
                    cities[i+1].Latitude,
                ],
            }, //just a default value for the seed.
        });
        await camp.save();
    }
}
seedDB().then(() => mongoose.connection.close()); //to close our db connection after seed file is executed.