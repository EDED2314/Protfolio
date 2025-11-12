// ------------------------
// Header image changer lol
// ------------------------
(function () {
    const headerImage = document.querySelector('.portfolio-header-image');

    if (headerImage) {
        headerImage.addEventListener('mouseenter', () => {
            headerImage.src = './assets/images/smile.png';
        });

        headerImage.addEventListener('mouseleave', () => {
            headerImage.src = './assets/images/serious.png';
        });
    }
})();
