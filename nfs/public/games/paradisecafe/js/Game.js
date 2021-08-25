class Game {

    constructor() {

        this.gameData = null;
        this.renderer = new Renderer(e => {
            console.log('renderer event', e)
        })
        this.audioSource = new AudioSource();

        this.menu = new Menu(async e => {

            switch (e) {
                case Menu.Actions.MUSIC_ON:
                    await this.audioSource.play(this.currentScene.music);
                    break;
                case Menu.Actions.MUSIC_OFF:
                    this.audioSource.stop();
                    break;
                case Menu.Actions.NORMAL_SPEED:
                    this.setSpeed(Game.SPEED.NORMAL);
                    break;
                case Menu.Actions.TURBO_SPEED:
                    this.setSpeed(Game.SPEED.FAST);
                    break;
                case Menu.Actions.ABOUT:
                    console.log('go to about')
                    break;
                case Menu.Actions.EXIT:
                    console.log('go to games')
                    break;
            }
        })

        this.currentState = Game.States.PAUSED;
        this.HUDUpdate = false;

        this.controller = new Controller(e => {
            if (this.menu.isOpen) {
                this.menu.close();
            } else {
                this.menu.open();
            }
        })
        this.isPlaying = false;
        this.isTransition = false;
    }

    init(data) {

        this.gameData = data;

        Resources.labelsData = this.gameData.labels;
        Loader.init();
        Keyboard.init();

        const landingScene = new LandingScene(async e => {

            this.pause();
            if (e === Resources.labelsData.YES) {
                this.startGame();
            } else {
                window.open(Resources.VERIFY_AGE_LINK, '_blank');
            }
        });

        this.intervalID = null;

        this.setSpeed(Game.SPEED.FAST);
        this.setScene(landingScene);

        this.run();
    }

    async startGame() {

        await Resources.init(this.gameData);
        HUD.init();
        Loader.clear();
        const splashScene = new SplashScene(e => {
            this.setSpeed(Game.SPEED.NORMAL);
            // this.setSpeed(Game.SPEED.FAST);
            this.HUDUpdate = false;
            this.setScene(mainScene);
            this.controller.show();
        });
        const mainScene = new MainScene(e => {
            Resources.resetPlayerInventory();
            switch (e) {
                case Resources.labelsData.PLAY:
                    this.currentState = Game.States.PLAYING;
                    this.HUDUpdate = true;
                    this.setScene(streetScene, true);
                    break;
                case Resources.labelsData.HISCORES:
                    this.currentState = Game.States.SCORES;
                    this.HUDUpdate = false;
                    this.setScene(scoresScene, true);
                    break;
            }
        });
        const scoresScene = new ScoresScene(e => {
            this.HUDUpdate = false;
            this.currentState = Game.States.MAIN;
            this.setScene(mainScene, true);
        });
        const streetScene = new StreetScene(e => {
            this.HUDUpdate = true;
            switch (e) {
                case ParadiseCafeScene.NAME:
                    this.setScene(paradiseCafeScene, true);
                    break;
                case CrackhouseScene.NAME:
                    this.setScene(crackhouseScene, true);
                    break;
                case BrothelScene.NAME:
                    this.setScene(brothelScene, true);
                    break;
                case JailScene.NAME:
                    this.HUDUpdate = false;
                    this.setScene(jailScene, true);
                    break;

            }
        });
        const brothelScene = new BrothelScene(e => {
            this.HUDUpdate = true;
            this.setScene(streetScene, true);
        });
        const crackhouseScene = new CrackhouseScene(e => {
            this.HUDUpdate = true;
            if (e === CrackhouseScene.States.FAIL) {
                this.HUDUpdate = false;
                this.setScene(jailScene, true);
            }
            else {
                this.currentState = Game.States.PLAYING;
                this.setScene(streetScene, true);
            }
        });
        const paradiseCafeScene = new ParadiseCafeScene(e => {
            this.currentState = Game.States.PLAYING;
            this.HUDUpdate = true;
            if (e === JailScene.NAME) {
                this.HUDUpdate = false;
                this.setScene(jailScene, true)
            }
            else this.setScene(streetScene, true);
        });
        const jailScene = new JailScene(e => {
            this.HUDUpdate = false;
            this.setScene(mainScene, true);
        })

        this.setSpeed(Game.SPEED.SLOW);
        this.setScene(splashScene);

        this.currentState = Game.States.PLAYING;
        this.run();
    }

    async setScene(scene, doTransition = false) {


        // if (doTransition && !this.isTransition) {
        //     this.isTransition = true;

        //     this.transition(this.renderer.ctx, this.renderer.canvas, async () => {

        //         console.log('done')

        //         this.isTransition = false;

        //         this.currentScene.disable();
        //         this.currentScene = scene;
        //         this.currentScene.enable();
        //         await this.audioSource.play(this.currentScene.music);
        //     })
        //     return;
        // }

        if (this.currentScene) this.currentScene.disable();
        this.currentScene = scene;
        this.currentScene.enable();

        await this.audioSource.play(this.currentScene.music);
    }
    setSpeed(speed) {
        Game.CURRENT_SPEED = speed;
        if (this.intervalID) {
            this.pause();
            this.run();
        }
    }

    run() {
        if (this.intervalID || this.isTransition) return;

        let tick = 0;
        this.intervalID = setInterval(() => {

            if (this.menu.isOpen) return;

            this.currentScene.update(tick);
            switch (this.currentState) {
                case Game.States.PLAYING:
                    this.renderer.render(this.currentScene.renderStack);
                    if (this.HUDUpdate) HUD.update(Resources.PLAYER_INVENTORY);
                    break;
                case Game.States.PAUSED:

                    break;
                case Game.States.MAIN:
                    this.renderer.render(this.currentScene.renderStack);
                    break;
            }
            tick++;
        }, Game.CURRENT_SPEED);
    }
    pause() {
        if (!this.intervalID) return;
        clearInterval(this.intervalID);
        this.intervalID = null;
    }

    transition(context, canvas, callback) {

        let blocksize = 2;
        let vc = document.createElement('canvas');
        vc.width = canvas.width / 4;
        vc.height = canvas.height / 4;
        let vctx = vc.getContext('2d');
        vctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        let int = setInterval(() => {

            vc.height = canvas.height;
            vc.width = canvas.width;

            let size = (blocksize) * 0.5;
            let w = canvas.width * size;
            let h = canvas.height * size;
            context.drawImage(vc, 0, 0, w, h);
            context.mozImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
            context.drawImage(canvas, canvas.width * 0.5, canvas.height * 0.5, canvas.width, canvas.height, 0, 0, w, h);

            blocksize += Math.round(blocksize / 2);
            if (blocksize >= 32) {
                callback();
                clearInterval(int);
            }
        }, Game.CURRENT_SPEED);
    }
}

Game.States = {
    MAIN: 'gamestatemain',
    PAUSED: 'gamestatepaused',
    PLAYING: 'gamestateplaying',
    ENDED: 'gamestateended',
    SCORES: 'gamestatescores'
}

Game.SPEED = {
    SLOW: 350,
    NORMAL: 150,
    FAST: 50
}

Game.CURRENT_SPEED = Game.SPEED.NORMAL;

Game.Events = {
    INITIALIZED: 'gameeventinitialized'
}