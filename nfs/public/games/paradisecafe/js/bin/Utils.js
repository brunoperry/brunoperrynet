class Utils {

    static getRandomItem(data) {
        return data[Math.floor(Math.random() * data.length)];
    }
    static getRandomTrueFalse() {
        return Utils.getRandomItem([
            true, false, false, true, false, true, true, false, true, false, false, true, false, true, false, true, true, false
        ])
    }

    static clearItemsFrom(data, target) {

        let arr = [];
        for (let i = 0; i < data.length; i++) {
            const elem = data[i];
            if (elem.name.includes(target)) continue;
            arr.push(elem);
        }
        return arr;
    }

    static shuffle(arr) {
        arr.map(a => [Math.random(), a])
            .sort((a, b) => a[0] - b[0])
            .map(a => a[1]);
    };

    static transition(context, canvas, callback, speed) {
        let blocksize = 2;
        let vc = document.createElement('canvas');
        vc.width = canvas.width / 4;
        vc.height = canvas.height / 4;
        let vctx = vc.getContext('2d');
        vctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
        let int = setInterval(() => {

            vc.height = canvas.height;
            vc.width = canvas.width;

            let size = (blocksize) * 0.5;
            let w = canvas.width * size;
            let h = canvas.height * size;
            context.drawImage(vc, 0, 0, w, h);
            context.mozImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;
            context.drawImage(canvas, canvas.width * 0.5, canvas.height * 0.5, canvas.width, canvas.height, 0, 0, w, h);

            blocksize += Math.round(blocksize / 2);
            if (blocksize >= 32) {
                callback();
                clearInterval(int);
            }
        }, speed);
    }
}