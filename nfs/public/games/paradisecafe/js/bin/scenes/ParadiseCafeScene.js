class ParadiseCafeScene extends Scene {

    constructor(callback) {
        super(callback, ParadiseCafeScene.NAME);

        this.balloon = new Balloon();

        this.hero = new Hero();

        this.waiter = new Waiter();
        this.NPCs.push(this.waiter);
        this.waiter.index = this.NPCs.length - 1;
        this.dealer = new Dealer();
        this.NPCs.push(this.dealer);
        this.dealer.index = this.NPCs.length - 1;
    }

    doIdle() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {

            if (Keyboard.exitEnabled) {
                Keyboard.hideExit();
            }

            if (!this.waiter.isEnabled) this.waiter.enable();
            if (!this.waiter.isOutside) {
                this.waiter.doShow();
                return;
            }

            if (Resources.PLAYER_INVENTORY.cash < Resources.PLAYER_INVENTORY.expense) {
                this.waiter.doShowBill();
                this.balloon.doDialog([
                    this.waiter.getBalloon('your_bill'),
                    this.hero.getBalloon('hero_no_cash_cafe'),
                    this.waiter.getBalloon('wait_there')
                ], true, () => {
                    this.callback(JailScene.NAME);
                })
            } else {
                this.waiter.doShowBill();
                this.balloon.doDialog(this.waiter.getBalloon('your_bill'), false);
                if (!Keyboard.isShown) {
                    Keyboard.show([
                        {
                            text: Resources.labelsData.PAY,
                            action: Resources.labelsData.PAY
                        }
                    ]);
                    Keyboard.onChange = e => {
                        this.hero.updateInventory({
                            cash: -Resources.PLAYER_INVENTORY.expense
                        });
                        Keyboard.hide();
                        Keyboard.hideExit();
                        this.callback(StreetScene.NAME);
                    }
                }
            }
            return;
        }

        if (!Keyboard.isExitShown) {
            Keyboard.showExit(e => {
                this.endAction = true;
            });
        }

        if (ParadiseCafeScene.IDLE_TICK === ParadiseCafeScene.IDLE_TIMEOUT) {
            if (this.hero.hasDrink) {
                this.hero.currentState = Hero.States.PARADISE_CAFE_DRINKING;
                this.changeAction(this.hero.currentState);
            } else {
                this.changeAction(Utils.getRandomItem([
                    Dealer.States.DEAL,
                    Waiter.States.SERVE,
                    Dealer.States.DEAL
                ]));
            }
            ParadiseCafeScene.IDLE_TICK = 0;
        } else {
            this.hero.doIdleParadiseCafe();
            ParadiseCafeScene.IDLE_TICK++;
        }
    }
    doDeal() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {

            if (this.dealer.isOutside) {
                this.dealer.doHide();
                return;
            }

            if (this.dealer.currentDeal.status) {
                switch (this.dealer.currentDeal.dealType) {
                    case 'sell_wallet':
                        this.hero.updateInventory({
                            wallet: true,
                            cash: -this.dealer.currentDeal.value
                        })
                        break;
                    case 'sell_gun':
                        this.hero.updateInventory({
                            gun: true,
                            cash: -this.dealer.currentDeal.value
                        })
                        break;
                    case 'sell':
                        if (Resources.PLAYER_INVENTORY.cash > this.dealer.currentDeal.value) {
                            this.hero.updateInventory({
                                drugs: + 1,
                                cash: -this.dealer.currentDeal.value
                            })
                        }
                        break;
                    case 'buy':
                        this.hero.updateInventory({
                            drugs: -1,
                            cash: this.dealer.currentDeal.value
                        })
                        break;
                }
            }

            this.changeAction(Hero.States.IDLE_PARADISE_CAFE);
            return;
        }

        if (!this.dealer.isEnabled) this.dealer.enable();

        if (!this.dealer.isOutside) {
            this.dealer.doShow();
            return;
        }

        if (!this.dealer.hasDeal) {
            this.dealer.getDeal(Resources.PLAYER_INVENTORY.wallet, Resources.PLAYER_INVENTORY.gun, Resources.PLAYER_INVENTORY.drugs);
            this.balloon.doDialog(this.dealer.currentDeal.offerBalloon)
        } else {


            if (this.dealer.currentDeal.value < Resources.PLAYER_INVENTORY.cash) {
                this.balloon.doDialog(this.dealer.currentDeal.valueBalloon, false);
                if (!Keyboard.isShown) {
                    Keyboard.show([
                        {
                            text: Resources.labelsData.ACCEPT,
                            action: Resources.labelsData.ACCEPT
                        },
                        {
                            text: Resources.labelsData.REFUSE,
                            action: Resources.labelsData.REFUSE
                        }
                    ]);

                    Keyboard.onChange = e => {
                        if (e === Resources.labelsData.ACCEPT) {
                            this.dealer.currentDeal.status = true;
                            this.balloon.doDialog(this.hero.getBalloon('hero_accept'));
                            this.hero.updateInventory({
                                points: this.dealer.inventory.points
                            })
                        } else {
                            this.balloon.doDialog(this.hero.getBalloon('hero_refuse'));
                            this.hero.updateInventory({
                                lossPoints: this.dealer.inventory.lossPoints
                            })
                        }
                        this.endAction = true;
                        Keyboard.hide();
                    }
                }
            } else {
                this.balloon.doDialog([
                    this.dealer.currentDeal.valueBalloon,
                    this.hero.getBalloon('hero_no_cash_cafe')
                ])
                this.endAction = true;
            }
        }
    }
    doServe() {

        if (this.balloon.isDialog) return;

        if (!this.waiter.isEnabled) this.waiter.enable();

        if (this.waiter.hasServed) {
            if (this.waiter.isOutside) {
                this.waiter.doHide();
            } else {
                this.hero.hasDrink = true;
                this.waiter.hasServed = false;
                this.hero.updateInventory({
                    expense: this.waiter.inventory.drink_value
                })
                this.changeAction(Hero.States.IDLE_PARADISE_CAFE);
            }
            return;
        }

        if (!this.waiter.isOutside) {
            this.waiter.doShow();
            return;
        }

        if (!this.waiter.hasServed) {
            this.waiter.doServe();
            this.balloon.doDialog(Balloon.EMPTY_BALLON);
        }
    }
    doDrink() {

        if (this.balloon.isDialog) return;

        if (this.hero.currentState === Hero.States.PARADISE_CAFE_DRINKING) {
            this.hero.doParadiseCafeDrink();
        } else {
            this.changeAction(this.hero.currentState);
            this.hero.hasDrink = false;
        }
    }

    changeAction(action) {

        if (Keyboard.isExitShown) {
            Keyboard.hideExit();
        }

        this.NPCs.forEach(npc => npc.disable());
        switch (action) {
            case Hero.States.IDLE_PARADISE_CAFE:
                this.currentNPCIndex = null;
                this.currentAction = this.doIdle;
                break;
            case Hero.States.PARADISE_CAFE_DRINKING:
                this.currentNPCIndex = null;
                this.currentAction = this.doDrink;
                break;
            case Dealer.States.DEAL:
                this.currentNPCIndex = null;
                this.currentAction = this.doDeal;
                break;
            case Waiter.States.SERVE:
                this.currentNPCIndex = null;
                this.currentAction = this.doServe;
                break;
        }
        this.endAction = false;
    }
    update(delta) {
        this.currentAction();
        this.hero.update();
        this.background.updateTimed();

        this.NPCs.forEach(npc => {
            if (npc.isEnabled) npc.update();
        });
        super.update(delta);
    }

    enable() {
        super.enable();
        this.hero.enable();
        this.hero.currentState = Hero.States.IDLE_PARADISE_CAFE;
        this.changeAction(this.hero.currentState);
        HUD.hiScoresEnabled = false;
        Resources.PLAYER_INVENTORY.expense = 2;
        Keyboard.exitEnabled = true;
    }
    disable() {
        super.disable();
        this.hero.disable();
        this.waiter.disable();
        this.dealer.disable();
        this.currentAction = null;
        this.balloon.clear();
        this.endAction = false;
        ParadiseCafeScene.IDLE_TICK = 2;
        Resources.PLAYER_INVENTORY.expense = null;
        Keyboard.exitEnabled = false;
    }

}

ParadiseCafeScene.NAME = 'paradisecafe';
ParadiseCafeScene.IDLE_TIMEOUT = 50;
ParadiseCafeScene.IDLE_TICK = 0;