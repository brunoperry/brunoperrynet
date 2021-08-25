class Pimp extends Character {

    constructor(callback) {
        super(callback, Pimp.NAME);

        this.saluteCycle = this.getImagesByName('pimp_show');
        this.idleBrothelCycle = this.getImagesByName('pimp_idle');
        this.heroRapeCycle = this.getImagesByName('pimp_rape');
        this.hasSalute = false;
        this.hasRape = false;

        this.inventory = {
            lossPoints: 70
        }
    }

    doSalute() {
        if (this.currentCycle !== this.saluteCycle) {
            this.setCurrentCycle(this.saluteCycle, false);
        }
        this.hasSalute = this.tick === this.saluteCycle.length - 1;
    }
    doIdleBrothel() {
        if (this.currentCycle !== this.idleBrothelCycle) {
            this.setCurrentCycle(this.idleBrothelCycle, false);
        }
    }
    doHeroRape() {
        if (this.currentCycle !== this.heroRapeCycle) {
            this.setCurrentCycle(this.heroRapeCycle);
        }
    }

    disable() {
        super.disable();
        this.hasSalute = false;
        this.hasRape = false;
    }
}

Pimp.Actions = {


}

Pimp.NAME = 'pimp';