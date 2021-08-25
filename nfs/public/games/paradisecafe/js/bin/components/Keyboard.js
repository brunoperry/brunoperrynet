class Keyboard {

    static init() {
        Keyboard.ExitKey = document.querySelector('#exit-scene-button');
        Keyboard.ExitKey.innerText = Resources.labelsData.EXIT;
        Keyboard.ExitKey.onclick = () => {
            Keyboard.onChange(Resources.labelsData.EXIT);
        }
    }
    static onChange(e) { }

    static build(data) {
        const view = document.querySelector('#keyboard');
        view.innerHTML = '';
        for (let i = 0; i < data.length; i++) {
            const btnData = data[i];
            const button = document.createElement('button');
            button.innerText = btnData.text;
            button.action = btnData.action;
            button.onclick = () => {
                Keyboard.onChange(button.action);
            }
            view.appendChild(button);
        }
    }

    static updateButtonText(text, andAction = false) {
        const btn = document.querySelector('#keyboard').querySelector('button')
        btn.innerText = text;
        if (andAction) {
            btn.action = text;
        }
    }
    static show(data) {
        if (data) Keyboard.build(data);
        document.querySelector('#keyboard').style.transform = 'translateY(0)';
        Keyboard.isShown = true;

        if (Keyboard.exitEnabled) Keyboard.hideExit();
    }
    static showExit(cb) {
        Keyboard.ExitKey.className = 'visible';
        Keyboard.isExitShown = true;
        Keyboard.ExitKey.onclick = cb;

    }
    static hideExit() {
        Keyboard.ExitKey.className = 'invisible';
        Keyboard.isExitShown = false;
        Keyboard.ExitKey.onclick = null;
    }
    static hide() {
        document.querySelector('#keyboard').style.transform = 'translateY(100%)';
        Keyboard.onChange = () => { }
        Keyboard.isShown = false;
        if (Keyboard.exitEnabled) Keyboard.showExit();
    }
}

Keyboard.isShown = false;
Keyboard.isExitShown = false;
Keyboard.ExitKey = null;
Keyboard.exitEnabled = false;
