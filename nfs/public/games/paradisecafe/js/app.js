window.onload = async () => {
    document.body.style.opacity = 1;

    initGame();
}

const initGame = async () => {

    const gameData = {
        tile: 'Paradise Café',
        media: {
            images: null,
            audios: null,
            font: null
        },
        labels: null,
        scores: null
    }
    console.log('initializing...');

    let req = await fetch('data')
    let res = await req.json();

    gameData.media.images = res.data.images;
    gameData.media.audios = res.data.audios;
    gameData.media.font = res.data.font;
    gameData.labels = res.data.labels;
    gameData.scores = res.scores;

    // //SETUP EVENTS
    addEventListener(Game.Events.INITIALIZED, () => console.log('game ready'))

    await new Game().init(gameData);
}

const onGame = (e) => {

}