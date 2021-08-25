class Background extends Component {

    constructor(callback, sceneName = null) {
        super(callback, sceneName);

        const n = `${sceneName}_${Background.NAME}`;
        this.images = this.images.filter(img => img.name.includes(n));
        if (this.images.length > 0) {
            this.width = this.images[0].imageData.width;
            this.height = this.images[0].imageData.height;
        } else {
            this.width = 0;
            this.height = 0;
        }
        this.currentCycle = this.images;
        this.isEnabled = true;
    }

    updateTimed(time = 1000) {
        if (this.animID) return;

        this.animID = setTimeout(() => {
            this.animID = null;
        }, time)

        super.update(true);
    }

    disable() {
        super.disable();
    }
}
Background.NAME = 'bckgrd';