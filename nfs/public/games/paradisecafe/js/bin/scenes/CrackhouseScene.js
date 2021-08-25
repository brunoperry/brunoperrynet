class CrackhouseScene extends Scene {

    constructor(callback) {
        super(callback, CrackhouseScene.NAME);

        this.balloon = new Balloon();
        this.lightOn = Resources.getImage(`${CrackhouseScene.NAME}_light_on`)
        this.lightOff = Resources.getImage(`${CrackhouseScene.NAME}_light_off`)


        this.hero = new Hero();
        this.lighting = this.lightOff;

        this.swipeDoor = new SwipeDoor(() => { })
        this.props.push(this.swipeDoor);
        this.swipeDoor.index = this.props.length - 1;

        this.police = new Police(e => {
            if (e === Police.Actions.REACH_END_STREET) {
                this.changeNPC();
            }
        });
        this.NPCs.push(this.police);
        this.police.index = this.NPCs.length - 1;

        this.junkie = new Junkie(e => {
            if (Resources.PLAYER_INVENTORY.drugs === 0) {
                this.changeAction(CrackhouseScene.States.DRUGS_END)
            } else {
                this.changeNPC();
            }
        });
        this.NPCs.push(this.junkie);
        this.junkie.index = this.NPCs.length - 1;

        this.currentNPC = this.junkie;

        this.dealSuccess = false;
    }

    doDealing() {

        if (this.balloon.isDialog) {
            if (this.dealSuccess) {
                this.junkie.doGive();
            }
            return;
        }

        if (this.endAction) {
            if (this.currentNPC === this.police) this.callback(CrackhouseScene.States.FAIL);
            else {
                this.changeAction(CrackhouseScene.States.STREET);
            }
            this.dealSuccess = false;
            return;
        }

        if (this.hero.isDealing) {
            if (this.currentNPC === this.police) {
                this.balloon.doDialog([
                    this.police.getBalloon('selling_drugs'),
                    this.hero.getBalloon('no_officer'),
                    this.police.getBalloon('under_arrest')
                ]);
                this.endAction = true;
            } else {

                if (this.junkie.isWaiting) {
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
                        ])

                        Keyboard.onChange = e => {
                            if (e === Resources.labelsData.ACCEPT) {
                                this.hero.updateInventory({
                                    cash: this.junkie.currentDeal.cash,
                                    points: this.junkie.inventory.points,
                                    drugs: -1
                                });
                                this.balloon.doDialog(Balloon.EMPTY_BALLON);
                                this.dealSuccess = true;
                            } else {

                                this.balloon.doDialog(this.hero.getBalloon('too_cheap'))
                                this.hero.updateInventory({
                                    lossPoints: this.junkie.inventory.lossPoints
                                })
                                this.dealSuccess = false;
                            }
                            Keyboard.hide();
                            this.hero.isDealing = false;
                            this.endAction = true;
                        }
                    }
                    return;
                }
                const balloons = this.junkie.getDealDialog();
                this.balloon.doDialog(balloons[0], true, e => {
                    this.balloon.doDialog(balloons[1], false);
                    this.junkie.isWaiting = true;
                });

            }
            return;
        }

        if (Keyboard.isShown) {
            Keyboard.hide();
            Keyboard.hideExit();
        }

        this.currentNPC.doCrackhouseIdle();

        this.balloon.doDialog([
            this.hero.getBalloon('psst'),
            this.hero.getBalloon('want_drug')
        ]);
        this.hero.isDealing = true;
    }
    doDrugsEnd() {
        this.balloon.doDialog([
            this.hero.getBalloon('drugs_end')
        ])
        if (Keyboard.isShown) {
            Keyboard.hide();
        }
        this.junkie.disable();
    }
    doStreet() {

        if (!this.currentNPC.isEnabled) this.currentNPC.enable();
        this.currentNPC.doWalk();

        if (this.swipeDoor.isOpened) {
            if (this.currentNPC.x < 136 && this.currentNPC.x > 126) {
                this.changeAction(CrackhouseScene.States.DEALING)
            }
        }

        if (!Keyboard.isShown) {
            Keyboard.showExit(e => {
                Keyboard.hide();
                Keyboard.hideExit();
                this.hero.updateInventory({
                    cash: -CrackhouseScene.RENT_COST
                })
                this.callback(CrackhouseScene.States.SUCCESS);
            })
            Keyboard.show([
                {
                    text: Resources.labelsData.CLOSE,
                    action: Resources.labelsData.CLOSE
                }
            ])
            Keyboard.onChange = e => {

                if (e === Resources.labelsData.OPEN) {
                    this.changeAction(CrackhouseScene.States.OPENED);
                } else {
                    this.changeAction(CrackhouseScene.States.CLOSED);
                }
            }
        }

    }
    doSwipeOpen() {

        Keyboard.updateButtonText(Resources.labelsData.CLOSE, true);
        this.lighting = this.lightOn;
        this.doStreet();
        if (!this.swipeDoor.isOpened) {
            this.swipeDoor.doOpen();
            return;
        }
    }
    doSwipeClose(now = false) {

        Keyboard.updateButtonText(Resources.labelsData.OPEN, true);
        this.doStreet();
        if (this.swipeDoor.isOpened) {
            this.swipeDoor.doClose();
            return;
        }
        this.lighting = this.lightOff;
    }

    changeAction(action) {
        this.currentNPCIndex = null;
        switch (action) {
            case CrackhouseScene.States.STREET:
                this.currentAction = this.doStreet;
                break;
            case CrackhouseScene.States.OPENED:
                this.currentAction = this.doSwipeOpen;
                break;
            case CrackhouseScene.States.CLOSED:
                this.currentAction = this.doSwipeClose;
                break;
            case CrackhouseScene.States.DEALING:
                this.currentAction = this.doDealing;
                break;
            case CrackhouseScene.States.DRUGS_END:
                this.currentAction = this.doDrugsEnd;
                break;
        }
        this.endAction = false;
    }
    changeNPC() {
        this.currentNPC = Utils.getRandomItem([
            this.junkie,
            this.police
        ]);
    }

    update(delta) {
        this.currentAction();
        this.swipeDoor.update();

        if (this.currentNPC) this.currentNPC.update();
        super.update(delta);
    }

    enable() {
        super.enable();
        this.swipeDoor.enable();
        HUD.hiScoresEnabled = true;

        this.swipeDoor.doClose(true);
        this.currentAction = this.doSwipeClose;

        Keyboard.showExit(e => {
            Keyboard.hide();
            Keyboard.hideExit();
            this.hero.updateInventory({
                cash: -CrackhouseScene.RENT_COST
            })
            this.callback(CrackhouseScene.States.SUCCESS);
        })
        if (!Keyboard.isShown) {
            Keyboard.show([
                {
                    text: Resources.labelsData.OPEN,
                    action: Resources.labelsData.OPEN
                }
            ])
            Keyboard.onChange = e => {

                if (e === Resources.labelsData.OPEN) {
                    this.changeAction(CrackhouseScene.States.OPENED);
                } else {
                    this.changeAction(CrackhouseScene.States.CLOSED);
                }
            }
        }
    }
    disable() {
        super.disable();
        this.swipeDoor.disable();
        this.junkie.disable();
        this.police.disable();
        this.currentAction = null;
        this.endAction = false;
    }
}

CrackhouseScene.States = {
    OPENED: 'crackhousestatesopened',
    CLOSED: 'crackhousestatesclosed',
    DEALING: 'crackhousestatesdealing',
    SUCCESS: 'crackhousestatessuccess',
    FAIL: 'crackhousestatesfail',
    STREET: 'crackhousestatesstreet',
    DRUGS_END: 'crackhousestatesdrugsend'
}
CrackhouseScene.RENT_COST = 200;
CrackhouseScene.NAME = 'crackhouse';