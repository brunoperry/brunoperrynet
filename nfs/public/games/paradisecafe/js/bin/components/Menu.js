class Menu {

    constructor(callback) {
        this.view = document.querySelector('#menu-container');

        this.isOpen = false;

        document.querySelector('#music-button').onclick = e => {
            const elem = e.target;
            if (elem.innerText.includes('X')) {
                elem.innerHTML = `${Resources.labelsData.MUSIC}[ ]`;
                callback(Menu.Actions.MUSIC_OFF);
            } else {
                elem.innerHTML = `${Resources.labelsData.MUSIC}[<span class="highlight">X</span>]`;
                callback(Menu.Actions.MUSIC_ON)
            }
            this.close();
        }

        this.nButton = document.querySelector('#nspeed-button');
        this.nButton.onclick = e => {
            callback(this.updateSpeed(this.nButton));
            this.close();
        }
        this.currentSpeedButton = this.nButton;

        this.tButton = document.querySelector('#tspeed-button');
        this.tButton.onclick = e => {
            callback(this.updateSpeed(this.tButton));
            this.close();
        }

        document.querySelector('#about-button').onclick = e => {
            callback(Menu.Actions.ABOUT);
            this.close();
        }

        document.querySelector('#exit-button').onclick = e => {
            callback(Menu.Actions.EXIT);
            this.close();
        }

        document.querySelector('#close-button').onclick = e => {
            this.close();
        }
    }

    updateSpeed(elem) {

        if (elem === this.currentSpeedButton) return;

        this.currentSpeedButton = elem;
        if (this.nButton === elem) {
            this.nButton.innerHTML = `${Resources.labelsData.NORMAL}[<span class="highlight">X</span>]`;
            this.tButton.innerHTML = `${Resources.labelsData.TURBO}[ ]`;
            return Menu.Actions.NORMAL_SPEED;
        } else {
            this.tButton.innerHTML = `${Resources.labelsData.TURBO}[<span class="highlight">X</span>]`;
            this.nButton.innerHTML = `${Resources.labelsData.NORMAL}[ ]`;
            return Menu.Actions.TURBO_SPEED;
        }
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.view.style.transform = 'translateX(0)';
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.view.style.transform = 'translateX(100%)';
    }
}

Menu.Actions = {
    MUSIC_ON: 'menuactionsmusicon',
    MUSIC_OFF: 'menuactionsmusicoff',
    NORMAL_SPEED: 'menuactionsnormalspeed',
    TURBO_SPEED: 'menuactionsturbospeed',
    ABOUT: 'menuactionsabout',
    EXIT: 'menuactionsexit'
}