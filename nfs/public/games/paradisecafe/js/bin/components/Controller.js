class Controller {

    constructor(callback) {
        this.callback = callback;

        this.isShown = false;

        this.view = document.querySelector('#controller');
        document.querySelector('#menu-button').onclick = e => {
            this.callback(Controller.Events.MENU)
        }
    }

    show() {
        if (this.isShown) return;
        this.view.style.transform = 'translateY(0)';
        this.isShown = true;
    }
    hide() {
        if (!this.isShown) return;
        this.view.style.transform = 'translateY(-100%)';
        this.isShown = false;
    }
}

Controller.Events = {
    MENU: 'controllereventsmenu'
}