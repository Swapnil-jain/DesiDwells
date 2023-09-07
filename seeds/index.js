//This file will be run whenever we need to add some seeddata to our database.
//will be executed using 'node seeds/index.js' command.

const mongoose = require("mongoose");
const Campground = require("../models/campground"); //custom defined file.
const cities=require("./cities");
const campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers.js");

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
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 50);
        const price = Math.floor(Math.random() * 10000) + 10; //generating a random price value.
        const camp = new Campground({
            location: `${cities[random1000].City}, ${cities[random1000].State}`,
            title: `${sample(descriptors)} ${sample(places)}`, //basically picking one word each from 'descriptors' and 'places' array to generate a random name.
            description:
            "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Enim quidem asperiores cupiditate perferendis, nobis vel quod, dolor at placeat quam fugiat? Officiis praesentium natus tenetur exercitationem placeat beatae, molestiae ratione!",
            price: price,
            author: "64f86a57aa44fa7d460fbd3c", //belongs to account named admin, change it if u delete all accounts.
            images: [
                {
                    url: "https://res.cloudinary.com/do9jjdqd9/image/upload/v1694070054/DesiDwells/q1rgciypxmrok7dckt3b.jpg",
                    filename: "DesiDwells/q1rgciypxmrok7dckt3b",
                },
                {
                    url: "https://res.cloudinary.com/do9jjdqd9/image/upload/v1694070055/DesiDwells/uidlkt2lhxalazfsotec.jpg",
                    filename: "DesiDwells/uidlkt2lhxalazfsotec",
                },
                {
                    url: "https://res.cloudinary.com/do9jjdqd9/image/upload/v1694070056/DesiDwells/cy8vbt7i7kg0z5b2t7gv.webp",
                    filename: "DesiDwells/cy8vbt7i7kg0z5b2t7gv",
                },
            ],
        });
        await camp.save();
    }
}
seedDB().then(() => mongoose.connection.close()); //to close our db connection after seed file is executed.