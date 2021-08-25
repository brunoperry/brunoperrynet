class LandingScene extends Scene {

    constructor(callback) {
        super(callback, LandingScene.NAME);

        this.isBlink = true;

        this.canvas = document.querySelector('canvas');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
    }

    update() {

        if (!this.animID) {
            this.animID = setTimeout(() => {
                this.isBlink = !this.isBlink;
                this.animID = null;
            }, Scene.ANIM_TIMEOUT);
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);

        let fillColor;
        if (this.isBlink) {
            fillColor = 'red';
        } else {
            fillColor = 'rgba(255,0,0,0.5)';
        }
        this.ctx.fillStyle = fillColor;
        this.ctx.font = 'bold 33px Mono';

        let labels = Resources.labelsData.NO_ACCESS_WARNING.split(',');
        let text = this.ctx.measureText(labels[0]);
        this.ctx.fillText(labels[0], ((this.width / 2) - (text.width / 2)), (this.height / 2) - 20);

        text = this.ctx.measureText(labels[1]);
        this.ctx.fillText(labels[1], ((this.width / 2) - (text.width / 2)), (this.height / 2));

        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Mono';

        labels = Resources.labelsData.AGE_VERIFY;
        text = this.ctx.measureText(labels);
        this.ctx.fillText(labels, ((this.width / 2) - (text.width / 2)), (this.height / 2) + 40);
    }

    enable() {
        super.enable();
        Keyboard.show([
            {
                text: Resources.labelsData.YES,
                action: Resources.labelsData.YES
            },
            {
                text: Resources.labelsData.NO,
                action: Resources.labelsData.NO
            }
        ]
        )
        Keyboard.onChange = (e) => {
            if (e !== Resources.labelsData.NO) Keyboard.hide();
            this.callback(e);
        }
    }

    disable() {
        if (this.animID) clearTimeout(this.animID);
        super.disable();
    }
}

LandingScene.NAME = 'landing';