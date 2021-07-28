module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    },
    forwardAuthenticated: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
}