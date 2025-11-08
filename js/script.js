(function () {
  const hero = document.getElementById('hero');
  // Only apply reveal animations if we have a hero section
  const page = hero ? hero.nextElementSibling : null;
  const myWorkLink = document.getElementById('my-work-link');

  function revealAndScroll(targetSelector) {
    if (!page) return;
    if (page.classList.contains('revealed')) {
      // already revealed - just scroll to target if provided
      if (targetSelector) {
        const t = document.querySelector(targetSelector);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // show the page content and animate
    page.style.display = 'block';
    // trigger reflow so the animation class takes effect
    // eslint-disable-next-line no-unused-expressions
    void page.offsetWidth;
    page.classList.add('revealed');

    // after a short delay, scroll to the target (or page content)
    setTimeout(() => {
      if (targetSelector) {
        const t = document.querySelector(targetSelector);
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      } else {
        page.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);

    // remove global listeners (cleanup)
    window.removeEventListener('wheel', onFirstScroll);
    window.removeEventListener('touchstart', onFirstScroll);
    window.removeEventListener('keydown', onFirstKey);
  }

  function onFirstScroll() { revealAndScroll(); }
  function onFirstKey(e) {
    if (e && (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ')) revealAndScroll();
  }

  // reveal when user scrolls, touches, or presses down key
  window.addEventListener('wheel', onFirstScroll, { once: true, passive: true });
  window.addEventListener('touchstart', onFirstScroll, { once: true, passive: true });
  window.addEventListener('keydown', onFirstKey, { once: true });

  // if (myWorkLink) {
  //   myWorkLink.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     // reveal and scroll to my-work-section
  //     revealAndScroll('#my-work-section');
  //   });
  // }
})();
