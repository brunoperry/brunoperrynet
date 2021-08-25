class MainScene extends Scene {

    constructor(callback) {
        super(callback, MainScene.NAME);

        this.blink = true;
    }

    update(delta) {

        this.renderStack = [];
        this.blink = !this.blink;
        if (this.blink) {
            this.background.update()
        }
        this.renderStack = [this.background];
    }

    enable() {
        super.enable();
        Keyboard.show([
            {
                text: Resources.labelsData.PLAY,
                action: Resources.labelsData.PLAY
            },
            {
                text: Resources.labelsData.HISCORES,
                action: Resources.labelsData.HISCORES
            }
        ])
        Keyboard.onChange = (e) => {
            Keyboard.hide();
            this.callback(e);
        }
    }
    disable() {
        super.disable();
    }
}

MainScene.NAME = 'main';