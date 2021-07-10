class Animation {
    static async anim(elem, animName) {
        elem.style.animationName = animName;
        return new Promise((resolve, reject) => {
            elem.onanimationend = () => {
                resolve();
            };
        })
    }

    static async swapViews(a, b) {
        a.hide();
        setTimeout(() => {
            b.show();
        }, Component.SPEED);
    }
    static async showIn(elem) {
        return Animation.anim(elem, 'show-in')
    }
    static async showOut(elem) {
        return Animation.anim(elem, 'show-out')
    }
    static async rollIn(elem) {
        return Animation.anim(elem, 'roll-in')
    }
    static async rollOut(elem) {
        return Animation.anim(elem, 'roll-out')
    }
}