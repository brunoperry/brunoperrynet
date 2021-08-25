class SwipeDoor extends Component {

    constructor(callback) {
        super(callback, SwipeDoor.NAME);

        this.swipeOpenImages = this.getImagesByName(SwipeDoor.NAME);
        this.swipeCloseImages = [... this.swipeOpenImages].reverse();

        this.currentCycle = [this.swipeCloseImages[this.swipeCloseImages.length - 1]];
    }

    doOpen() {
        if (this.isOpened) return;

        if (this.currentCycle !== this.swipeOpenImages) {
            this.setCurrentCycle(this.swipeOpenImages, false);
        }
        if (this.tick === this.currentCycle.length - 1) this.isOpened = true;
    }
    doClose(now = false) {

        if (!this.isOpened && !now) return;
        if (this.currentCycle !== this.swipeCloseImages) {
            this.setCurrentCycle(this.swipeCloseImages, false);
        }
        if (this.tick === this.currentCycle.length - 1) this.isOpened = false;
    }
    enable() {
        super.enable();
    }
    disable() {
        super.disable();
        this.isOpened = false;
    }
}
SwipeDoor.NAME = 'swipe';