class Hero extends Character {

    constructor(callback) {
        super(callback, Hero.NAME);

        this.walkCycle = this.getImagesByName('hero_walk');
        this.idleStreetCycle = this.getImagesByName('hero_idle_street');
        this.idleBrothelCycle = this.getImagesByName('hero_idle_brothel')[0];
        this.enterDoorCycle = this.getImagesByName('hero_enter_door');
        this.robScoutCycle = this.getImagesByName('hero_rob_scout');
        this.pullGunCycle = this.getImagesByName('hero_idle_gun');
        this.showDocsCycle = this.getImagesByName('hero_show_docs');
        this.blowjobCycle = this.getImagesByName('hero_blowjob');
        this.sexCycle = this.getImagesByName('hero_sex');
        this.analCycle = this.getImagesByName('hero_anal');


        const rCycle = this.getImagesByName('hero_rape');
        this.undressCycle = [rCycle[0], rCycle[1]];
        this.dressCycle = [...this.undressCycle].reverse();
        this.oldLadyapeCycle = [rCycle[2], rCycle[3]];
        this.pimpRapeCycle = this.getImagesByName('hero_bend');

        this.idleParadiseCafeCycle = this.getImagesByName('hero_idle_cafe');
        this.drinkCycle = this.getImagesByName('hero_drink');

        this.moanBalloons = [
            this.getBalloon('aaa'),
            this.getBalloon('suck_it_all'),
            this.getBalloon('im_coming'),
            this.getBalloon('so_good')
        ]

        this.isDone = false;
        this.hasdrink = false;
        this.isDealing = false;
        this.isUndressed = false;
        this.animationTime = null;
        this.currentState = null;
    }

    doShowDocs() {
        if (this.currentCycle !== this.showDocsCycle) {
            this.setCurrentCycle(this.showDocsCycle, false);
        }
    }
    doUndress() {
        if (this.currentCycle !== this.undressCycle) {
            this.setCurrentCycle(this.undressCycle, false);
        }
        this.isUndressed = this.tick === this.currentCycle.length - 1;
    }
    doDress() {
        if (this.currentCycle !== this.dressCycle) {
            this.setCurrentCycle(this.dressCycle, false);
        }
        this.isUndressed = this.tick === this.currentCycle.length - 1;
    }
    doOldLadyRape() {
        if (this.currentCycle !== this.oldLadyapeCycle) {
            this.setCurrentCycle(this.oldLadyapeCycle);
        }
    }
    doPimpRape() {
        if (this.currentCycle !== this.pimpRapeCycle) {
            this.setCurrentCycle(this.pimpRapeCycle);
        }
    }
    doBlowjob() {
        if (this.currentCycle !== [this.blowjobCycle[1]]) {
            this.setCurrentCycle([this.blowjobCycle[1]], false);
        }
    }
    doSex() {
        if (this.currentCycle !== this.sexCycle) {
            this.setCurrentCycle(this.sexCycle);
        }
    }
    doAnal() {
        if (this.currentCycle !== this.analCycle) {
            this.setCurrentCycle(this.analCycle);
        }
    }
    doRobOldLady() {
        if (this.currentCycle !== this.pullGunCycle) {
            this.setCurrentCycle(this.pullGunCycle, false);
        }
    }
    doRobScout() {
        if (this.currentCycle !== this.robScoutCycle) {
            this.setCurrentCycle(this.robScoutCycle, false);
        }
        this.isDone = this.tick === this.currentCycle.length - 1;
    }
    doWalk() {
        if (this.currentCycle !== this.walkCycle) {
            this.isDone = false;
            this.isUndressed = false;
            this.setCurrentCycle(this.walkCycle);
        }
        this.isOutside = true;
    }
    doIdleBrothel() {

        if (this.currentCycle !== this.idleBrothelCycle) {
            this.setCurrentCycle([this.idleBrothelCycle], false);
        }
    }
    doIdleStreet(dir = 1) {
        if (this.currentCycle !== this.idleStreetCycle) {
            this.setCurrentCycle([this.idleStreetCycle[dir]], false);
        }
        this.isOutside = this.tick === this.currentCycle.length - 1;
    }
    doIdleParadiseCafe() {

        if (this.currentCycle !== this.idleParadiseCafeCycle) {
            this.setCurrentCycle(this.idleParadiseCafeCycle, false);
        }
    }
    doParadiseCafeDrink() {
        if (this.currentCycle !== this.drinkCycle) {
            this.setCurrentCycle(this.drinkCycle, false);
        }

        if (this.tick === this.drinkCycle.length - 1) {
            this.currentState = Hero.States.IDLE_PARADISE_CAFE;
        }
    }
    doEnterDoor() {

        if (this.currentCycle !== this.enterDoorCycle) {
            this.setCurrentCycle(this.enterDoorCycle, false);
        }
        this.isOutside = this.tick < this.currentCycle.length - 1;
    }
    doExitDoor() {

    }

    getAnimationTime() {
        return (Date.now() - this.animationTime) / Hero.Constants.ANIM_TIMEOUT;
    }

    updateInventory(data) {

        if (data.points) Resources.PLAYER_INVENTORY.points += data.points;
        if (data.lossPoints) Resources.PLAYER_INVENTORY.points -= data.lossPoints;
        if (data.cash) Resources.PLAYER_INVENTORY.cash += data.cash;
        if (data.wallet === false) {
            Resources.PLAYER_INVENTORY.wallet = false;
            Resources.PLAYER_INVENTORY.cash = 0;
        }
        else if (data.wallet === true) Resources.PLAYER_INVENTORY.wallet = true;
        if (data.gun === true) Resources.PLAYER_INVENTORY.gun = true;
        if (data.drugs) Resources.PLAYER_INVENTORY.drugs += data.drugs;

        if (data.expense) Resources.PLAYER_INVENTORY.expense += data.expense;

        if (Resources.PLAYER_INVENTORY.cash < 0) Resources.PLAYER_INVENTORY.cash = 0;
        if (Resources.PLAYER_INVENTORY.drugs < 0) Resources.PLAYER_INVENTORY.drugs = 0;

    }

    disable() {
        super.disable();
        this.isDone = false;
        this.isUndressed = false;
        this.animationTime = null;
        this.currentState = null;
        this.hasdrink = false;
        this.isDealing = false;
    }
}
Hero.States = {
    IDLE_STREET: 'herostateidlestreet',
    IDLE_PARADISE_CAFE: 'herostateidleparadisecafe',
    WALK_CYCLE: 'herostatewalkcycle',
    PARADISE_CAFE_DRINKING: 'herostateparadisecafedrinking',

}
Hero.Constants = {
    ANIM_TIMEOUT: 3000
}
Hero.NAME = 'hero';