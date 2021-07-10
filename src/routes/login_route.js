const express = require('express');
const router = express.Router();
const passport = require('passport');


//login view
router.get('/', (req, res, next) => {
    res.render('login');
});
//login handle
router.post('/dologin', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
    })(req, res, next)
});
//logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})
module.exports = router;