class Thief extends Character {

    constructor(callback) {
        super(callback, Thief.NAME);

        this.exitDoorCycle = this.getImagesByName('thief_show');
        this.enterDoorCycle = this.getImagesByName('thief_hide');
        this.showGunCycle = this.getImagesByName('thief_gun');
        this.hurtCycle = this.getImagesByName('thief_hurt');

        this.isHurted = false;

        this.inventory = {
            lossPoints: 3,
            points: 4
        }

        this.animationTime = null;
    }

    doIdle() {
        if (this.currentCycle !== this.idleStreetCycle) {
            this.setCurrentCycle([this.idleStreetCycle[dir]], false);
        }
        this.isOutside = this.tick === this.currentCycle.length - 1;
    }
    doEnterDoor() {
        if (this.currentCycle !== this.enterDoorCycle) {
            this.setCurrentCycle(this.enterDoorCycle, false);
        }
        this.isOutside = this.tick === this.currentCycle.length - 1;
        if (!this.isOutside) {
            this.isHurted = false;

        }
    }
    doExitDoor() {
        if (this.currentCycle !== this.exitDoorCycle) {
            this.setCurrentCycle(this.exitDoorCycle, false);
        }
        this.isOutside = this.tick === this.currentCycle.length - 1;
        if (this.isOutside && !this.currentAction) {
            this.currentAction = Utils.getRandomItem([
                Thief.Actions.ASK_LIGHT,
                Thief.Actions.ROB,
                Thief.Actions.ASK_LIGHT
            ]);
        }
    }
    doShowGun() {
        if (this.currentCycle !== this.showGunCycle) {
            this.setCurrentCycle(this.showGunCycle, false);
        }
    }
    doHurt() {
        if (this.currentCycle !== this.hurtCycle) {
            this.setCurrentCycle(this.hurtCycle, false);
        }

        if (this.tick === this.currentCycle.length - 1) {
            this.isHurted = true;
        }
    }
}
Thief.Actions = {
    ASK_LIGHT: 'thiefactionsasklight',
    ROB: 'thiefactionsrob',
    HURT: 'thiefactionshurt'
}
Thief.ACTION_TIMEOUT = 5;

Thief.NAME = 'thief';