class Junkie extends Character {
    constructor(callback) {
        super(callback, Junkie.NAME);

        this.walkCycle = this.getImagesByName('walk');
        this.idleCrackhouseCycle = this.getImagesByName('idle_crackhouse');
        this.giveCycle = this.getImagesByName('give');
        this.giveCycle = Utils.clearItemsFrom(this.giveCycle, 'balloons');
        this.walkTick = 0;

        this.isWaiting = false;
        this.currentDeal = null;

        this.inventory = {
            points: 3,
            lossPoints: 4,
            answers: [
                this.getImagesByName('balloons_junkie_alright')[0],
                this.getImagesByName('balloons_junkie_hangover')[0]
            ],
            deals: [
                {
                    cash: 140,
                    balloon: this.getImagesByName('balloons_junkie_give_me_140')[0]
                },
                {
                    cash: 150,
                    balloon: this.getImagesByName('balloons_junkie_give_me_150')[0]
                },
                {
                    cash: 200,
                    balloon: this.getImagesByName('balloons_junkie_give_me_200')[0]
                }
            ]
        }
    }
    doCrackhouseIdle() {
        if (this.currentCycle !== this.idleCrackhouseCycle) {
            this.setCurrentCycle(this.idleCrackhouseCycle, false);
        }
    }
    doGive() {

        console.log(this.width)
        if (this.currentCycle !== this.giveCycle) {
            this.setCurrentCycle(this.giveCycle, false);
        }
    }
    doWalk() {
        if (this.currentCycle !== this.walkCycle) {
            this.setCurrentCycle(this.walkCycle, true);
        }
        this.x = this.canvasW - this.walkTick * 5;

        if (this.x < -this.width) {
            this.isWaiting = false;
            this.isDone = false;
            this.currentDeal = null;
            this.walkTick = 0;
            this.callback(Junkie.Actions.REACH_END_STREET);
        }
        this.walkTick++;
    }

    getDealDialog() {
        this.currentDeal = Utils.getRandomItem(this.inventory.deals);
        return [
            Utils.getRandomItem(this.inventory.answers),
            this.currentDeal.balloon
        ]
    }

    moveTo(x, y = null) {
        super.moveTo(x);
        this.walkTick = 0;
    }

    disable() {
        super.disable();
        this.walkTick = 0;
        this.currentDeal = null;
        this.isWaiting = false;
        this.isDone = false;
        this.currentDeal = null;
    }
}
Junkie.Actions = {
    REACH_END_STREET: 'junkieactiosnreachendstreet'
}

Junkie.NAME = 'junkie';