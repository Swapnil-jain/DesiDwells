const User = require("../models/user");
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync"); //error function wrapper.
const passport = require("passport"); //adding passport for authentication.
const { storeReturnTo } = require("../middleware");

//registing a user
router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post(
    "/register",
    catchAsync(async (req, res, next) => {
        //the try/catch inside were added so that we can display flash messages in case of some error like user exists already etc.
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const newUser = await User.register(user, password); //.register is a passport method.
            req.login(newUser, (err) => {
                //logs a user in after registration.
                if (err) return next(err);
                req.flash("success", "Namaste, Welcome to Desi Dwells !");
                res.redirect("/campgrounds");
            });
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
    storeReturnTo, //we are storing returnTo url.
    passport.authenticate("local", { //middleware needed by passport.
        failureFlash: true, //flash message when login fails
        failureRedirect: "/login", //redirects to /login upon failure.
    }),
    (req, res) => {
        req.flash("success", "Welcome Back !");
        const redirectUrl = res.locals.returnTo || "/campgrounds";
        //the || '/campgrounds' is written cuz otherwise if user is tryng to login from the homepage, res.locals.returnTo would be undefined so it would cause problems.
        res.redirect(redirectUrl);
    }
);

//logout logic.
router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/campgrounds");
    });
});

module.exports = router;