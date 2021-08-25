class Waiter extends Character {
    constructor(callback) {
        super(callback, Waiter.NAME);

        this.serveClycle = this.getImagesByName('serve');
        this.showBillClycle = this.getImagesByName('show03');
        this.hasServed = false;

        this.inventory = {
            drink_value: null
        }
    }

    doServe() {

        if (this.currentCycle !== this.serveClycle) {
            this.setCurrentCycle(this.serveClycle, false);
        }

        this.hasServed = this.tick === this.serveClycle.length - 1;
        if (this.hasServed) {
            this.inventory.drink_value = Utils.getRandomItem([
                10,
                5,
                20,
                3,
                5
            ])
        }
    }
    doShowBill() {
        if (this.currentCycle !== this.showBillClycle) {
            this.setCurrentCycle(this.showBillClycle, false);
        }
    }
    doShow() {
        this.doExitDoor();
    }
    doHide() {
        this.doEnterDoor();
    }

    enable() {
        super.enable();
    }
    disable() {
        const cCycle = this.currentCycle;
        super.disable();
        this.hasServed = false;
        this.inventory = {
            drink_value: null
        }
        this.currentCycle = cCycle;
    }
}

Waiter.NAME = 'waiter';
Waiter.States = {
    SERVE: 'waiterstatesserve'
}