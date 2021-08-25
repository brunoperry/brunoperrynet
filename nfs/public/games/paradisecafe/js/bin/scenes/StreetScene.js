class StreetScene extends Scene {

    constructor(callback) {
        super(callback, StreetScene.NAME);

        this.balloon = new Balloon();

        this.hero = new Hero();

        this.door = new Door()
        this.props.push(this.door);
        this.door.index = this.props.length - 1;

        this.thief = new Thief();
        this.NPCs.push(this.thief);
        this.thief.index = this.NPCs.length - 1;

        this.whore = new Whore();
        this.NPCs.push(this.whore);
        this.whore.index = this.NPCs.length - 1;

        this.scout = new Scout();
        this.NPCs.push(this.scout);
        this.scout.index = this.NPCs.length - 1;

        this.oldLady = new OldLady();
        this.NPCs.push(this.oldLady);
        this.oldLady.index = this.NPCs.length - 1;

        this.police = new Police();
        this.NPCs.push(this.police);
        this.police.index = this.NPCs.length - 1;


        this.currentAction = null;
        this.endAction = false;

        this.changeAction(Door.Actions.SCROLL);
    }

    doPolice() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {

            if (this.police.hasArrest) {
                this.callback(JailScene.NAME);
                return;
            }

            if (this.police.isOutside) {
                this.police.doEnterDoor();
                return;
            }

            this.police.disable();
            if (this.door.isOpened) {
                this.door.doCloseDoor();
                return;
            }

            this.changeAction(Door.Actions.SCROLL);
            return;
        }

        this.hero.doIdleStreet();

        if (!this.door.isOpened) {
            this.door.doOpenDoor();
            return;
        }

        if (!this.police.isOutside) {
            if (!this.police.isEnabled) this.police.enable();
            this.police.doExitDoor();
            return;
        }

        if (this.police.isAskDocs) {
            if (Resources.PLAYER_INVENTORY.wallet) {
                this.hero.doShowDocs();
                this.balloon.doDialog([
                    Balloon.EMPTY_BALLON,
                    this.police.getBalloon('ok_you_can_go')
                ]);
                this.police.isAskDocs = false;
            } else {
                this.balloon.doDialog([
                    this.hero.getBalloon('no_wallet'),
                    this.police.getBalloon('come_with_me')
                ])
                this.hero.doIdleStreet(0);
                this.police.hasArrest = true;
            }
            this.endAction = true;

            return;
        }

        if (this.police.currentAction === Police.Actions.ASK_PAPERS) {
            this.balloon.doDialog(this.police.getBalloon('ask_docs'))
            this.police.doAskDocs();
            this.hero.doIdleStreet(0);
        } else {
            this.balloon.doDialog([
                this.police.getBalloon('salute'),
                this.hero.getBalloon('everything_fine')
            ])
            this.endAction = true;
        }
    }
    doOldLady() {

        if (this.balloon.isDialog) {
            if (this.hero.isUndressed) {
                this.hero.doOldLadyRape();
            }
            return;
        }

        if (this.endAction) {

            if (this.oldLady.isRobbed) {
                this.hero.updateInventory({
                    points: this.oldLady.inventory.points,
                    cash: this.oldLady.currentStash.cash
                })
                this.oldLady.isRobbed = false;
            } else if (this.oldLady.isRaped) {
                this.hero.updateInventory({
                    points: this.oldLady.inventory.points
                })
                this.oldLady.isRaped = false;
                this.hero.isDone = false;
            } else {
            }

            if (this.oldLady.isOutside) {
                this.oldLady.doEnterDoor();
                return;
            }

            this.hero.doIdleStreet(0);
            if (this.door.isOpened) {
                this.oldLady.disable();
                this.door.doCloseDoor();
                return;
            }

            this.changeAction(Door.Actions.SCROLL);

            return;
        }

        if (!this.door.isOpened) {
            this.hero.doIdleStreet(0);
            this.door.doOpenDoor();
            return;
        }

        if (!this.oldLady.isOutside) {
            if (!this.oldLady.isEnabled) this.oldLady.enable();
            this.oldLady.doExitDoor();
            return;
        }

        if (this.oldLady.isRobbed) {

            this.hero.doRobOldLady();

            this.balloon.doDialog([
                this.hero.getBalloon('this_is_a_robbery'),
                this.oldLady.getBalloon('ho_my_god'),
                this.oldLady.currentStash.balloon
            ]);
            this.endAction = true;
            return;
        } else if (this.oldLady.isRaped) {

            if (!this.oldLady.isFear) {

                this.hero.doRobOldLady();

                this.balloon.doDialog([
                    this.hero.getBalloon('turn_around'),
                    this.oldLady.getBalloon('ho_my_god')
                ]);
                this.oldLady.isFear = true;
            } else {

                if (this.hero.isDone) {
                    if (this.hero.isUndressed) {
                        this.oldLady.doUnbend();
                        this.hero.doDress();
                        return;
                    }
                    this.oldLady.doIdleStreet();
                    this.hero.doIdleStreet(0);
                    this.balloon.doDialog(this.oldLady.getBalloon('deserves5'));
                    this.endAction = true;

                } else {
                    if (!this.hero.isUndressed) {
                        this.oldLady.doBend();
                        this.hero.doUndress();
                        return;
                    }
                    this.balloon.doDialog([
                        Balloon.EMPTY_BALLON,
                        this.oldLady.getBalloon('so_big'),
                        Balloon.EMPTY_BALLON,
                        this.hero.getBalloon('its_done')
                    ]);
                    this.hero.isDone = true;
                }
            }
            return;
        }
        this.hero.doIdleStreet();
        if (!Keyboard.isShown) {
            Keyboard.show([
                {
                    text: Resources.labelsData.RAPE,
                    action: Resources.labelsData.RAPE
                },
                {
                    text: Resources.labelsData.ROB,
                    action: Resources.labelsData.ROB
                },
                {
                    text: Resources.labelsData.CONTINUE,
                    action: Resources.labelsData.CONTINUE
                }
            ]
            )
            Keyboard.onChange = (e) => {

                Keyboard.hide();

                if (e !== Resources.labelsData.CONTINUE && !Resources.PLAYER_INVENTORY.gun) {
                    this.balloon.doDialog(this.hero.getBalloon('no_gun'));
                    this.hero.doIdleStreet(2);
                    this.endAction = true;
                    return;
                }

                if (e === Resources.labelsData.RAPE) {
                    this.oldLady.isRaped = true;
                } else if (e === Resources.labelsData.ROB) {
                    this.oldLady.isRobbed = true;
                } else {
                    this.hero.updateInventory({
                        lossPoints: this.oldLady.inventory.lossPoints
                    })
                    this.endAction = true;
                }
            }
        }
    }
    doScout() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {

            if (this.scout.isOutside) {
                if (this.scout.isRobbed) {
                    this.hero.updateInventory({
                        points: this.scout.inventory.points,
                        cash: this.scout.currentStash.cash
                    });
                } else {
                    this.hero.updateInventory({ lossPoints: this.scout.inventory.lossPoints });
                }
                this.scout.doEnterDoor();
                return;
            }

            if (this.door.isOpened) {
                this.door.doCloseDoor();
                return;
            }

            this.changeAction(Door.Actions.SCROLL);
            this.scout.disable();
            return;
        }


        if (!this.door.isOpened) {
            this.hero.doIdleStreet();
            this.door.doOpenDoor();
            return;
        }

        if (!this.scout.isOutside) {
            if (!this.scout.isEnabled) this.scout.enable();
            this.scout.doExitDoor();
            return;
        }

        if (!this.scout.isSalute) {
            this.scout.doSalute();
            return;
        }


        if (this.scout.isRobbed) {

            this.scout.doIdleFear();

            if (!this.hero.isDone) {
                this.hero.doRobScout();
                return;
            }

            this.balloon.doDialog([
                this.hero.getBalloon('whats_in_pack'),
                this.scout.currentStash.balloon
            ]);
            this.endAction = true;
            return;
        }

        if (!Keyboard.isShown) {
            this.balloon.doDialog([this.scout.getBalloon('scout_hi_friend')], false);
            Keyboard.show([
                {
                    text: Resources.labelsData.ROB,
                    action: Resources.labelsData.ROB
                },
                {
                    text: Resources.labelsData.CONTINUE,
                    action: Resources.labelsData.CONTINUE
                }
            ]
            )
            Keyboard.onChange = (e) => {
                this.balloon.clear();
                if (e === Resources.labelsData.ROB) {
                    this.scout.isRobbed = true;
                } else {
                    this.endAction = true;
                }
                Keyboard.hide();
            }
        }
    }
    doCrackhouse() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {
            if (this.hero.act === 'cont') {
                this.changeAction(Door.Actions.SCROLL);
                this.hero.act = undefined;

            } else {
                if (!this.door.isOpened) {
                    this.door.doOpenDoor();
                    return;
                }

                if (this.hero.isOutside) {
                    this.hero.doEnterDoor();
                    return;
                }
                this.callback(CrackhouseScene.NAME);
                this.changeAction(Door.Actions.SCROLL);
            }
            return;
        }

        this.hero.doIdleStreet();
        if (!Keyboard.isShown) {
            Keyboard.show([
                {
                    text: Resources.labelsData.RENT,
                    action: Resources.labelsData.RENT
                },
                {
                    text: Resources.labelsData.CONTINUE,
                    action: Resources.labelsData.CONTINUE
                }
            ]
            )
            Keyboard.onChange = (e) => {
                if (e === Resources.labelsData.RENT) {



                    if (Resources.PLAYER_INVENTORY.drugs === 0) {
                        this.balloon.doDialog([this.hero.getBalloon('no_drugs')]);
                        this.hero.act = 'cont';
                        this.hero.doIdleStreet(2);
                    } else if (Resources.PLAYER_INVENTORY.cash < CrackhouseScene.RENT_COST) {
                        this.balloon.doDialog([this.hero.getBalloon('no_cash')]);
                        this.hero.act = 'cont';
                        this.hero.doIdleStreet(2);
                    }
                } else {
                    this.hero.act = 'cont';
                }
                this.endAction = true;
                Keyboard.hide();
            }
        }
    }
    doWhore() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {
            if (!this.whore.isAccepted) {
                if (this.whore.isOutside) {
                    this.whore.doEnterDoor();
                    return;
                }
                this.whore.disable();
                if (this.door.isOpened) {
                    this.door.doCloseDoor();
                    return;
                }

                this.balloon.doDialog([this.hero.getBalloon('hero_pussy')]);
                this.hero.updateInventory({
                    lossPoints: this.whore.inventory.lossPoints
                });
                this.hero.doIdleStreet(2);
                this.changeAction(Door.Actions.SCROLL);
            } else {
                if (this.whore.isOutside) {
                    this.whore.doEnterDoor();
                    return;
                }
                if (this.hero.isOutside) {
                    this.hero.doEnterDoor();
                    return;
                }
                if (this.door.isOpened) {
                    this.door.doCloseDoor();
                    return;
                }
                this.callback(BrothelScene.NAME);
                this.changeAction(Door.Actions.SCROLL);
            }
            return;
        }


        this.hero.doIdleStreet(0);
        if (!this.door.isOpened) {
            this.door.doOpenDoor();
            return;
        }

        this.hero.doIdleStreet();
        if (!this.whore.isOutside) {
            if (!this.whore.isEnabled) this.whore.enable();
            this.whore.doExitDoor();
            return;
        }

        if (!Keyboard.isShown) {
            this.balloon.doDialog([this.whore.getRandomBalloon('street_question')], false);
            Keyboard.show([
                {
                    text: Resources.labelsData.ACCEPT,
                    action: Resources.labelsData.ACCEPT
                },
                {
                    text: Resources.labelsData.CONTINUE,
                    action: Resources.labelsData.CONTINUE
                }
            ]
            )
            Keyboard.onChange = (e) => {
                if (e === Resources.labelsData.ACCEPT) {
                    this.whore.isAccepted = true;
                    this.balloon.doDialog([this.whore.getBalloon('come_on_then')]);
                } else {
                    this.balloon.clear();
                }
                this.endAction = true;
                Keyboard.hide();
            }
        }
    }
    doThief() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {

            if (this.thief.currentAction === Thief.Actions.ROB) {
                if (this.thief.isOutside) {
                    this.thief.doEnterDoor();
                } else {
                    if (Resources.PLAYER_INVENTORY.gun) this.balloon.doDialog([this.hero.getBalloon('dont_have_gun')]);
                    else this.balloon.doDialog([this.hero.getBalloon('shit')]);
                    this.hero.doIdleStreet(2);
                    this.thief.currentAction = null;
                    this.thief.disable();
                    this.hero.updateInventory({
                        lossPoints: this.thief.inventory.lossPoints,
                        wallet: false
                    });
                }
                return;
            } else if (this.thief.currentAction === Thief.Actions.HURT) {
                this.hero.updateInventory({
                    points: this.thief.inventory.points,
                });
                this.balloon.doDialog([this.thief.getBalloon('only_wanted_light')]);
                this.thief.currentAction = null;
                return;
            } else {
                this.thief.currentAction = null;
            }
            this.hero.doIdleStreet(0);
            if (this.thief.isOutside) {
                this.thief.doEnterDoor();
                return;
            }
            if (this.door.isOpened) {
                this.door.doCloseDoor();
                return;
            }
            this.changeAction(Door.Actions.SCROLL);
            return;
        }

        this.hero.doIdleStreet(0);

        if (!this.door.isOpened) {
            this.door.doOpenDoor();
            return;
        }

        if (!this.thief.isOutside) {
            if (!this.thief.isEnabled) this.thief.enable();
            this.thief.doExitDoor();
            return;
        }


        switch (this.thief.currentAction) {
            case Thief.Actions.ASK_LIGHT:
                this.balloon.doDialog([
                    this.thief.getBalloon('ask_light'),
                    this.hero.getBalloon('dont_smoke')
                ]);
                this.endAction = true;
                break;

            case Thief.Actions.ROB:

                this.thief.doShowGun();

                if (!Resources.PLAYER_INVENTORY.gun) {
                    this.balloon.doDialog([
                        this.thief.getBalloon('give_me_wallet')
                    ]);
                    this.endAction = true;
                    return;
                } else {
                    this.balloon.doDialog([
                        this.thief.getBalloon('give_me_wallet')
                    ], false);
                }

                if (this.animID) return;
                let i = Thief.ACTION_TIMEOUT;
                this.animID = setInterval(() => {
                    if (i === 0) {
                        clearInterval(this.animID);
                        this.animID = null;
                        Keyboard.hide();
                        this.endAction = true;
                        return;
                    }
                    i--;
                    Keyboard.updateButtonText(`${Resources.labelsData.DEFEND} ${i}`)
                }, 1000);

                if (!Keyboard.isShown) {
                    Keyboard.show([
                        {
                            text: `${Resources.labelsData.DEFEND} ${Thief.ACTION_TIMEOUT}`,
                            action: Resources.labelsData.DEFEND
                        }
                    ]
                    )
                    Keyboard.onChange = (e) => {
                        if (this.animID) {
                            clearInterval(this.animID);
                            this.animID = null;
                        }
                        if (this.balloon.animID) this.balloon.clear();
                        Keyboard.hide();
                        this.thief.currentAction = Thief.Actions.HURT;
                    }
                }
                break;

            case Thief.Actions.HURT:
                if (!this.thief.isHurted) {
                    this.thief.doHurt();
                    return;
                }
                this.endAction = true;
                break;
            default:
                break;
        }
    }
    doParadiseCafe() {

        if (this.endAction) {
            if (this.hero.doAction) {
                if (this.hero.isOutside) this.hero.doEnterDoor();
                else this.hero.doAction = false;
                return;
            }
            if (this.door.isOpened) {
                this.door.doCloseDoor();
                return;
            }
            if (this.hero.isOutside) this.changeAction(Door.Actions.SCROLL);
            else {
                this.callback(ParadiseCafeScene.NAME);
            }
            return;
        }

        if (!this.door.isOpened) {
            this.door.doOpenDoor();
            this.hero.doIdleStreet(0);
            return;
        }

        this.door.doParadiseCafe();
        this.hero.doIdleStreet();

        if (!Keyboard.isShown) {
            Keyboard.show([
                {
                    text: Resources.labelsData.ENTER,
                    action: Resources.labelsData.ENTER
                },
                {
                    text: Resources.labelsData.CONTINUE,
                    action: Resources.labelsData.CONTINUE
                }
            ]
            )
            Keyboard.onChange = (e) => {
                if (e === Resources.labelsData.ENTER) this.hero.doAction = true;
                this.endAction = true;
                Keyboard.hide();
            }
        }
    }
    doScroll() {

        if (this.balloon.isDialog) return;

        this.door.doMove();
        this.hero.doWalk();

        if (this.door.hasAction) {
            this.changeAction(this.door.currentAction)
        }
    }

    changeAction(action) {
        switch (action) {
            case Door.Actions.SCROLL:
                this.currentNPCIndex = null;
                this.currentAction = this.doScroll;
                break;
            case Door.Actions.PARADISECAFE:
                this.currentNPCIndex = null;
                this.currentAction = this.doParadiseCafe;
                break;
            case Door.Actions.THIEF:
                this.currentNPCIndex = this.thief.index;
                this.currentAction = this.doThief;
                break;
            case Door.Actions.WHORE:
                this.currentNPCIndex = this.whore.index;
                this.currentAction = this.doWhore;
                break;
            case Door.Actions.CRACKHOUSE:
                this.currentNPCIndex = null;
                this.currentAction = this.doCrackhouse;
                break;
            case Door.Actions.SCOUT:
                this.currentNPCIndex = this.scout.index;
                this.currentAction = this.doScout;
                break;
            case Door.Actions.OLD_LADY:
                this.currentNPCIndex = this.oldLady.index;
                this.currentAction = this.doOldLady;
                break;
            case Door.Actions.POLICE:
                this.currentNPCIndex = this.police.index;
                this.currentAction = this.doPolice;
                break;
        }
        this.endAction = false;
    }
    update(delta) {
        this.currentAction();
        this.door.update();
        this.hero.update();

        if (this.currentNPCIndex !== null) {
            this.NPCs[this.currentNPCIndex].update();
        }
        super.update(delta);
    }

    enable() {
        super.enable();
        this.hero.enable();
        this.door.enable();
        this.changeAction(Door.Actions.SCROLL);
        HUD.hiScoresEnabled = true;
    }
    disable() {
        super.disable();
        this.hero.disable();
        this.door.disable();
        this.whore.disable();
        this.police.disable();
        this.scout.disable();
        this.thief.disable();
        this.oldLady.disable();
        this.currentAction = null;
        this.endAction = false;
    }
}
StreetScene.NAME = 'street';