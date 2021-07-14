class AppModel {
    constructor(data) {

        this.update(data);

        this.icon = null;

        this.route = null;
        this.controller = null;
        this.model = null;
        this.config = null;
    }

    update(appData) {
        this.id = appData.id;
        this.name = appData.name;
        this.short_name = appData.short_name;
        this.url = `${appData.url}`;
        this.state = appData.state;
        this.type = appData.type;
        this.admin = appData.admin;
    }
}
const App = AppModel;

module.exports = App;