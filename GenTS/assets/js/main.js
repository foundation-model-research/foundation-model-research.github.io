(() => {
  'use strict';
  document.documentElement.classList.add('js');

  const menu = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav-links');
  function closeMenu() {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  }
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });

  // The full benchmark remains readable without JavaScript.
  const resultTabs = [...document.querySelectorAll('[data-result]')];
  const tabList = resultTabs[0].parentElement;
  tabList.setAttribute('role', 'tablist');
  function selectResult(selected, focus = false) {
    resultTabs.forEach(tab => {
      const active = tab === selected;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(`results-${tab.dataset.result}`).hidden = !active;
    });
    if (focus) selected.focus();
  }
  resultTabs.forEach((tab, index) => {
    const panel = document.getElementById(`results-${tab.dataset.result}`);
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    tab.addEventListener('click', () => selectResult(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % resultTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + resultTabs.length) % resultTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = resultTabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectResult(resultTabs[next], true);
      }
    });
  });
  selectResult(resultTabs[0]);

  const caseButtons = [...document.querySelectorAll('[data-case]')];
  caseButtons.forEach(button => button.addEventListener('click', () => {
    caseButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const name = button.textContent;
    document.getElementById('case-name').textContent = name;
    const image = document.getElementById('case-image');
    image.src = `assets/images/case-${button.dataset.case}.webp`;
    image.alt = `${name}: forecasting, generation and editing examples from the paper.`;
  }));

  const copyButton = document.getElementById('copy-citation');
  const status = document.querySelector('.copy-status');
  copyButton.addEventListener('click', async () => {
    const citation = document.getElementById('bibtex').textContent;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(citation);
      status.textContent = 'Citation copied.';
    } catch (_) {
      // Supports local file previews and browsers without clipboard permission.
      const textarea = document.createElement('textarea');
      textarea.value = citation;
      textarea.style.cssText = 'position:fixed;top:0;left:-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { /* Manual selection below. */ }
      textarea.remove();
      copyButton.focus();
      if (copied) status.textContent = 'Citation copied.';
      else {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(document.getElementById('bibtex'));
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = 'Citation selected. Press Ctrl+C / ⌘C, or download the BibTeX file.';
      }
    }
  });

  if ('IntersectionObserver' in window) {
    const navLinks = [...nav.querySelectorAll('a')];
    const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-12% 0px -62% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
    const heroObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      });
    }, { threshold: 0.7 });
    heroObserver.observe(document.getElementById('home'));
  }

  // An abstract field of temporal trajectories, rendered locally with no assets.
  const canvas = document.getElementById('signal-field');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, previous = 0;
  let visible = true;
  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const phase = time * 0.00009;
    for (let band = 0; band < 2; band++) {
      for (let line = 0; line < 14; line++) {
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(101,227,214,0.02)');
        gradient.addColorStop(0.18, 'rgba(101,227,214,0.18)');
        gradient.addColorStop(0.5, 'rgba(131,184,255,0.025)');
        gradient.addColorStop(0.83, 'rgba(180,154,255,0.18)');
        gradient.addColorStop(1, 'rgba(180,154,255,0.02)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = line % 5 === 0 ? 1.1 : 0.65;
        ctx.beginPath();
        for (let x = -5; x <= width + 5; x += 7) {
          const u = x / width;
          const envelope = 30 + Math.abs(u - 0.5) * 145;
          const y = 235 + band * 380 + line * 8 +
            Math.sin(u * 10 + phase + line * 0.075 + band * 2) * envelope +
            Math.cos(u * 18 - phase * 0.5 + line * 0.06) * 18;
          if (x === -5) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(0);
  }
  function tick(time) {
    if (time - previous > 45) { draw(time); previous = time; }
    frame = requestAnimationFrame(tick);
  }
  function syncAnimation() {
    cancelAnimationFrame(frame);
    if (!reducedMotion.matches && !document.hidden && visible) frame = requestAnimationFrame(tick);
    else if (reducedMotion.matches) draw(0);
  }
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', syncAnimation);
  reducedMotion.addEventListener('change', syncAnimation);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncAnimation();
    }).observe(canvas);
  }
  resize();
  syncAnimation();
})();
