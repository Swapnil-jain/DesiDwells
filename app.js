const express = require("express");
const path = require("path"); //needed to configure path.
const mongoose = require("mongoose");
const methodOverride = require("method-override"); //library to handle editing comments and form.
const ejsMate = require("ejs-mate"); //a library used to handle css and beautification.
const ExpressError = require("./utils/ExpressError"); //error class.
const session = require("express-session"); //adding sessions functionality.
const flash = require("connect-flash"); //adding flash message functionality.
const passport = require("passport"); //adding passport for authentication.
const LocalStrategy = require("passport-local"); //setup passport-local.
const User = require("./models/user"); //user schema

//routes.
const userRoutes = require("./routes/users"); //all our express review routes.
const campgroundRoutes = require("./routes/campgrounds"); //all our express /campground routes.
const reviewRoutes = require("./routes/reviews"); //all our express review routes.

//express start
const app = express();
const port = 3000;

app.set("view engine", "ejs"); //use ejs module.
app.set("views", path.join(__dirname, "/views"));
app.engine("ejs", ejsMate); //ejsmate 

//mongodb connection
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

//middleware
app.use(express.urlencoded({ extended: true })); //handling form data
app.use(methodOverride("_method")); //put/patch wale requests.
app.use(express.static(path.join(__dirname, "/public"))); //allows express to use the 'public' directory.
app.use(
    //this is used to setup session.
    session({
        secret: "thisisasecretkey", //secret has a similar concept to cookie secret.
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //number of miliseconds in a week. this sets the exact date when it will expire.
            maxAge: 1000 * 60 * 60 * 24 * 7, //this sets to the maximum age of cookie irrespective of the date created.
            httpOnly: true, //security related reason related to XSS vulnerability.
        },
    })
);
app.use(flash()); //using flash functionality.

//below are some middleware related to passport.
app.use(passport.initialize()); //initialize passport.
app.use(passport.session()); //used when persisten login sessions are used. (like 'rememberMe' functionality)
passport.use(new LocalStrategy(User.authenticate())); //from local-passport-docs. This line is some config line.
passport.serializeUser(User.serializeUser()); //from local-passport-docs
passport.deserializeUser(User.deserializeUser()); //from local-passport-docs

app.use((req, res, next) => {
    res.locals.currentUser = req.user; //sets req.user which is passport's property to currentUser.
    res.locals.success = req.flash("success"); //adding 'success' as a keyword for flash messages.
    res.locals.error = req.flash("error"); //adding 'error' as a keyword for flash messages.
    next();
});

//middleware of express routes.
app.use("/campgrounds", campgroundRoutes); //using express routes.
app.use("/campgrounds/:id/reviews", reviewRoutes); //using express routes.
app.use("/", userRoutes); //using express routes.


//home page
app.get("/", (req, res) => {
    res.render("home.ejs");
});


//Error handling
app.all("*", (req, res, next) => {
    //the app.all means all kinds of methods including get,post,put,delete etc. on all paths (that is what * indicates) will redirct to 404 page if they don't exist.
    next(new ExpressError("Page Not Found", 404)); //handling unknown webpages.
});

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Something went wrong"; //ensures all errors have message.
    res.status(status).render("error.ejs", { err });
});

//Generic stuff.
app.listen(port, () => {
    console.log("listening on port " + port);
});