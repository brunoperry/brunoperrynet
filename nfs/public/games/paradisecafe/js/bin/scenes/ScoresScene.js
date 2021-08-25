class ScoresScene extends Scene {

    constructor(callback) {
        super(callback, ScoresScene.NAME);

        console.log(this.background)

        this.scoresData = [{
            id: 0,
            name: 'TST',
            score: 10000,
            date_created: '23-ABR-2016'
        }];

        this.blink = true;


        this.canvas = document.querySelector('canvas');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
    }

    update() {

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.blink = !this.blink;

        if (this.blink) {
            this.ctx.drawImage(this.background.images[0].imageData, 0, 0);
        } else {
            this.ctx.drawImage(this.background.images[1].imageData, 0, 0);
        }

        this.ctx.font = '28px Mono';
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(Resources.labelsData.HI_SCORES, 80, 40);

        this.ctx.font = '20px Mono';
        this.ctx.fillText(Resources.labelsData.NAME, 40, 60);
        this.ctx.fillText(Resources.labelsData.SCORE, 145, 60);

        let offsetY = 10;
        for (let i = 0; i < ScoresScene.MAX_SCORES; i++) {
            const score = this.scoresData[i];

            let txtN;
            let txtS;
            if (score) {
                this.ctx.fillStyle = 'white';
                txtN = score.name;
                txtS = score.score;
            } else {
                this.ctx.fillStyle = 'black';
                txtN = '---';
                txtS = '-------';
            }
            this.ctx.fillText(txtN, 40, 80 + (offsetY * i));
            this.ctx.fillText(txtS, 145, 80 + (offsetY * i));
        }
    }

    async enable() {
        super.enable();

        try {
            const req = await fetch('https://brunoperry.net/games/paradisecafe/scores');
            this.scoresData = await req.json();
        } catch (error) {
            console.log('problem loading scores');
            this.scoresData = [{
                id: 0,
                name: 'TST',
                score: 10000,
                date_created: '23-ABR-2016'
            }];
        }

        if (!Keyboard.isShown) {
            Keyboard.show([
                {
                    text: Resources.labelsData.HOME,
                    action: Resources.labelsData.HOME
                }
            ]);
            Keyboard.onChange = e => {
                Keyboard.hide();
                console.log('click')
                this.callback();
            };
        }
    }

    disable() {
        super.disable();
        this.scoresTick = 0;
    }
}
ScoresScene.NAME = 'scores';
ScoresScene.MAX_SCORES = 5;