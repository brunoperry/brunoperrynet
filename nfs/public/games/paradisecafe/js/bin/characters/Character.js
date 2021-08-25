class Character extends Component {

    constructor(callback, name) {
        super(callback, name);

        // this.inventory = null;
        this.isOutside = false;


        this.exitDoorCycle = this.getImagesByName(`${this.name}_show`);
        this.enterDoorCycle = [...this.exitDoorCycle].reverse();

        this.balloonImages = this.images.filter(img => img.name.includes('balloons'));

        this.reset();
    }

    doEnterDoor() {
        if (this.currentCycle !== this.enterDoorCycle) {
            this.setCurrentCycle(this.enterDoorCycle, false);
        }
        this.isOutside = this.tick === this.currentCycle.length - 1;
    }
    doExitDoor() {
        if (this.currentCycle !== this.exitDoorCycle) {
            this.setCurrentCycle(this.exitDoorCycle, false);
        }
        this.isOutside = this.tick === this.currentCycle.length - 1;

    }

    getBalloon(ballonName = 'emtpty') {
        return this.balloonImages.find(img => img.name.includes(ballonName))
    }
    getRandomBalloon(ballonName) {
        const bllns = this.balloonImages.filter(img => img.name.includes(ballonName));
        return Utils.getRandomItem(bllns);
    }

    reset() {

        this.doAction = false;
        this.isOutside = false;
    }
}