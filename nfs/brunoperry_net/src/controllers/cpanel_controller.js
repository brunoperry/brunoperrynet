const SystemService = require("../../../../src/system_service");

exports.index = async (req, res, next) => {
    res.render('cpanel');
}

exports.saveApp = async (req, res, next) => {
    if (!req.user) {
        res.send({})
        return;
    }
    const appData = req.body;
    const saveRes = await SystemService.saveApp(appData);
    let message = `${req.body.name} app saved!`;
    if (!saveRes) message = `Error saving ${appData.name} app`;
    res.send({
        success: saveRes,
        message: message,
        data: SystemService.apps
    })
}

exports.deleteApp = async (req, res, next) => {
    if (!req.user) {
        res.send({});
        return;
    }
    const appData = req.body;
    const delRes = await SystemService.deleteApp(appData);
    let message = `${appData.name} app deleted!`
    if (!delRes) message = `Error deleting ${appData.name} app`;
    res.send({
        success: delRes,
        message: message,
        data: SystemService.apps
    });
}

exports.getApps = async (req, res) => {
    if (!req.user) {
        res.send({})
        return;
    }
    res.send(SystemService.apps);
}

exports.getUsers = async (req, res) => {
    if (!req.user) {
        res.send({})
        return;
    }
    res.send(SystemService.users);
}

exports.restartServer = async (req, res) => {

    if (!req.user) return false;
    SystemService.restartServer();
}