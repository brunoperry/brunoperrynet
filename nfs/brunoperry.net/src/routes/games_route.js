const express = require('express');
const router = express.Router();
const path = require('path');
const SystemService = require('../../../../src/system_service');



router.get('/', (req, res) => {

    res.render('games', {
        data: SystemService.games
    });
});

router.get('/paradisecafe', (req, res) => {

    const gameView = __dirname.replace('/src/routes', '/games/paradisecafe/index.html');
    console.log(gameView)
    res.sendFile(gameView);
});

router.get('/paradisecafe/about', (req, res) => {
    const aboutView = '/app/nfs/public/games/paradisecafe/about.html';
    res.sendFile(aboutView);
});

router.get('/paradisecafe/data', async (req, res) => {

    console.log('getting')
    SystemService.addVisitor({
        ip: req.ip,
        game: 'paradisecafe',
        browser: req.headers['user-agent'],
        data: Date.now()
    });
    const data = await SystemService.getGameData('paradisecafe');
    res.json(data);
})
router.post('/paradisecafe/data', async (req, res) => {

    const data = await SystemService.setGameScore('paradisecafe', req.body);
    res.json(data);
})

module.exports = router;