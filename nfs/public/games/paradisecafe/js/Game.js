class Game {

    constructor() {

        this.gameData = null;
        this.renderer = new Renderer(e => {
            console.log('renderer event', e)
        })
        this.audioSource = new AudioSource();
        // this.audioSource.volume = 0;

        this.currentState = Game.States.PAUSED;
        this.HUDUpdate = false;

        this.controller = new Controller(e => {
            switch (e) {
                case Controller.Events.PLAYPAUSE:
                    this.isPlaying = !this.isPlaying;
                    this.isPlaying ? this.pause() : this.run();
                    break;
                case Controller.Events.MUTE:
                    this.audioSource.mute();
                    break;
                case Controller.Events.MENU:

                    break;
            }
        })
        this.isPlaying = false;
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
            // this.setSpeed(Game.SPEED.NORMAL);
            this.setSpeed(Game.SPEED.FAST);
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
                    this.setScene(streetScene);
                    break;
                case Resources.labelsData.HISCORES:
                    this.currentState = Game.States.SCORES;
                    this.HUDUpdate = false;
                    this.setScene(scoresScene);
                    break;
            }
        });
        const scoresScene = new ScoresScene(e => {
            this.HUDUpdate = false;
            this.currentState = Game.States.MAIN;
            this.setScene(mainScene);
        });
        const streetScene = new StreetScene(e => {
            this.HUDUpdate = true;
            switch (e) {
                case ParadiseCafeScene.NAME:
                    this.setScene(paradiseCafeScene);
                    break;
                case CrackhouseScene.NAME:
                    this.setScene(crackhouseScene);
                    break;
                case BrothelScene.NAME:
                    this.setScene(brothelScene);
                    break;
                case JailScene.NAME:
                    this.HUDUpdate = false;
                    this.setScene(jailScene);
                    break;

            }
        });
        const brothelScene = new BrothelScene(e => {
            this.HUDUpdate = true;
            this.setScene(streetScene);
        });
        const crackhouseScene = new CrackhouseScene(e => {
            this.HUDUpdate = true;
            if (e === CrackhouseScene.States.FAIL) {
                this.HUDUpdate = false;
                this.setScene(jailScene);
            }
            else {
                this.currentState = Game.States.PLAYING;
                this.setScene(streetScene);
            }
        });
        const paradiseCafeScene = new ParadiseCafeScene(e => {
            this.currentState = Game.States.PLAYING;
            this.HUDUpdate = true;
            if (e === JailScene.NAME) {
                this.HUDUpdate = false;
                this.setScene(jailScene)
            }
            else this.setScene(streetScene);
        });
        const jailScene = new JailScene(e => {
            this.HUDUpdate = false;
            this.setScene(mainScene);
        })

        this.setSpeed(Game.SPEED.SLOW);
        this.setScene(splashScene);
        // this.setSpeed(Game.SPEED.FAST);
        // this.setScene(crackhouseScene);
        // this.setSpeed(Game.SPEED.FAST);
        // this.HUDUpdate = true;
        // this.setScene(paradiseCafeScene);
        // this.controller.show();

        this.currentState = Game.States.PLAYING;
        this.run();
    }

    setScene(scene) {

        if (this.currentScene) this.currentScene.disable();
        this.currentScene = scene;
        this.currentScene.enable();

        this.audioSource.play(this.currentScene.music);
    }
    setSpeed(speed) {
        Game.CURRENT_SPEED = speed;
        if (this.intervalID) {
            this.pause();
            this.run();
        }
    }

    run() {
        if (this.intervalID) return;

        let tick = 0;
        this.intervalID = setInterval(() => {

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