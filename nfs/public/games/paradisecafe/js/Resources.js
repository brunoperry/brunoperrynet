class Resources {

    static async init(data) {

        const RESOURCES_TO_LOAD = 2;

        try {

            const totalImages = data.media.images.length;

            for (let i = 0; i < totalImages; i++) {
                const img = data.media.images[i];

                const req = await fetch(img.path);
                const res = await req.blob();

                Loader.update({
                    text: 'loading images',
                    value: i / totalImages
                });

                const image = new Image();
                image.src = URL.createObjectURL(res);;
                img.imageData = image;
            }
            Resources.imagesData = data.media.images;
        } catch (error) {
            console.error('Error loading images!', error)
        }
        try {
            data.media.audios.forEach(async audio => {
                const req = await fetch(audio.path);
                const res = await req.blob();
                audio.audioData = window.URL.createObjectURL(res);
            })
            Resources.audioData = data.media.audios;
        } catch (error) {
            console.error('Error loading audios!', error)
        }

        Resources.initialized = true;

        console.log('resources ready!')
    }

    static getImages(from = null) {
        if (!from) return Resources.imagesData;
        return Resources.imagesData.filter(img => img.name.includes(`${from}_`));
    }

    static getImage(imageName) {
        return Resources.imagesData.find(img => img.name.includes(imageName));
    }

    static getTrack(trackName) {
        return Resources.audioData.find(img => img.name.includes(trackName));
    }

    static resetPlayerInventory() {
        Resources.PLAYER_INVENTORY = {
            wallet: true,
            gun: false,
            cash: 30,
            points: 0,
            drugs: 0,
            expense: null
        }
    }
}
Resources.DIALOG_SPEED = 1000;
Resources.imagesData = null;
Resources.audioData = null;
Resources.labelsData = null;

Resources.VERIFY_AGE_LINK = 'https://www.youtube.com/watch?v=Yzvr9nww1gg';
Resources.initialized = false;

Resources.PLAYER_INVENTORY = {
    wallet: true,
    gun: false,
    cash: 30,
    points: 0,
    drugs: 0,
    expense: null
}