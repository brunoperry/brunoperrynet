const express = require('express');
const router = express.Router();
const path = require('path');
const SystemService = require('../../../../src/system_service');

router.get('/', (req, res) => {
    res.render('games');
});

router.get('/paradisecafe', (req, res) => {
    const gamesDir = __dirname.replace('/src/routes', '/games/paradisecafe/index.html');
    res.sendFile(gamesDir);
});

router.get('/paradisecafe/data', async (req, res) => {
    const data = await SystemService.getGameData('paradisecafe');
    res.json(data);
})

module.exports = router;