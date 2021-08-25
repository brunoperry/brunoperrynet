class Balloon extends Component {

    constructor(callback) {
        super(callback, Balloon.NAME)
        this.isBalloon = false;

        Balloon.EMPTY_BALLON = Resources.getImage('empty');
        this.currentCycle = [Balloon.EMPTY_BALLON];

        this.width = Balloon.EMPTY_BALLON.imageData.width;
        this.height = Balloon.EMPTY_BALLON.imageData.height;

        this.isDialog = false;
    }

    clear() {
        if (this.animID) {
            clearInterval(this.animID);
        }
        this.animID = null;
        this.isDialog = false;
        this.currentCycle = [Balloon.EMPTY_BALLON];
    }

    doDialog(balloons, andWait = true, cb = null) {

        if (!balloons.length) balloons = [balloons];

        this.isDialog = true;
        if (!andWait) {
            this.currentCycle = [balloons[0]];
            this.isDialog = false;
            return;
        }

        let i = 0;
        const res = () => {
            this.animID = setTimeout(() => {
                i++;
                if (i === balloons.length) {
                    this.isDialog = false;
                    this.currentCycle = [Balloon.EMPTY_BALLON];
                    this.animID = null;
                    if (cb) cb(Balloon.Events.BALLONS_DONE)
                    return;
                }
                this.currentCycle = [balloons[i]];
                res();
            }, Balloon.TIMEOUT);
        }
        this.currentCycle = [balloons[i]];
        res();
    }
}
Balloon.Events = {
    BALLONS_DONE: 'ballooneventsdone'
}
Balloon.EMPTY_BALLON = null;
Balloon.TIMEOUT = 2000;
Balloon.NAME = 'balloon';