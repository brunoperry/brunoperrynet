window.onload = () => {
    document.body.style.opacity = 1;
    document.querySelector('#login-container').style.transform = 'scale(1)';
    setTimeout(() => {
        const ac = document.querySelector('.actions-container');
        ac.style.transform = 'translateY(0)';
        ac.style.opacity = 1;
    }, 100)
}