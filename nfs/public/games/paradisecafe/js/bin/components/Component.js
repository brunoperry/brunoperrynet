class Component {

    constructor(callback, name) {
        this.callback = callback;
        this.name = name;
        this.index = null;
        this.isEnabled = false;

        this.images = Resources.getImages(this.name);

        this.actions = [];
        this.currentAction = null;

        const cvn = document.querySelector('canvas');
        this.canvasW = cvn.width;
        this.canvasH = cvn.height;

        this.animID = null;

        this.x = 0;
        this.y = 0;

        if (this.images.length > 0) {
            this.width = this.images[0].imageData.width;
            this.height = this.images[0].imageData.height;
        } else {
            this.width = 0;
            this.height = 0;
        }

        this.currentCycle = null;
        this.loopCurrentCycle = false;
        this.setCurrentCycle();
    }

    moveTo(x, y = null) {
        this.x = x;
        if (y !== null) this.y = y;
    }

    setCurrentCycle(cycle = null, loop = true) {

        this.currentCycle = cycle;
        this.loopCurrentCycle = loop;
        this.tick = 0;

        if (this.currentCycle) {
            this.width = this.currentCycle[this.tick].imageData.width;
            this.height = this.currentCycle[this.tick].imageData.height;
        } else {
            this.width = 0;
            this.height = 0;
        }
    }
    update(tick) {
        if (!this.isEnabled) return;
        this.tick++;
        if (this.tick === this.currentCycle.length) {
            if (!this.loopCurrentCycle) this.tick = this.currentCycle.length - 1;
            else this.tick = -1;
        }
    }

    getImagesByName(imageName) {
        return this.images.filter(img => img.name.includes(imageName));
    }

    enable() { this.isEnabled = true; }
    disable() {
        this.currentAction = null;
        this.isEnabled = false;
        this.animID = null;
        this.currentCycle = null;
        this.loopCurrentCycle = false;
    }

    get imageData() {
        if (this.tick < 0) this.tick = 0;
        return this.currentCycle[this.tick].imageData;
    }
}