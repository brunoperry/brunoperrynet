class Loader {

    static init() {
        Loader.canvas = document.querySelector('canvas');
        Loader.ctx = Loader.canvas.getContext('2d');
    }

    static update(data) {

        const w = Loader.canvas.width;
        const h = Loader.canvas.height;

        const paddingLeft = 10;
        let barW = (w * data.value) - (paddingLeft * 2);
        if (barW < 0) barW = 0;

        Loader.ctx.font = '28px Mono';
        Loader.ctx.fillStyle = '#ffffff';
        Loader.ctx.clearRect(0, 0, w, h);
        Loader.ctx.fillText(`A CARREGAR: ${Math.floor(data.value * 100)}%`, paddingLeft, (h / 2) + 40);
        Loader.ctx.fillRect(paddingLeft, h / 2, barW, 20);

        Loader.ctx.strokeStyle = '#ffffff';
        Loader.ctx.rect(5, (h / 2) - 5, w - 10, 30);
        Loader.ctx.stroke();
    }
    static clear() {
        Loader.ctx.clearRect(0, 0, Loader.canvas.width, Loader.canvas.height);
    }
}
Loader.canvas = null;
Loader.ctx = null;
Loader.callback = null;
Loader.Events = {
    START: 'loadereventsstart',
    END: 'loadereventsend'
}