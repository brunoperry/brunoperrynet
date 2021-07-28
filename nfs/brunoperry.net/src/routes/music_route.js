const express = require('express');
const router = express.Router();

const SystemService = require('../../../../src/system_service')

//cpanel page
router.get('/', (req, res) => {
    res.render('music');
});

router.get('/getall', (req, res) => {

    let dataOut;
    if (req.user) {
        dataOut = {
            status: 'success',
            data: [
                {
                    name: 'radios',
                    children: SystemService.music.radios,
                    type: 'directory',
                    id: '0'
                },
                {
                    name: 'music',
                    children: SystemService.music.music.children,
                    type: 'directory',
                    id: '1'
                },
                {
                    name: 'open...',
                    type: 'open_file',
                    id: '2'
                },
                {
                    name: 'upload...',
                    type: 'url',
                    path: 'https://brunoperry.net/uploader',
                    id: '3'
                },
                {
                    name: 'logout',
                    type: 'url',
                    path: 'https://brunoperry.net/login/logout',
                    id: '4'
                },
                {
                    name: 'exit',
                    type: 'url',
                    path: 'https://brunoperry.net',
                    id: '5'
                }
            ]
        }
    } else {
        dataOut = {
            status: 'success',
            data: [
                {
                    name: 'radios',
                    children: SystemService.music.radios,
                    type: 'directory',
                    id: '0'
                },
                {
                    name: 'music',
                    children: SystemService.music.music.children,
                    type: 'directory',
                    id: '1'
                },
                {
                    name: 'open...',
                    type: 'open_file',
                    id: '2'
                },
                {
                    name: 'login',
                    type: 'url',
                    path: 'https://brunoperry.net/login',
                    id: '3'
                },
                {
                    name: 'exit',
                    type: 'url',
                    path: 'https://brunoperry.net',
                    id: '4'
                }
            ]
        }
    }

    res.send(dataOut);
});

module.exports = router;