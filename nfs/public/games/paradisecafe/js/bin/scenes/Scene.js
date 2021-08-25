class Scene {
    constructor(callback, name) {

        this.callback = callback;
        this.name = name;

        this.tick = null;

        this.balloon = null;
        this.background = null;

        if (Resources.initialized) {
            this.background = new Background(e => { }, this.name);
            const music = Resources.getTrack(`${this.name}_track`);
            if (music) this.music = music.path;
            else this.music = null;
        }

        this.hero = null;
        this.NPCs = [];
        this.currentNPCIndex = 0;

        this.props = [];
        this.currentPropIndex = 0;
        this.animID = null;

        this.lighting = null;

        this.renderStack = [];

        this.reset();
    }

    update(delta, timed = false) {

        this.renderStack = [];

        if (this.background) {
            if (!timed) this.background.update();
            this.renderStack.push({
                imageData: this.background.imageData,
                x: this.background.x,
                y: this.background.y,
                width: this.background.width,
                height: this.background.height
            });
        }
        if (this.props.length > 0) {
            this.props.forEach(prop => {

                if (this.name === ScoresScene.NAME) {
                    console.log(prop.isEnabled)
                }
                if (prop.isEnabled) this.renderStack.push({
                    imageData: prop.imageData,
                    x: prop.x,
                    y: prop.y,
                    width: prop.width,
                    height: prop.height
                })
            });
        }


        if (this.NPCs.length > 0) {
            this.NPCs.forEach(npc => {
                if (npc.isEnabled) this.renderStack.push({
                    imageData: npc.imageData,
                    x: npc.x,
                    y: npc.y,
                    width: npc.width,
                    height: npc.height
                })
            })
        }
        if (this.hero && this.hero.isEnabled) {
            this.renderStack.push({
                imageData: this.hero.imageData,
                x: this.hero.x,
                y: this.hero.y,
                width: this.hero.width,
                height: this.hero.height
            })
        }

        if (this.lighting) {
            this.renderStack.push({
                imageData: this.lighting.imageData,
                x: this.background.x,
                y: this.background.y,
                width: this.background.width,
                height: this.background.height
            })
        }
        if (this.balloon) {
            this.renderStack.push({
                imageData: this.balloon.imageData,
                x: this.balloon.x,
                y: this.balloon.y,
                width: this.balloon.width,
                height: this.balloon.height
            })

        }
    }

    reset() {
        this.tick = -1;
        this.animID = null;
    }

    enable() {

        document.querySelector('html').style.backgroundColor = `var(--${this.name}scene-color)`;

        this.isEnabled = true;
        if (this.hero) this.hero.inventory = Resources.PLAYER_INVENTORY;
    }
    disable() {
        this.isEnabled = false;
        if (this.hero) Resources.PLAYER_INVENTORY = this.hero.inventory;
    }
}

Scene.ANIM_TIMEOUT = 1000;