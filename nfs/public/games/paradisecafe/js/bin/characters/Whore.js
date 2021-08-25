class Whore extends Character {

    constructor(callback) {
        super(callback, Whore.NAME);

        this.exitDoorCycle = this.getImagesByName('whore_show');
        this.idleStreetCycle = [this.exitDoorCycle[this.exitDoorCycle.length - 1]];
        this.idleBrothelCycle = this.getImagesByName('idle_brothel')[0];
        this.enterDoorCycle = [...this.exitDoorCycle].reverse();

        this.blowjobCycle = this.getImagesByName('whore_blowjob')
        this.sexCycle = this.getImagesByName('whore_sex')
        this.analCycle = this.getImagesByName('whore_anal')

        this.isAccepted = false;
        this.currentService = null;

        this.inventory = {
            lossPoints: 3,
            points: 50,
            stash: [
                {
                    value: 20,
                    balloon: this.getBalloon('whore_cost_20')
                },
                {
                    value: 40,
                    balloon: this.getBalloon('whore_cost_40')
                },
                {
                    value: 80,
                    balloon: this.getBalloon('whore_cost_80')
                },
                {
                    value: 160,
                    balloon: this.getBalloon('whore_cost_80')
                }
            ]
        }
        this.animationTime = null;
    }

    doBlowjob() {
        if (this.currentCycle !== this.blowjobCycle) {
            this.setCurrentCycle(this.blowjobCycle);
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
    doIdleBrothel() {
        if (this.currentCycle !== this.idleBrothelCycle) {
            this.setCurrentCycle([this.idleBrothelCycle], false);
        }
    }
    doIdleStreet() {
        if (this.currentCycle !== this.idleStreetCycle) {
            this.setCurrentCycle([this.idleStreetCycle[dir]], false);
        }
        this.isOutside = this.tick === this.currentCycle.length - 1;
    }

    setService(serviceName = null) {
        let srv;
        switch (serviceName) {
            case Whore.Actions.ORAL:
                srv = this.inventory.stash[0];
                break;
            case Whore.Actions.SEX:
                srv = this.inventory.stash[1];
                break;
            case Whore.Actions.ANAL:
                srv = Utils.getRandomItem([
                    this.inventory.stash[2],
                    this.inventory.stash[3]
                ])
                break;
        }
        this.currentService = srv;
        this.currentService.name = serviceName;
    }

    disable() {
        super.disable();
        this.isAccepted = false;
        this.currentService = null;
    }
}
Whore.Actions = {
    ORAL: 'whoreactionsoral',
    SEX: 'whoreactionssex',
    ANAL: 'whoreactionsanal',
}
Whore.ACTION_TIMEOUT = 5;

Whore.NAME = 'whore';