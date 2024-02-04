

module.exports.isLoggedIn = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectTo = req.originalUrl;
        req.flash("error", "Please sign in first.");
        return res.redirect('/login');
    }
    next();
};

module.exports.notLoggedIn = async (req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash("error", "You are already logged in.");
        return res.redirect('/dashboard');
    }
    next();
}

