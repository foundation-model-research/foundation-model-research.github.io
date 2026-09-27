(() => {
  'use strict';

  const root = document.documentElement;
  const lightbox = document.createElement('div');
  lightbox.className = 'project-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-labelledby', 'project-figure-title');
  lightbox.innerHTML = `
    <div class="project-lightbox-panel">
      <div class="project-lightbox-toolbar">
        <h2 class="project-lightbox-title" id="project-figure-title"></h2>
        <div class="project-lightbox-actions">
          <a class="project-lightbox-original" target="_blank" rel="noopener noreferrer">Open original</a>
          <button class="project-lightbox-close" type="button" aria-label="Close image">Close <span aria-hidden="true">&times;</span></button>
        </div>
      </div>
      <div class="project-lightbox-scroll">
        <img class="project-lightbox-image" alt="">
        <p class="project-lightbox-status" role="status"></p>
      </div>
    </div>`;
  document.body.appendChild(lightbox);

  const image = lightbox.querySelector('img');
  const title = lightbox.querySelector('h2');
  const original = lightbox.querySelector('a');
  const closeButton = lightbox.querySelector('button');
  const status = lightbox.querySelector('[role="status"]');
  let trigger = null;
  let background = [];

  function closeFigure() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    root.classList.remove('project-modal-open');
    background.forEach(({ element, hidden, inert }) => {
      if (hidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', hidden);
      element.inert = inert;
    });
    background = [];
    trigger.focus({ preventScroll: true });
  }

  document.querySelectorAll('.figure a[href]').forEach((link) => {
    const thumbnail = link.querySelector('img');
    if (!thumbnail) return;
    link.classList.add('project-figure-link');
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      // Preserve the browser's modified-click and new-tab behavior.
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      title.textContent = thumbnail.alt || 'Figure preview';
      image.alt = thumbnail.alt;
      original.href = link.href;
      status.textContent = 'Loading image…';
      image.onload = () => { status.textContent = ''; };
      image.onerror = () => { status.textContent = 'Unable to load the preview. Use Open original to view the image.'; };
      image.src = link.href;
      lightbox.hidden = false;
      root.classList.add('project-modal-open');
      lightbox.querySelector('.project-lightbox-scroll').scrollTop = 0;
      closeButton.focus({ preventScroll: true });
      background = Array.from(document.body.children)
        .filter((element) => element !== lightbox && !['SCRIPT', 'STYLE'].includes(element.tagName))
        .map((element) => {
          const saved = { element, hidden: element.getAttribute('aria-hidden'), inert: element.inert };
          element.setAttribute('aria-hidden', 'true');
          element.inert = true;
          return saved;
        });
    });
  });

  closeButton.addEventListener('click', closeFigure);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeFigure();
  });
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeFigure();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      (document.activeElement === closeButton ? original : closeButton).focus();
    }
  });
  document.addEventListener('focusin', (event) => {
    if (!lightbox.hidden && !lightbox.contains(event.target)) closeButton.focus();
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window) || reducedMotion.matches) return;

  // Observe individual content blocks so long sections never wait to be fully visible.
  const items = document.querySelectorAll(
    '.hero .publication-title, .hero .publication-venue, .hero .hero-summary, ' +
    'main h2, main .section-lead, main .figure, main .abstract-copy, ' +
    'main .method-card, main .impact-card, main .download-panel, ' +
    'main .selected-citations, main .metric-grid, main .table-container, main .bibtex-box'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

  items.forEach((element) => {
    element.classList.add('project-reveal');
    observer.observe(element);
  });
  document.addEventListener('focusin', (event) => {
    const element = event.target.closest('.project-reveal');
    if (element) {
      element.classList.add('is-visible');
      observer.unobserve(element);
    }
  });
  function disableMotion(event) {
    if (!event.matches) return;
    observer.disconnect();
    items.forEach((element) => element.classList.add('is-visible'));
  }
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', disableMotion);
  else reducedMotion.addListener(disableMotion);
})();
