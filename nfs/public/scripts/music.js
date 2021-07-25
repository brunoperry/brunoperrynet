class ActionController {

    constructor(callback) {

        this.callback = callback;
        this.view = document.querySelector('#controls-container');

        let btn = this.view.querySelector('#previous-button');
        btn.addEventListener(Component.Events.CLICK, e => callback({
            action: 'previous'
        }));
        btn = this.view.querySelector('#next-button');
        btn.addEventListener(Component.Events.CLICK, e => callback({
            action: 'next'
        }));

        this.actionButton = this.view.querySelector('#action-button');
        this.actionButton.querySelector('#play-button').addEventListener(Component.Events.CLICK, e => callback({
            action: 'play'
        }));
        this.actionButton.querySelector('#pause-button').addEventListener(Component.Events.CLICK, e => callback({
            action: 'pause'
        }));

        this.animID = null;
        this.setAction('play');
    }

    setAction(type) {

        const btns = this.actionButton.children;
        for (let i = 0; i < btns.length; i++) {
            btns[i].style.display = 'none';
        }
        this.actionButton.querySelector(`#${type}-button`).style.display = 'initial';
    }

    show() {

        if (this.animID) {
            clearInterval(animID);
            this.animID = null;
        }
        let i = 0;

        const btns = this.view.children;
        this.animID = setInterval(e => {
            btns[i].style.opacity = 1;
            i++;
            if (i >= btns.length) {
                clearInterval(this.animID);
                this.animID = null;
            }
        }, 100)
    }

    hide() {
        const btns = this.view.children;
        for (let i = 0; i < btns.length; i++) {
            btns[i].style.opacity = 0;
        }
    }
}
class Info {

    constructor(cb) {
        this.callback = cb;
        this.view = document.querySelector('#info-container');
        this.contentElem = this.view.querySelector('#info-content');
        this.isOpen = false;


        this.button = this.view.querySelector('#info-button');
        this.button.addEventListener(Component.Events.CLICK, e => {

            if (this.isOpen) this.hide();
            else this.show();
        })
    }

    update(data) {
        this.button.value = data.name;
    }

    show(data = null) {

        this.callback('open');
        if (data) this.update(data);

        this.contentElem.style.transform = 'translateY(0)';
        this.isOpen = true;
    }

    hide() {
        this.callback('close');
        this.contentElem.style.transform = 'translateY(-100%)';
        this.isOpen = false;
    }
}

window.onload = async e => {

    Component.SPEED = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--speed').replace('s', '')) * 1000;

    const musicContainer = document.querySelector('#music-container');

    let menuData;
    try {
        const req = await fetch('/music/getall');
        menuData = await req.json();
    } catch (error) {
        console.log('error getting menu data', e);
    }

    //Audio data
    let currentPlayList = menuData.data[0].children;
    let currentTrackIndex = 0;

    const menu = document.querySelector('#menu');
    menu.update(menuData.data)
    menu.addEventListener(MobileMenu.Events.OPEN, e => {
        musicContainer.className = 'shrink';
        if (info.isOpen) info.hide();
    })
    menu.addEventListener(MobileMenu.Events.CLOSE, e => {
        musicContainer.className = 'grow';
    })
    menu.addEventListener(MobileMenu.Events.CLICK, e => {

        if (currentPlayList[currentTrackIndex].path === e.detail.data[e.detail.index].path) return;
        currentPlayList = e.detail.data;
        currentTrackIndex = e.detail.index;
        const itm = currentPlayList[currentTrackIndex];
        if (itm.type === 'stream' || itm.type === 'file') {
            audio.playMedia(itm.path);
        }
    })

    const info = new Info(e => {

        switch (e) {
            case 'open':
                musicContainer.className = 'shrink';
                break;
            case 'close':
                musicContainer.className = 'grow';
                break;
            default:
                break;
        }
    });
    info.update(currentPlayList[currentTrackIndex]);

    const actionController = new ActionController(e => {
        switch (e.action) {
            case 'pause':
                audio.pause();
                break;
            case 'play':
                audio.playMedia(currentPlayList[currentTrackIndex].path)
                break;
            case 'next':
                currentTrackIndex++;
                if (currentTrackIndex >= currentPlayList.length) currentTrackIndex = 0;
                audio.playMedia(currentPlayList[currentTrackIndex].path);
                break;
            case 'previous':
                currentTrackIndex--;
                if (currentTrackIndex < 0) currentTrackIndex = currentPlayList.length - 1;
                audio.playMedia(currentPlayList[currentTrackIndex].path);
                break;
        }
    });
    actionController.show();

    const scrubb = document.querySelector('#scrubb');
    scrubb.addEventListener(RangeSlider.Events.CHANGED, e => {

        let t = (scrubb.value / 100) * audio.duration;
        audio.currentTime = t;
    });
    scrubb.hide();

    const volume = document.querySelector('#volume');
    volume.addEventListener(RangeSlider.Events.CHANGED, e => {
        audio.volume = volume.value / 100;
    });

    const audio = new Audio();
    audio.volume = volume.value / 100;
    audio.playMedia = path => {

        const ids = currentPlayList[currentTrackIndex].id.toString().split('.');
        let activeItems = [];
        for (let i = 0; i < ids.length; i++) {
            if (i > 0) {
                activeItems.push(`${activeItems[i - 1]}.${ids[i]}`);
            } else {
                activeItems.push(ids[i].toString());
            }
        }
        menu.setActiveItems(activeItems);
        try {
            audio.src = path;
            audio.play();
        } catch (error) {
            actionController.setAction('error');
            scrubb.hide();
        }
    }
    audio.stopMedia = () => audio.pause();

    audio.onplaying = e => {
        actionController.setAction('pause');
    }
    audio.onerror = e => {
        actionController.setAction('error');
        scrubb.hide();
    }
    audio.onplay = e => {

        const track = currentPlayList[currentTrackIndex];
        if (track.type === 'file') {
            scrubb.show();
            audio.addEventListener('timeupdate', onAudioProgress);
        } else {
            scrubb.hide();
            audio.removeEventListener('timeupdate', onAudioProgress);
        }
        actionController.setAction('loading');
        info.update(track)
    }
    audio.onpause = e => {
        actionController.setAction('play');
    }
    audio.onended = e => {
        currentTrackIndex++;
        if (currentTrackIndex >= currentPlayList.length) currentTrackIndex = 0;
        audio.playMedia(currentPlayList[currentTrackIndex].path);
    }
    audio.onstalled = e => {
        actionController.setAction('loading');
    }
    audio.onseeking = e => {
        actionController.setAction('loading');
    }
    audio.onwaiting = e => {
        actionController.setAction('loading');
    }

    const onAudioProgress = e => {
        scrubb.value = (audio.currentTime / audio.duration) * 100;
    }

    document.body.style.opacity = 1;
}