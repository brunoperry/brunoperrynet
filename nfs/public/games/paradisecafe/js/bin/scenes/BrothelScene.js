class BrothelScene extends Scene {

    constructor(callback) {
        super(callback, BrothelScene.NAME);

        this.balloon = new Balloon();

        this.hero = new Hero();
        this.whore = new Whore();
        this.NPCs.push(this.whore);
        this.whore.index = this.NPCs.length - 1;
        this.pimp = new Pimp();
        this.NPCs.push(this.pimp);
        this.pimp.index = this.NPCs.length - 1;

        this.currentAction = null;
        this.endAction = false;
        this.changeAction();
    }

    doIdle() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {
            this.changeAction(this.whore.currentService.name)
            return;
        }

        if (!this.whore.isEnabled) {
            this.whore.enable();
        }
        this.hero.doIdleBrothel();
        this.whore.doIdleBrothel();
        if (!Keyboard.isShown) {
            this.balloon.doDialog(this.whore.getBalloon('what_you_want'), false);
            Keyboard.show([
                {
                    text: Resources.labelsData.ORAL,
                    action: Resources.labelsData.ORAL
                },
                {
                    text: Resources.labelsData.SEX,
                    action: Resources.labelsData.SEX
                },
                {
                    text: Resources.labelsData.ANAL,
                    action: Resources.labelsData.ANAL
                }
            ]);
            Keyboard.onChange = e => {
                Keyboard.hide();
                this.endAction = true;
                this.balloon.clear();
                switch (e) {
                    case Resources.labelsData.ORAL:
                        this.balloon.doDialog(this.hero.getBalloon('do_me_blowjob'));
                        this.whore.setService(Whore.Actions.ORAL);
                        break;
                    case Resources.labelsData.SEX:
                        this.balloon.doDialog(this.hero.getBalloon('eat_your_pussy'));
                        this.whore.setService(Whore.Actions.SEX);
                        break;
                    case Resources.labelsData.ANAL:
                        this.balloon.doDialog(this.hero.getBalloon('eat_your_ass'));
                        this.whore.setService(Whore.Actions.ANAL);
                        break;
                }
            };
        }
    }
    doPimp() {

        if (this.balloon.isDialog) {

            if (this.pimp.hasRape && !this.hero.isDone) {
                this.hero.doPimpRape();
                this.pimp.doHeroRape();
                return;
            }
            return;
        }

        if (this.endAction) {

            if (this.hero.isDone) {
                this.hero.doPimpRape();
                this.pimp.doHeroRape();
                this.hero.isDone = true;
                this.hero.updateInventory({
                    lossPoints: this.whore.inventory.lossPoints * 10
                });
                this.callback(StreetScene.NAME);
            } else if (this.pimp.hasRape) {

                this.balloon.doDialog([
                    Balloon.EMPTY_BALLON,
                    this.hero.getBalloon('what_a_dick'),
                    Balloon.EMPTY_BALLON
                ], true, e => {
                    this.hero.isDone = true;
                });

            } else {
                this.pimp.doIdleBrothel();
                this.balloon.doDialog([
                    this.pimp.getBalloon('whats_going_on'),
                    this.whore.getBalloon('this_no_pay'),
                    this.pimp.getBalloon('he_will_see')
                ], true, e => {
                    this.pimp.hasRape = true;
                });
            }

            return;
        }

        if (!this.pimp.hasSalute) {
            if (!this.pimp.isEnabled) this.pimp.enable();
            this.pimp.doSalute();
            return;
        };

        this.balloon.doDialog(this.pimp.getBalloon('pimp_hello'));

        this.endAction = true;
    }
    doOral() {
        if (this.balloon.isDialog) {
            this.hero.doBlowjob();
            this.whore.doBlowjob();
            return;
        }

        if (this.endAction) {
            this.currentAction = this.doFinish;
            this.endAction = false;
            return;
        }

        this.whore.doIdleBrothel();
        this.balloon.doDialog([
            Balloon.EMPTY_BALLON,
            this.hero.getBalloon('hero_suck_it_all'),
            Balloon.EMPTY_BALLON,
            this.hero.getBalloon('hero_so_good')
        ]);
        this.endAction = true;
    }
    doSex() {
        if (this.balloon.isDialog) {
            this.hero.doSex();
            this.whore.doSex();
            return;
        }

        if (this.endAction) {
            this.currentAction = this.doFinish;
            this.endAction = false;
            return;
        }

        this.balloon.clear();
        this.whore.doIdleBrothel();
        this.balloon.doDialog([
            Balloon.EMPTY_BALLON,
            Balloon.EMPTY_BALLON,
            this.hero.getBalloon('hero_im_coming')
        ]);
        this.endAction = true;
    }
    doAnal() {

        if (this.balloon.isDialog) {
            this.hero.doAnal();
            this.whore.doAnal();
            return;
        }

        if (this.endAction) {
            this.currentAction = this.doFinish;
            this.endAction = false;
            return;
        }

        this.whore.doIdleBrothel();
        this.balloon.doDialog([
            Balloon.EMPTY_BALLON,
            this.whore.getBalloon('so_thick'),
            this.hero.getBalloon('hero_aaa')
        ]);
        this.endAction = true;
    }
    doFinish() {

        if (this.balloon.isDialog) return;

        if (this.endAction) {
            this.changeAction(Pimp.NAME);
            return;
        }

        this.hero.doIdleBrothel();
        this.whore.doIdleBrothel();

        this.balloon.doDialog(this.whore.currentService.balloon, false);
        if (!Keyboard.isShown) {

            Keyboard.show([
                {
                    text: Resources.labelsData.PAY,
                    action: Resources.labelsData.PAY
                }
            ]);
            Keyboard.onChange = e => {

                Keyboard.hide();
                if (this.whore.currentService.value > this.hero.inventory.cash) {
                    this.balloon.doDialog([
                        this.hero.getBalloon('no_cash_brothel'),
                        this.whore.getBalloon('call_pimp')
                    ]);
                    this.endAction = true;
                } else {
                    this.hero.updateInventory({
                        points: this.whore.inventory.points,
                        cash: -this.whore.currentService.value
                    });
                    this.callback(StreetScene.NAME);
                }
            }
        }
    }

    changeAction(action) {

        switch (action) {
            case Whore.Actions.ORAL:
                this.currentNPCIndex = null;
                this.currentAction = this.doOral;
                break;
            case Whore.Actions.SEX:
                this.currentNPCIndex = null;
                this.currentAction = this.doSex;
                break;
            case Whore.Actions.ANAL:
                this.currentNPCIndex = null;
                this.currentAction = this.doAnal;
                break;
            case Pimp.NAME:
                this.currentNPCIndex = null;
                this.currentAction = this.doPimp;
                break;
            default:
                this.currentAction = this.doIdle;
                break;

        }
        this.endAction = false;
    }
    update(delta) {

        if (this.currentAction) this.currentAction();
        this.hero.update();

        for (let i = 0; i < this.NPCs.length; i++) {
            const npc = this.NPCs[i];
            if (npc.isEnabled) {
                npc.update();
            }

        }
        super.update(delta);
    }

    enable() {
        super.enable();
        this.hero.enable();
        this.whore.enable();
        this.currentAction = this.doIdle;
        HUD.hiScoresEnabled = false;
    }
    disable() {
        super.disable();
        this.hero.disable();
        this.whore.disable();
        this.pimp.disable();
        this.currentAction = null;
        this.balloon.clear();
        this.endAction = false;
    }
}

BrothelScene.NAME = 'brothel';