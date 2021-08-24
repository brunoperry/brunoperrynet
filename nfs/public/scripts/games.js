window.onload = () => {
    document.body.style.opacity = 1;

    document.querySelector('#paradisecafe-button').addEventListener(Component.Events.CLICK, e => {

        window.location = 'games/paradisecafe'
        console.log('hessre', e.target.data)
    })
}