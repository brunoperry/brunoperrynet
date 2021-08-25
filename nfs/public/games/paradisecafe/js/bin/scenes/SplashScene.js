class SplashScene extends Scene {

    constructor(callback) {
        super(callback, SplashScene.NAME);

        this.loadingCanvas = null;
        this.loadingCtx = null;

        this.width = document.body.offsetWidth;
        this.height = document.body.offsetHeight;

        this.animTick = 0;
        this.yPos = 0;

        this.FX1Colors = ['rgb(0, 255, 255)', 'rgb(192, 0, 0)'];
        this.FX2Colors = ['rgb(255, 255, 0)', 'rgb(0, 0, 255)'];
        this.FX3Colors = ['rgb(0, 0, 0)', 'rgb(0, 0, 192)', 'rgb(192, 0, 0)',
            'rgb(192, 0, 192)',
            'rgb(0, 0, 255)',
            'rgb(255, 0, 0)',
            'rgb(255, 0, 255)',
            'rgb(0, 192, 0)',
            'rgb(0, 192, 192)',
            'rgb(192, 192, 0)',
            'rgb(192, 192, 192)',
            'rgb(0, 255, 0)',
            'rgb(0, 255, 255)',
            'rgb(255, 255, 0)',
            'rgb(255, 255, 255)'
        ];

        this.SCENE_TIME = 14;
        this.SCENE_TIMEOUT = 0;
    }

    update(delta) {
        super.update(delta);

        this.SCENE_TIMEOUT++;
        if (this.SCENE_TIMEOUT >= this.SCENE_TIME) {
            this.callback();
        }
    }
    renderBackground() {

        let startTime = null;
        let currentTime;
        const loop = (timestamp) => {
            if (!this.isEnabled) return;

            if (!startTime) {
                startTime = timestamp;
            }
            currentTime = timestamp - startTime;
            this.loadingCtx.fillStyle = 'rgb(0, 0, 0)';
            this.loadingCtx.fillRect(0, 0, this.width, this.height);
            if (currentTime < 597) {
                this.FX1();
            } else if (currentTime >= 596 && currentTime < 4446) {
                this.FX2();
            } else if (currentTime >= 4446) {
                this.FX3();
            }

            if (this.isEnabled) window.requestAnimationFrame(loop);
        }
        loop();
    }
    FX1() {
        let colIndex = 0;
        let vH = 32;

        for (let i = 0; i < this.height; i++) {

            if (colIndex >= this.FX1Colors.length) {
                colIndex = 0;
            }

            this.loadingCtx.fillStyle = this.FX1Colors[colIndex];
            this.loadingCtx.fillRect(0, this.yPos, this.width, vH);
            if (this.yPos >= this.height + 32) {
                this.yPos = -64;
                break;
            } else {
                this.yPos += vH;
                colIndex++;
            }
        }

        this.animTick++;
        if (this.animTick === 64) {
            this.animTick = 0;
        }
        this.yPos += this.animTick;
    }
    FX2() {

        let colIndex = 0;
        const hs = [8, 16, 32, 32, 64];
        let vH;
        for (let i = 0; i < this.height; i++) {

            vH = Utils.getRandomItem(hs);
            if (colIndex >= this.FX2Colors.length) {
                colIndex = 0;
            }
            this.loadingCtx.fillStyle = this.FX2Colors[colIndex];
            this.loadingCtx.fillRect(0, this.yPos, this.width, vH);
            if (this.yPos >= this.height) {
                this.yPos = 0;
                break;
            } else {
                this.yPos += vH;
                colIndex++;
            }
        }
    }
    FX3() {

        const vH = 4;
        for (let i = 0; i < this.height; i++) {
            this.loadingCtx.fillStyle = Utils.getRandomItem(this.FX3Colors);
            this.loadingCtx.fillRect(0, this.yPos, this.width, vH);
            if (this.yPos >= this.height) {
                this.yPos = 0;
                break;
            } else {
                this.yPos += vH;
            }
        }
    }

    enable() {
        this.loadingCanvas = document.createElement('canvas');
        this.loadingCanvas.className = 'v-canvas';
        this.loadingCanvas.width = this.width;
        this.loadingCanvas.height = this.height;
        document.querySelector('#main-container').appendChild(this.loadingCanvas);
        this.loadingCtx = this.loadingCanvas.getContext('2d');
        super.enable();

        this.renderBackground();
    }
    disable() {
        document.body.querySelector('#main-container').removeChild(this.loadingCanvas);
        this.loadingCanvas = null;
        this.loadingCtx = null;

        super.disable();
    }
}

SplashScene.NAME = 'splash';