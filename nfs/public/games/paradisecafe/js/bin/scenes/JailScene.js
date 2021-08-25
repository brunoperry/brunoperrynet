class JailScene extends Scene {

    constructor(callback) {
        super(callback, JailScene.NAME);
        this.bckgrdTick = 0;
    }

    update() {

        this.renderStack = [];
        this.blink = !this.blink;
        if (this.blink) {
            this.background.update()
        }
        this.renderStack = [this.background];
        if (!Keyboard.isShown) {
            Keyboard.show([
                {
                    text: Resources.labelsData.HOME,
                    action: Resources.labelsData.HOME
                },
                {
                    text: Resources.labelsData.HISCORES,
                    action: Resources.labelsData.HISCORES
                }
            ]);
            Keyboard.onChange = e => {
                this.callback(e);
            }
        }
    }
}
JailScene.NAME = 'jail';