const User = require("../models/user");
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync"); //error function wrapper.
const passport = require("passport"); //adding passport for authentication.

//registing a user
router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post(
    "/register",
    catchAsync(async (req, res) => {
        //the try/catch inside were added so that we can display flash messages in case of some error like user exists already etc.
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const newUser = await User.register(user, password); //.register is a passport method.
            req.flash("success", "Namaste, Welcome to Desi Dwells !");
            res.redirect("/campgrounds");
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/register");
        }
    })
);

//logging in a user with passport.
router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post(
    "/login",
    //the below middleware is from docs needed by passport.
    passport.authenticate("local", {
        failureFlash: true, //flash message when login fails
        failureRedirect: "/login", //redirects to /login upon failure.
    }),
    (req, res) => {
        req.flash('success', 'Welcome Back !');
        res.redirect('/campgrounds');
    }
);

//logout logic.
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye');
        res.redirect('/campgrounds');
    })
});

module.exports = router;
