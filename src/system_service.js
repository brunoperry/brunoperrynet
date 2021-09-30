const fs = require('fs');
const dotEnv = require('dotenv');
dotEnv.config();
const dirTree = require('directory-tree');
const mysql = require('mysql');
const util = require('util');
const App = require('./models/app_model');

const { ensureAuthenticated } = require('./configs/auth_config');


// Create a connection to the database
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const mongoose = require('mongoose');

class SystemService {

    constructor() { }

    static async initSystem(server) {
        console.log('initializing system...');

        // Passport middleware
        await this.startMariaDB();
        await this.startMongoose();
        await this.getAllIcons();
        await this.getAllUsers();
        await this.getAllMusic();
        await this.getAllSites();
        await this.getAllGames();
        await this.getAllImages();

        SystemService.SERVER = server;

        let apps = await this.getAllApps();
        apps = apps.filter(a => a.state !== 'inactive');
        apps = apps.filter(a => a.state !== 'deleted');
        apps = apps.filter(a => a.type !== 'system');

        const router = SystemService.SERVER._router.stack;
        for (let i = 0; i < apps.length; i++) {
            this.addAppToServer(await this.createApp(apps[i]));
        }
    }

    static getAllImages() {
        try {
            const images = dirTree(process.env.BP_IMAGES_PATH);
            SystemService.images = images.children;
        } catch (error) {
            console.error('error getting images', error);
        }
    }

    static addAppToServer(app) {

        SystemService.apps.push(app);

        if (app.type !== 'webapp') return;

        if (app.route !== null) {
            let router = require(`../${app.route}`);
            if (app.admin === 1) {
                SystemService.SERVER.use(`/${app.short_name}`, ensureAuthenticated, router);
            }
            else if (app.admin === 0) {
                SystemService.SERVER.use(`/${app.short_name}`, router);
            }
        } else {
            if (app.admin === 1) SystemService.SERVER.get(`/${app.short_name}`, ensureAuthenticated, (req, res, next) => {
                res.render(app.short_name);
            });
            else if (app.admin === 0) SystemService.SERVER.get(`/${app.short_name}`, (req, res, next) => {
                res.render(app.short_name);
            });
        }
    }

    static async addVisitor(visitorData) {

        try {
            await connection.query('INSERT INTO visitors (ip, game, browser, date) VALUES (?,?,?,?);', [visitorData.ip, visitorData.game, visitorData.browser, Date.now()]);
            return {
                success: true
            };
        } catch (error) {
            console.error('error setting visitor', error);
            return {
                success: false
            };
        }
    }

    static async setGameScore(gameName, scoreData) {

        const gameData = await this.getGameScores(gameName, false);

        let scoresData = JSON.parse(gameData[0].scores);
        scoresData.push(scoreData);
        scoresData.sort((a, b) => parseInt(a.score) - parseInt(b.score));
        scoresData = scoresData.reverse();

        try {
            await connection.query(`UPDATE games 
            SET 
                scores = ?
            WHERE
                name = ?;`, [JSON.stringify(scoresData), gameName]);

            return {
                status: 'success'
            }
        } catch (error) {
            console.error(error);
            return {
                status: 'Error!',
                message: error
            }
        }
    }

    static async getGameScores(gameName, andStringify = true) {
        try {
            const games = await connection.query('SELECT * FROM games WHERE name=?', [gameName]);
            if (andStringify) return JSON.stringify(games);
            else return JSON.parse(JSON.stringify(games));
        } catch (error) {
            console.error('error getting all apps', error);
            return [];
        }
    }

    static async getAllGames() {

        try {
            SystemService.games = [];
            const gamesDir = dirTree(process.env.BP_GAMES_PATH);

            for (let i = 0; i < gamesDir.children.length; i++) {
                const gDir = gamesDir.children[i];

                if (gDir.children.length === 0) continue;
                const dataDir = gDir.children.find(a => a.name === 'data')

                let game = {
                    url: `https://brunoperry.net/games/${gDir.name.replace(" ", "")}`,
                    name: gDir.name,
                    data: {}
                }

                for (let j = 0; j < dataDir.children.length; j++) {
                    const file = fs.readFileSync(dataDir.children[j].path);
                    let gData = JSON.parse(file);

                    if (gData.children) gData = gData.children;

                    const dataName = dataDir.children[j].name.replace('.json', '');

                    game.data[dataName] = gData;
                }

                SystemService.games.push(game);

            }
        } catch (error) {
            console.error('error initializing games', error);
        }


        // let student = JSON.parse(rawdata);
    }
    static async getGameData(gameName) {
        let gameData = SystemService.games.find(g => g.name === gameName);
        gameData.scores = await this.getGameScores(gameName, false);
        return gameData;
    }
    static async getAllSites() {
        try {
            const outApps = [];
            const apps = await connection.query('SELECT * FROM apps');
            for (let i = 0; i < apps.length; i++) {
                outApps.push(await this.createApp(apps[i]));
            }
            return outApps;
        } catch (error) {
            console.error('error getting all apps', error);
            return [];
        }
    }

