const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../../../../src/configs/auth_config');

const cpanelController = require('../controllers/cpanel_controller');

//cpanel page
router.get('/', ensureAuthenticated, cpanelController.index);
router.post('/saveapp', ensureAuthenticated, cpanelController.saveApp);
router.post('/deleteapp', ensureAuthenticated, cpanelController.deleteApp);
router.get('/getapps', ensureAuthenticated, cpanelController.getApps);
router.get('/getusers', ensureAuthenticated, cpanelController.getUsers);

module.exports = router;