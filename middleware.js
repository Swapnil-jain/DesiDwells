//middleware to ensure authentication.
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; //we are storing where the user was tryging to go before getting prompted for credentials. Storing this will help us redirect the user back to the same page after he logins in.
        req.flash("error", "You must be logged in first");
        return res.redirect("/login");
    }
    next();
}

//stores the returnTo thingy cuz passport clears our session.
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}