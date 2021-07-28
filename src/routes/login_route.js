const express = require('express');
const router = express.Router();
const passport = require('passport');


const { forwardAuthenticated } = require('../configs/auth_config');


//login view
router.get('/', forwardAuthenticated, (req, res, next) => {
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