const User = require("../models/user");

//render the registration form
module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

//post the register form
module.exports.postRegister = async (req, res, next) => {
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
};

//render the login form
module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

//login form submission
module.exports.postLogin = (req, res) => {
    req.flash("success", "Welcome Back !");
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    //the || '/campgrounds' is written cuz otherwise if user is tryng to login from the homepage, res.locals.returnTo would be undefined so it would cause problems.
    res.redirect(redirectUrl);
};

//logout logic
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/campgrounds");
    });
};
