class OldLady extends Character {

    constructor(callback) {
        super(callback, OldLady.NAME);

        this.bendCycle = this.getImagesByName('oldlady_bended');
        this.unbendCycle = [...this.bendCycle].reverse();
        this.idleCycle = [this.exitDoorCycle[this.exitDoorCycle.length - 1]];
        this.isRobbed = false;
        this.isFear = false;
        this.isBend = false;
        this.isRaped = false;


        this.currentStash = null;

        this.inventory = {
            lossPoints: 3,
            points: 5,
            stash: [
                {
                    cash: 10,
                    balloon: this.getBalloon('only_got_10')
                },
                {
                    cash: 30,
                    balloon: this.getBalloon('only_got_30')
                }
            ]
        }
    }
    doIdleStreet() {
        if (this.currentCycle !== this.idleCycle) {
            this.setCurrentCycle(this.idleCycle);
        }
    }

    doBend() {
        if (this.currentCycle !== this.bendCycle) {
            this.setCurrentCycle(this.bendCycle, false);
        }
    }
    doUnbend() {
        if (this.currentCycle !== this.unbendCycle) {
            this.setCurrentCycle(this.unbendCycle, false);
        }
    }

    doExitDoor() {
        super.doExitDoor();
        if (this.isOutside && !this.currentStash) {
            this.currentStash = Utils.getRandomItem(this.inventory.stash);
        }
    }

    disable() {
        super.disable();
        this.isRobbed = false;
        this.isRaped = false;
        this.isFear = false;
        this.isBend = false;
        this.currentStash = null;
    }
}

OldLady.NAME = 'oldlady';