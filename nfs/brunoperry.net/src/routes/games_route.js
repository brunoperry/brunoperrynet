const express = require('express');
const router = express.Router();
const path = require('path');
const SystemService = require('../../../../src/system_service');

router.get('/', (req, res) => {
    res.render('games');
});
router.get('/paradisecafe', (req, res) => {
    const gamesDir = __dirname.replace('/src/routes', '/games/paradisecafe2');

    res.sendFile(path.join(gamesDir, 'index.html'));
});

router.get('/paradisecafe/data', async (req, res) => {

    const data = await SystemService.getGameData('paradisecafe2');
    console.log('ff', data)
    res.json(data);
})

router.get('/paradisecafe/scores', async (req, res) => {

    const scores = await SystemService.getGameScores('paradisecafe');
    const parseData = JSON.parse(scores)[0]
    res.json(parseData.scores);
})

module.exports = router;