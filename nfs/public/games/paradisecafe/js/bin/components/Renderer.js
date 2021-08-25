class Renderer {

    constructor(callback) {

        this.callback = callback;

        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    render(images) {

        this.ctx.clearRect(0, 0, this.width, this.height);

        images.forEach(img => {
            this.ctx.drawImage(img.imageData, img.x, img.y, img.width, img.height);
        });
    }
}