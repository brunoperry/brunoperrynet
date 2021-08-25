class Police extends Character {

    constructor(callback) {
        super(callback, Police.NAME);

        this.askPapersCycle = this.getImagesByName('action');
        this.walkCycle = this.getImagesByName('walk');
        this.idleCrackhouseCycle = this.getImagesByName('idle_crackhouse')
        this.isAskDocs = false;
        this.hasArrest = false;

        this.walkTick = 0;

        this.inventory = {
            points: 1,
            lossPoints: 50
        }
    }
    doCrackhouseIdle() {
        if (this.currentCycle !== this.idleCrackhouseCycle) {
            this.setCurrentCycle(this.idleCrackhouseCycle, false);
        }
    }

    doWalk() {
        if (this.currentCycle !== this.walkCycle) {
            this.setCurrentCycle(this.walkCycle, true);
        }
        this.x = this.canvasW - this.walkTick * 5;

        if (this.x < -this.width) {
            this.callback(Police.Actions.REACH_END_STREET)
            this.walkTick = 0;
        }
        this.walkTick++;
    }

    doAskDocs() {
        if (this.currentCycle !== this.askPapersCycle) {
            this.setCurrentCycle(this.askPapersCycle, false);
        }
        this.isAskDocs = true;
    }

    doExitDoor() {
        super.doExitDoor();
        if (this.isOutside) this.currentAction = Utils.getRandomItem([
            Police.Actions.ASK_PAPERS,
            Police.Actions.SALUTE,
            Police.Actions.SALUTE
        ])
    }
    doEnterDoor() {
        super.doEnterDoor();
        if (!this.isOutside) {
            this.currentAction = null;
            this.isAskDocs = false;
        }
    }
    moveTo(x, y = null) {
        super.moveTo(x);
        this.walkTick = 0;
    }

    disable() {
        super.disable();
        this.doShowPapers = false;
        this.walkTick = 0;
        this.x = 0;
    }
}

Police.Actions = {
    ASK_PAPERS: 'policeactionsaskpapers',
    SALUTE: 'policeactiosnsalute',
    REACH_END_STREET: 'policeactiosnreachendstreet'
}

Police.NAME = 'police';