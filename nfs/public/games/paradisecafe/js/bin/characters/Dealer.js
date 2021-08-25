class Dealer extends Character {
    constructor(callback) {
        super(callback, Dealer.NAME);

        this.hasDeal = false;

        this.deals = {
            offers: {
                drugs: [
                    {
                        balloon: this.getImagesByName('dealer_got_lsd')
                    },
                    {
                        balloon: this.getImagesByName('dealer_got_weed')
                    }
                ],
                wallet: {
                    balloon: this.getImagesByName('dealer_got_wallet')
                },
                gun: {
                    balloon: this.getImagesByName('dealer_got_gun')
                }
            },
            sell_values: [
                {
                    value: 20,
                    balloon: this.getImagesByName('dealer_accept_20')
                },
                {
                    value: 30,
                    balloon: this.getImagesByName('dealer_accept_30')
                },
                {
                    value: 40,
                    balloon: this.getImagesByName('dealer_accept_40')
                },
                {
                    value: 50,
                    balloon: this.getImagesByName('dealer_accept_50')
                }
            ],
            buy_values: [
                {
                    value: 20,
                    balloon: this.getImagesByName('dealer_offer_20')
                },
                {
                    value: 40,
                    balloon: this.getImagesByName('dealer_offer_40')
                },
                {
                    value: 50,
                    balloon: this.getImagesByName('dealer_offer_50')
                },
                {
                    value: 100,
                    balloon: this.getImagesByName('dealer_offer_100')
                }
            ]
        }

        this.inventory = {
            points: 2,
            lossPoints: 2
        }
        this.currentDeal = null;
    }

    getDeal(wallet = true, gun = false, drugs = null) {

        this.currentDeal = {
            type: null,
            dealType: null,
            offerBalloon: null,
            valueBalloon: null,
            value: null
        }

        let res;
        if (!wallet) {
            this.currentDeal.dealType = 'sell_wallet';
            this.currentDeal.type = Dealer.States.DEALING_WALLET;
            this.currentDeal.offerBalloon = this.getImagesByName('dealer_got_wallet')[0];
            res = Utils.getRandomItem(this.deals.sell_values);

        } else if (!gun) {
            this.currentDeal.dealType = 'sell_gun';
            this.currentDeal.type = Dealer.States.DEALING_GUN;
            this.currentDeal.offerBalloon = this.getImagesByName('dealer_got_gun')[0];
            res = Utils.getRandomItem(this.deals.sell_values);
        } else {
            this.currentDeal.type = Dealer.States.DEALING_DRUGS;

            let isBuy;
            if (drugs === null || drugs === 0) {
                isBuy = false;
            } else {
                isBuy = Utils.getRandomTrueFalse();
            }
            if (isBuy) {
                this.currentDeal.dealType = 'buy';
                this.currentDeal.offerBalloon = this.getImagesByName('know_you_got_drugs')[0];
                res = Utils.getRandomItem(this.deals.buy_values);
            } else {
                this.currentDeal.dealType = 'sell';
                res = Utils.getRandomItem(this.deals.offers.drugs)
                this.currentDeal.offerBalloon = res.balloon[0];
                res = Utils.getRandomItem(this.deals.sell_values);
            }
        }
        this.currentDeal.valueBalloon = res.balloon[0];
        this.currentDeal.value = res.value;

        this.hasDeal = true;
        return this.currentDeal;
    }

    doShow() {
        this.doExitDoor();
    }
    doHide() {
        this.doEnterDoor();
        if (this.tick === this.currentCycle.length - 1) {
            console.log('dealer is hidden');
            this.hasDeal = false;
        }
    }

    enable() {
        super.enable();
    }
    disable() {
        super.disable();
        this.hasDeal = false;
        this.currentDeal = null;
    }
}

Dealer.States = {
    DEALING_DRUGS: 'dealerstatesdealingdrugs',
    DEALING_WALLET: 'dealerstatesdealingwallet',
    DEALING_GUN: 'dealerstatesdealinggun',
    ASKING_DRUGS: 'dealerstatesdealingaskdrugs'
}
Dealer.NAME = 'dealer';