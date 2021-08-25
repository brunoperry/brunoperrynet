class Door extends Component {

    constructor(callback) {
        super(callback, Door.NAME);

        this.cafeDoorImages = this.getImagesByName('door_cafe');

        this.doorScrollImage = this.getImagesByName('door_scroll.png');
        this.crackhouseScrollImage = this.getImagesByName('door_crackhouse_scroll');

        this.doorOpenImages = this.getImagesByName('door_open');
        this.doorCloseImages = [...this.doorOpenImages].reverse();
        this.crackhouseDoorOpenImages = this.getImagesByName('door_crackhouse_open');
        this.crackhouseDoorCloseImages = [...this.crackhouseDoorOpenImages].reverse();

        this.currentScrollImage = this.doorScrollImage;

        this.isOpened = false;

        this.scrollTick = 0;

        this.actions = [
            Door.Actions.PARADISECAFE,
            Door.Actions.POLICE,
            Door.Actions.WHORE,
            Door.Actions.THIEF,
            Door.Actions.SCOUT,
            Door.Actions.CRACKHOUSE,
            Door.Actions.OLD_LADY,
            Door.Actions.SCROLL
        ]
        this.currentAction = Door.Actions.SCROLL;
    }

    doMove() {

        if (this.currentCycle !== this.currentScrollImage) {
            this.setCurrentCycle(this.currentScrollImage);
        }

        this.x = this.canvasW - this.scrollTick * 15;
        if (this.x < -this.width) {
            this.scrollTick = 0;
            this.currentAction = this.actions[Math.floor(Math.random() * this.actions.length)];
            // this.currentAction = Door.Actions.CRACKHOUSE;
            if (this.currentAction === Door.Actions.CRACKHOUSE) {
                this.currentScrollImage = this.crackhouseScrollImage;
            } else {
                this.currentScrollImage = this.doorScrollImage;
            }
        }
        this.scrollTick++;
    }
    doOpenDoor() {
        if (this.isOpened) return;
        this.x = 80;

        if (this.currentAction === Door.Actions.CRACKHOUSE) {
            if (this.currentCycle !== this.crackhouseDoorOpenImages) {
                this.setCurrentCycle(this.crackhouseDoorOpenImages, false);
            }
        } else {
            if (this.currentCycle !== this.doorOpenImages) {
                this.setCurrentCycle(this.doorOpenImages, false);
            }
        }

        if (this.tick === this.currentCycle.length - 1) this.isOpened = true;
    }
    doCloseDoor() {
        if (!this.isOpened) return;

        if (this.currentAction === Door.Actions.CRACKHOUSE) {
            if (this.currentCycle !== this.crackhouseDoorCloseImages) {
                this.setCurrentCycle(this.crackhouseDoorCloseImages, false);
            }
        } else {
            if (this.currentCycle !== this.doorCloseImages) {
                this.setCurrentCycle(this.doorCloseImages, false);
            }
        }

        if (this.tick === this.currentCycle.length - 1) this.isOpened = false;
    }
    doParadiseCafe() {
        if (this.currentCycle !== this.cafeDoorImages) {
            this.setCurrentCycle(this.cafeDoorImages);
        }
    }

    get hasAction() {
        if (this.x < 80 && this.x > 65) {
            const action = this.actions[Math.floor(Math.random() * this.actions.length)];
            if (action !== Door.Actions.SCROLL) return action;
        }
        return null;
    }

    disable() {
        super.disable();
        this.isOpened = false;
    }
}

Door.NAME = 'door';
Door.Actions = {
    PARADISECAFE: 'paradise_cafe',
    POLICE: 'police',
    WHORE: 'whore',
    THIEF: 'thief',
    SCOUT: 'scout',
    CRACKHOUSE: 'crackhouse',
    OLD_LADY: 'oldlady',
    SCROLL: 'scroll'
}