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

const headerImage = document.querySelector('.portfolio-header-image');

headerImage.addEventListener('mouseenter', () => {
  headerImage.src = './assets/images/smile.png';
});

headerImage.addEventListener('mouseleave', () => {
  headerImage.src = './assets/images/serious.png';
});

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
      // Fetch can fail when opening the page via file:// (CORS). Try a graceful fallback:
      console.warn('Could not load skills.json via fetch (likely opened over file://). Trying inline fallback.', e);
      const inline = document.getElementById('skills-data');
      if (inline) {
        try {
          data = JSON.parse(inline.textContent || inline.innerText);
        } catch (err) {
          console.warn('Failed to parse inline skills JSON', err);
          return;
        }
      } else {
        // No inline fallback present — abort but provide a helpful console message.
        console.warn('No inline skills fallback found. To load `assets/data/skills.json` you must serve the site over HTTP.\n' +
          'Quick options:\n' +
          '  - Run a local server from the project root (PowerShell): `python -m http.server 8000` then open http://localhost:8000/\n' +
          '  - Or use VS Code Live Server extension to serve the folder.');
        return;
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

  // // Run after load
  // if (document.readyState === 'loading') {
  //   document.addEventListener('DOMContentLoaded', loadSkills);
  // } else {
  loadSkills();

})();