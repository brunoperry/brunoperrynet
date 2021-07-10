class AppModel {
    constructor(data) {

        this.id = data.id;
        this.name = data.name;
        this.short_name = data.short_name;
        this.url = data.url;
        this.state = data.state;
        this.type = data.type;
        this.admin = data.admin;

        this.icon = null;

        this.route = null;
        this.controller = null;
        this.model = null;
        this.config = null;
    }
}
const App = AppModel;

module.exports = App;