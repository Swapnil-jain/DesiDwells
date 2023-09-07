const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync"); //error function wrapper.
const passport = require("passport"); //adding passport for authentication.
const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users"); //this represents our controller.

router.route("/register")
    .get(users.renderRegister) //registing a user
    .post(catchAsync(users.postRegister)); //post the register form

router.route("/login")
    .get(users.renderLogin) //logging in a user with passport.
    .post(
    storeReturnTo, //we are storing returnTo url.
    passport.authenticate("local", {
        //middleware needed by passport.
        failureFlash: true, //flash message when login fails
        failureRedirect: "/login", //redirects to /login upon failure.
    }),
    users.postLogin
);

//logout logic.
router.get("/logout", users.logout);

module.exports = router;