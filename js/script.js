// ------------------------
// Navbar loader
// ------------------------
(function () {
  // Count folder depth
  const pathParts = window.location.pathname.split('/').filter(p => p); // remove empty parts
  depth = pathParts.length - 1; // number of folders deep

  if (window.location.pathname.includes('Protfolio')) {
    depth -= 1;
  }

  // Construct prefix for assets and index.html
  let prefix = '';
  for (let i = 0; i < depth; i++) prefix += '../';

  // Pick correct path to navbar.html
  const navbarPath = prefix + 'navbar.html';

  fetch(navbarPath)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(data => {
      // Fix relative links inside navbar
      if (prefix) {
        data = data.replaceAll('./assets/', prefix + 'assets/');
        data = data.replaceAll('./index.html', prefix + 'index.html');
      }
      // Inject into page
      document.getElementById('navbar-placeholder').innerHTML = data;
      // Notify listeners that navbar HTML has been injected (some code may need to re-measure)
      window.dispatchEvent(new Event('navbar:loaded'));
    })
    .catch(err => console.error('Failed to load navbar:', err));
})();


(function () {
  const hero = document.getElementById('hero');
  const page = hero ? hero.nextElementSibling : null;

  // Navbar may be injected asynchronously. Use helpers that query it on-demand.
  function getNavbar() {
    return document.querySelector('.navbar');
  }

  function getNavbarHeight() {
    const n = getNavbar();
    return n ? n.offsetHeight : 0;
  }

  function setNavVar() {
    document.documentElement.style.setProperty('--navbar-height', `${getNavbarHeight()}px`);
  }

  // Initialize and update on resize; also update when navbar HTML is injected
  setNavVar();
  window.addEventListener('resize', setNavVar);
  window.addEventListener('navbar:loaded', setNavVar);

  if (hero) {
    document.body.classList.add('has-hero');
  } else {
    document.body.classList.add('no-hero');
  }

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
      if (targetSelector) {
        const target = document.querySelector(targetSelector);
        if (target) {
          const navbarHeight = getNavbarHeight();
          scrollToElementWithOffset(target, navbarHeight);
        }
      }
      return;
    }

    page.style.display = 'block';
    page.classList.add('revealed');

    // allow the browser to render the revealed content then scroll
    // use two requestAnimationFrame calls to ensure layout/paint are complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (targetSelector) {
          const target = document.querySelector(targetSelector);
          if (target) {
            const navbarHeight = getNavbarHeight();
            scrollToElementWithOffset(target, navbarHeight);
          }
        } else {
          const navbarHeight = getNavbarHeight();
          scrollToElementWithOffset(page, navbarHeight);
        }
      });
    });

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


// ------------------------
// Skills data loader
// ------------------------
(function () {
  async function loadSkills() {
    let data;
    try {
      // Prefer fetching the JSON over HTTP(S).
      const res = await fetch('./assets/data/skills.json');
      data = await res.json();
    } catch (e) {
      try {
        const res = await fetch('../assets/data/skills.json');
        data = await res.json();
        console.warn('Initial Error', e);
      } catch (err) {
        console.error('FATAL ERROR', err);
      }
    }

    // Render skills UI on index page
    const skillsUi = document.getElementById('skills-ui');
    if (skillsUi && data.categories) {
      data.categories.forEach(cat => {
        const col = document.createElement('div');
        col.className = 'skills-category';

        const btn = document.createElement('button');
        btn.className = 'skills-category-button';
        btn.textContent = cat.name;
        btn.type = 'button';

        const panel = document.createElement('div');
        panel.className = 'skills-dropdown';

        (cat.items || []).forEach(it => {
          const a = document.createElement('a');
          a.className = 'skills-link';
          // link: project pages under project-pages, experiences anchor to index
          if (it.type === 'project') {
            a.href = `./project-pages/${it.target}.html`;
          } else {
            a.href = `#${it.target}`;
          }
          a.textContent = it.label;
          panel.appendChild(a);
        });

        btn.addEventListener('click', () => {
          panel.classList.toggle('open');
        });

        col.appendChild(btn);
        col.appendChild(panel);
        skillsUi.appendChild(col);
      });
    }

    // Helper to render skill pills
    function renderSkillPills(container, skills) {
      container.innerHTML = '';
      (skills || []).forEach(s => {
        const pill = document.createElement('div');
        pill.className = 'skill-pill';
        pill.textContent = s;
        container.appendChild(pill);
      });
    }

    // Render project page skills (full list)
    document.querySelectorAll('.project-skills[data-project]').forEach(el => {
      const key = el.getAttribute('data-project');
      const skills = data.projects && data.projects[key] ? data.projects[key] : (data.experiences && data.experiences[key] ? data.experiences[key] : []);
      renderSkillPills(el, skills);
    });

    // Render top-3 on project cards
    document.querySelectorAll('.project-card-skills[data-project]').forEach(el => {
      const key = el.getAttribute('data-project');
      const skills = data.projects && data.projects[key] ? data.projects[key] : [];
      renderSkillPills(el, skills.slice(0, 3));
    });
  }


  loadSkills();

})();

