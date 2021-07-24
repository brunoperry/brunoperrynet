const express = require('express');
const router = express.Router();

const SystemService = require('../../../../src/system_service')

//cpanel page
router.get('/', (req, res) => {
    res.render('music');
});

router.get('/getall', (req, res) => {

    res.send({
        status: 'success',
        data: [
            {
                name: 'radios',
                children: SystemService.music.radios,
                type: 'directory'
            },
            {
                name: 'music',
                children: SystemService.music.music.children,
                type: 'directory'
            },
            {
                name: 'open...',
                type: 'open_file'
            },
            {
                name: 'login',
                type: 'url',
                path: 'https://brunoperry.net/login'
            },
            {
                name: 'exit',
                type: 'url',
                path: 'https://brunoperry.net'
            }
        ]
    });
});

module.exports = router;