const fs = require('fs');
const dotEnv = require('dotenv');
dotEnv.config();
const dirTree = require('directory-tree');
const mysql = require('mysql');
const util = require('util');
const App = require('./models/app_model');
const removeRoute = require('express-remove-route');

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

        SystemService.SERVER = server;

        let apps = await this.getAllApps();
        apps = apps.filter(a => a.state !== 'inactive');
        apps = apps.filter(a => a.state !== 'deleted');
        apps = apps.filter(a => a.type !== 'system');
        for (let i = 0; i < apps.length; i++) {
            this.addApp(await this.createApp(apps[i]));
        }
    }

    static addApp(app) {


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

                const remRoute = removeRoute(SystemService.SERVER, appData.url);
                nApp = await this.createApp(appData);
                this.addApp(nApp);
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
                fs.writeFileSync(`./nfs/brunoperry_net/src/views/${appData.name}.ejs`, viewData);

                const viewStyle = `
#${appData.name}-container {
    display: flex;
}
`;
                fs.writeFileSync(`./nfs/brunoperry_net/public/${appData.name}.css`, viewStyle);

                const viewScript = `
window.onload = () => {
    document.body.style.opacity = 1;
}
`;
                fs.writeFileSync(`./nfs/brunoperry_net/public/${appData.name}.js`, viewScript);

                let tmpURL;
                let routeScript;
                // 0 - Controller, 1 - Model, 2 - Config
                if (appData.components[0] === 1) {
                    const controllerScript = `
exports.index = async (req, res, next) => {
    res.render('${appData.name}');
}
`;
                    tmpURL = `./nfs/brunoperry_net/src/controllers/${appData.name}_controller.js`;
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

                tmpURL = `./nfs/brunoperry_net/src/routes/${appData.name}_route.js`;
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
                    tmpURL = `./nfs/brunoperry_net/src/models/${appData.name}_model.js`;
                    fs.writeFileSync(tmpURL, modelScript);
                }

                nApp = await this.createApp(appData);
                this.addApp(nApp);
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

        let tmpName = `./nfs/brunoperry_net/src/routes/${appData.short_name}_route.js`;
        if (await this.fileExists(tmpName)) appOut.route = tmpName;

        tmpName = `./nfs/brunoperry_net/src/controller/${appData.short_name}_controller.js`;
        if (await this.fileExists(tmpName)) appOut.controller = tmpName;

        tmpName = `./nfs/brunoperry_net/src/models/${appData.short_name}_model.js`;
        if (await this.fileExists(tmpName)) appOut.model = tmpName;

        return appOut;
    }
    static async deleteApp(appData) {

        try {

            await connection.query(`UPDATE apps SET state='deleted' WHERE id=${appData.id};`);

            const binPath = `./nfs/brunoperry_net/recycle_bin/${Date.now()}_`;

            SystemService.apps = SystemService.apps.filter(a => a.id !== appData.id);
            const rem = removeRoute(SystemService.SERVER, `/${appData.url}`);
            console.log(`${appData.name} route removed`, rem)

            let filePath = `./nfs/brunoperry_net/src/views/${appData.short_name}.ejs`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}.ejs`);

            filePath = `./nfs/brunoperry_net/public/${appData.short_name}.js`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}.js`);

            filePath = `./nfs/brunoperry_net/public/${appData.short_name}.css`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}.css`);

            filePath = `./nfs/brunoperry_net/src/routes/${appData.short_name}_route.js`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}._route.js`);

            filePath = `./nfs/brunoperry_net/src/controllers/${appData.short_name}_controller.js`;
            if (await this.fileExists(filePath)) await fs.renameSync(filePath, `${binPath}${appData.short_name}_controller.js`);

            filePath = `./nfs/brunoperry_net/src/models/${appData.short_name}_model.js`;
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
            const iconsData = dirTree('nfs/public/icons');
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
            const music = dirTree('nfs/public/music/');
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
}

SystemService.icons = [];
SystemService.music = [];
SystemService.apps = [];
SystemService.users = [];
SystemService.SERVER = null;

module.exports = SystemService;