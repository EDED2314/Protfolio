(function () {
  const hero = document.getElementById('hero');
  const page = hero ? hero.nextElementSibling : null;
  const navbar = document.querySelector('.navbar');

  // Reset scroll position to top and hide content on page load if we have a hero
  if (hero && page && page.classList.contains('hidden')) {
    window.scrollTo(0, 0);
    page.style.display = 'none';
  }

  function scrollToElementWithOffset(element, offset) {
    if (!element) return;
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
  }

  function revealAndScroll(targetSelector) {
    if (!page) return;
    if (page.classList.contains('revealed')) {
      // already revealed - scroll with offset if target provided
      if (targetSelector) {
        const target = document.querySelector(targetSelector);
        if (target) {

          const navbarHeight = navbar ? navbar.offsetHeight : 0;
          scrollToElementWithOffset(target, navbarHeight);
        }
      }
      return;
    }

    page.style.display = 'block';
    page.classList.add('revealed');

    // after a short delay, scroll to target or page content with offset
    setTimeout(() => {
      if (targetSelector) {
        const target = document.querySelector(targetSelector);
        if (target) {
          const navbarHeight = navbar ? navbar.offsetHeight : 0;
          scrollToElementWithOffset(target, navbarHeight);
        }
      } else {
        // scroll to page content top with offset
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        scrollToElementWithOffset(page, navbarHeight);
      }
    }, 60);

    window.removeEventListener('wheel', onFirstScroll);
    window.removeEventListener('touchstart', onFirstScroll);
    window.removeEventListener('keydown', onFirstKey);
  }

  function onFirstScroll() { revealAndScroll(); }
  function onFirstKey(e) {
    if (e && (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ')) revealAndScroll();
  }

  window.addEventListener('wheel', onFirstScroll, { once: true, passive: true });
  window.addEventListener('touchstart', onFirstScroll, { once: true, passive: true });
  window.addEventListener('keydown', onFirstKey, { once: true });
})();
