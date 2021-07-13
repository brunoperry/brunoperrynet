const express = require('express');
const router = express.Router();
const SystemService = require('../system_service');

router.get('/', (req, res, next) => {

    let appsData;

    if (req.user) {
        appsData = SystemService.apps.filter(a => a.type !== 'system').filter(a => a.name !== 'login');
    } else {
        appsData = SystemService.apps.filter(a => a.type !== 'system' && a.admin === 0);
    }
    res.render('home', {
        user: req.user,
        apps: appsData
    });
});

module.exports = router;