    static async getAllApps() {
        try {
            const outApps = [];
            const apps = await connection.query('SELECT * FROM apps');
            for (let i = 0; i < apps.length; i++) {
                outApps.push(await this.createApp(apps[i]));
            }
            return outApps;
        } catch (error) {
            console.error('error getting all apps', error);
            return [];
        }
    }
    static async saveApp(appData) {
        try {

            console.log(appData)
            let result = await connection.query(`SELECT * FROM apps WHERE id='${appData.id}'`);

            let nApp;
            if (result.length > 0) {
                result = await connection.query(`
                UPDATE apps 
                SET name = ?,
                short_name = ?,
                url = ?,
                state = ?,
                type = ?,
                admin = ?
                WHERE id = ${appData.id};
                `, [appData.name, appData.short_name, appData.url, appData.state, appData.type, appData.admin]);

            } else {
                const saveRes = await connection.query(`
                    INSERT INTO apps 
                    (name, short_name, url, state, type, admin)
                    VALUES (?,?,?,?,?,?);
                    `, [appData.name, appData.short_name, appData.url, appData.state, appData.type, appData.admin]);

                appData.id = saveRes.insertId;

                const viewData = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="${appData.name}.css">
    <script src="${appData.name}.js"></script>
    <title>${appData.name}</title>
</head>
<body>
${appData.name}
</body>
</html>
`;
                fs.writeFileSync(`${process.env.BP_SRC_PATH}/views/${appData.name}.ejs`, viewData);

                const viewStyle = `
#${appData.name}-container {
    display: flex;
}
`;


                fs.writeFileSync(`${process.env.BP_PUBLIC_PATH}/styles/${appData.name}.css`, viewStyle);

                const viewScript = `
window.onload = () => {
    document.body.style.opacity = 1;
}
`;
                fs.writeFileSync(`${process.env.BP_PUBLIC_PATH}/scripts/${appData.name}.js`, viewScript);

                let tmpURL;
                let routeScript;
                // 0 - Controller, 1 - Model, 2 - Config
                if (appData.components[0] === 1) {
                    const controllerScript = `
exports.index = async (req, res, next) => {
    res.render('${appData.name}');
}
`;
                    tmpURL = `${process.env.BP_SRC_PATH}/controllers/${appData.name}_controller.js`;
                    fs.writeFileSync(tmpURL, controllerScript);

                    routeScript = `
const express = require('express');
const router = express.Router();
router.get('/', require('../controllers/${appData.name}_controller').index)
module.exports = router;
`;
                } else {
                    routeScript = `
const express = require('express');
const router = express.Router();
router.get('/', (req, res, next) => {
    res.render('${appData.name}');
})
module.exports = router;
`;
                }

                tmpURL = `${process.env.BP_SRC_PATH}/routes/${appData.name}_route.js`;
                fs.writeFileSync(tmpURL, routeScript);

                if (appData.components[1] === 1) {
                    const modelScript = `
let instance = null;
class ${appData.name}Model {
    static getModelInstance() {
        return instance ? instance : new ${appData.name}Model();
    }
}
module.exports = ${appData.name}Model;
`;
                    tmpURL = `${process.env.BP_SRC_PATH}/models/${appData.name}_model.js`;
                    fs.writeFileSync(tmpURL, modelScript);
                }

                nApp = await this.createApp(appData);
                this.addAppToServer(nApp);
            }
            return true;
        } catch (error) {
            console.error('error saving app', error)
            return false;
        }
    }
    static async createApp(appData) {
        const appOut = new App(appData);

        appOut.icon = this.getIconByName(appData.short_name);
        if (appOut.icon) appOut.icon = appOut.icon.data;
        else appOut.icon = this.getIconByName('default').data;

        let tmpName = `${process.env.BP_SRC_PATH}/routes/${appData.short_name}_route.js`;
        if (await this.fileExists(tmpName)) appOut.route = tmpName;

        tmpName = `${process.env.BP_SRC_PATH}/controller/${appData.short_name}_controller.js`;
        if (await this.fileExists(tmpName)) appOut.controller = tmpName;

        tmpName = `${process.env.BP_SRC_PATH}/models/${appData.short_name}_model.js`;
        if (await this.fileExists(tmpName)) appOut.model = tmpName;

        return appOut;
    }
    static async deleteApp(appData) {

        try {

            await connection.query(`UPDATE apps SET state='deleted' WHERE id=${appData.id};`);

            const binPath = `${process.env.BP_RECYCLE_BIN_PATH}/${Date.now()}_`;

            SystemService.apps = SystemService.apps.filter(a => a.id !== appData.id);

            let filePath = `${process.env.BP_SRC_PATH}/views/${appData.short_name}.ejs`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}.ejs`);

            filePath = `${process.env.BP_PUBLIC_PATH}/${appData.short_name}.js`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}.js`);

            filePath = `${process.env.BP_PUBLIC_PATH}/${appData.short_name}.css`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}.css`);

            filePath = `${process.env.BP_SRC_PATH}/routes/${appData.short_name}_route.js`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}._route.js`);

            filePath = `${process.env.BP_SRC_PATH}/controllers/${appData.short_name}_controller.js`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}_controller.js`);

            filePath = `${process.env.BP_SRC_PATH}/models/${appData.short_name}_model.js`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}_model.js`);


            return true;
        } catch (error) {
            console.error('error deleting app from db', error);
            return false;
        }
    }
    static async getAllUsers() {
        try {
            const users = await connection.query('SELECT * FROM users');
            SystemService.users = users;
        } catch (error) {
            console.error('error getting all users', error);
        }
    }
    static async getAllIcons() {
        try {
            SystemService.icons = [];
            const iconsData = dirTree(process.env.BP_ICONS_PATH);
            for (let i = 0; i < iconsData.children.length; i++) {
                const ico = iconsData.children[i];
                SystemService.icons.push({
                    name: ico.name.split('_')[0],
                    data: fs.readFileSync(ico.path).toString()
                });
            }
        } catch (error) {
            console.error('error initializing icons', error);
        }
    }
    static getIconByName(iconName) {

        const ico = SystemService.icons.filter(icon => icon.name === iconName)[0];
        return ico;
    }
    static async getAllMusic() {
        try {
            const radios = await connection.query('SELECT * FROM radios');
            for (let i = 0; i < radios.length; i++) {
                radios[i].id = `0.${radios[i].id}`;
            }
            let music = await dirTree(process.env.BP_MUSIC_PATH);

            const cleanData = (data, idx) => {
                data.path = data.path.replace('./nfs/public', '');
                data.path = data.path.replace('nfs/public', '');
                data.id = idx;
                if (data.children)
                    for (let i = 0; i < data.children.length; i++) {
                        cleanData(data.children[i], `${idx}.${i}`);
                    }
                else {
                    data.name = data.name.replace('.mp3', '');
                }
            }
            cleanData(music, '1');

            SystemService.music = {
                radios: radios,
                music: music
            };
        } catch (error) {
            console.error('error getting all music', error);
        }
    }
    static async startMariaDB() {
        connection.connect(error => {
            if (error) throw error;
            console.log('MariaDB connected.');
        });
        connection.query = util.promisify(connection.query);
    }
    static async endMariaDB() { }

    static async startMongoose() {
        try {
            await mongoose.connect(process.env.MONGOOSE, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log('MongoDB connected.')
        } catch (error) {
            console.error('error connecting mongoose', error);
        }
    }
    static async endMongoose() {

    }
    static getMongoose() { return mongoose }

    static async fileExists(filePath) {

        try {
            await fs.accessSync(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }
    static async restartServer() {
        await SystemService.execShellCommand('pm2 restart 0');
    }

    static async startServer(port) {
        SystemService.SERVER.listen(port, () => {
            console.log(`Server started at port:${port}!`);
        });
    }
    static async stopServer() {
        SystemService.SERVER.close();

    }

    static async execShellCommand(cmd) {
        const exec = require('child_process').exec;
        exec(cmd);
    }
}

SystemService.icons = [];
SystemService.music = [];
SystemService.images = [];
SystemService.games = [];
SystemService.apps = [];
SystemService.sites = [];
SystemService.users = [];
SystemService.SERVER = null;

module.exports = SystemService;