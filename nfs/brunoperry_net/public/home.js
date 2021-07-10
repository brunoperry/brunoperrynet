window.onload = () => {
    document.body.style.opacity = 1;
    document.querySelector('#home-container').style.transform = 'scale(1)';

    const apps = Array.from(document.querySelectorAll('a'));
    const rnd = apps.sort(() => Math.random() - 0.5);

    if (apps.length === 0) return;

    let i = 0;
    let intervalID = setInterval(() => {
        const app = rnd[i];
        app.style.transform = 'scale(1)';
        app.style.opacity = 1;
        i++;
        if (i === apps.length) clearInterval(intervalID);
    }, 50);
}

const onFolderClick = folder => {
    console.log('folder', folder);
}