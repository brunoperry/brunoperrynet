class Scout extends Character {

    constructor(callback) {
        super(callback, Scout.NAME);

        this.exitDoorCycle = this.getImagesByName('scout_show');
        this.enterDoorCycle = this.getImagesByName('scout_hide');
        this.saluteCycle = this.getImagesByName('scout_salute');
        this.fearCycle = this.getImagesByName('scout_fear');

        this.isSalute = false;
        this.isFear = false;
        this.isRobbed = false;
        this.currentStash = null;

        this.inventory = {
            lossPoints: 1,
            points: 2,
            stash: [
                {
                    cash: 10,
                    balloon: this.getBalloon('only_got_10')
                },
                {
                    cash: 0,
                    balloon: this.getBalloon('only_got_cookies')
                },
                {
                    cash: 20,
                    balloon: this.getBalloon('only_got_20')
                },
                {
                    cash: 50,
                    balloon: this.getBalloon('only_got_50')
                }
            ]
        }
    }

    doSalute() {
        if (this.currentCycle !== this.saluteCycle) {
            this.setCurrentCycle(this.saluteCycle, false);
        }
        this.isSalute = this.tick === this.currentCycle.length - 1;
    }
    doIdleFear() {
        if (this.currentCycle !== this.fearCycle) {
            this.setCurrentCycle(this.fearCycle, false);
        }
        this.isFear = this.tick === this.currentCycle.length - 1;
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
        if (this.isOutside && !this.currentStash) {
            this.currentStash = Utils.getRandomItem(this.inventory.stash);
        }
    }

    disable() {
        super.disable();
        this.isSalute = false;
        this.isFear = false;
        this.isRobbed = false;
        this.currentStash = null;
    }
}

Scout.NAME = 'scout';
Scout.STASH = 'scout';