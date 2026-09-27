(function () {
  "use strict";
  const data = window.MLDI_DATA;
  const header = document.querySelector('[data-header]');
  const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const filters = [...document.querySelectorAll('.filter')];
  const search = document.querySelector('#paper-search');
  const more = document.querySelector('#load-more');
  let activeFilter = 'all', limit = 16;
  function renderPapers() {
    const query = search.value.trim().toLowerCase();
    const results = data.papers.filter(p => (activeFilter === 'all' || p.tags.includes(activeFilter)) && `${p.title} ${p.venue} ${p.year}`.toLowerCase().includes(query));
    document.querySelector('#visible-count').textContent = results.length;
    document.querySelector('#paper-list').innerHTML = results.slice(0, limit).map(p => `<a class="paper-item" href="${p.url}" target="_blank" rel="noreferrer"><span class="paper-year">${p.year}</span><strong class="paper-title">${p.title}</strong><span class="paper-venue">${p.venue}</span><span class="paper-arrow" aria-hidden="true">↗</span></a>`).join('') || '<p class="empty-state">No work matches this search yet.</p>';
    more.hidden = limit >= results.length;
  }
  function activateFilter(value) {
    activeFilter = value; limit = 16;
    filters.forEach(button => { button.classList.toggle('is-active', button.dataset.filter === value); button.setAttribute('aria-pressed', String(button.dataset.filter === value)); });
    renderPapers();
  }
  filters.forEach(button => button.addEventListener('click', () => activateFilter(button.dataset.filter)));
  search.addEventListener('input', () => { limit = 16; renderPapers(); });
  more.addEventListener('click', () => { limit += 16; renderPapers(); });
  renderPapers();

  const tabs = [...document.querySelectorAll('.atlas-tab')];
  const panelLink = document.querySelector('#frontier-link');
  function setFrontier(key) {
    const frontier = data.frontiers[key];
    tabs.forEach(tab => {
      const selected = tab.dataset.frontier === key;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.id = `tab-${tab.dataset.frontier}`;
    });
    document.querySelector('#frontier-panel').setAttribute('aria-labelledby', `tab-${key}`);
    document.querySelector('#frontier-number').textContent = frontier.number;
    document.querySelector('#frontier-title').textContent = frontier.title;
    document.querySelector('#frontier-description').textContent = frontier.description;
    document.querySelector('#frontier-papers').innerHTML = frontier.papers.map(([title, venue]) => `<li><strong>${title}</strong> <span>· ${venue}</span></li>`).join('');
    const background = document.querySelector('#frontier-background');
    background.textContent = frontier.background || '';
    background.hidden = !frontier.background;
    document.querySelector('.frontier-related').open = false;
    panelLink.textContent = `${frontier.linkText} →`;
    panelLink.dataset.filterTarget = frontier.filter;
    window.MLDI_MEDIA.renderFrontier(document.querySelector('#frontier-visual'),key);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setFrontier(tab.dataset.frontier));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return;
      event.preventDefault(); setFrontier(tabs[next].dataset.frontier); tabs[next].focus();
    });
  });
  panelLink.addEventListener('click', () => activateFilter(panelLink.dataset.filterTarget));

  window.MLDI_MEDIA.renderCards(document.querySelector('#featured-grid'));
  setFrontier('sequence');

  const shareToast = document.querySelector('#share-toast');
  document.querySelector('#share-page').addEventListener('click', async () => {
    try {
      if (navigator.share) { await navigator.share({ title: document.title, text: document.querySelector('.hero-deck').textContent.trim(), url: location.href }); return; }
      await navigator.clipboard.writeText(location.href); shareToast.textContent = 'Link copied';
    } catch (error) {
      if (error?.name === 'AbortError') return;
      shareToast.textContent = 'Use the address bar to copy this page';
    }
    shareToast.classList.add('show'); setTimeout(() => shareToast.classList.remove('show'), 1800);
  });

  // The original abstract hero remains independent of the research explainers.
  const canvas = document.querySelector('#research-field'), ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, visible = true, frame = 0;
  const colors = ['#31d5df', '#f5ca52', '#ff5b45', '#b9df54'];
  function point(t, lane) { return { x: width * (.54 + t * .52), y: height * (.47 + Math.sin(t * 5.2 + lane * .9) * .12) + (lane - 1.5) * (54 + lane * 52) }; }
  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height);
    colors.forEach((color, lane) => {
      ctx.beginPath();
      for (let s = 0; s <= 80; s++) { const p = point(s / 80, lane); s ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
      ctx.strokeStyle = `${color}66`; ctx.lineWidth = 1; ctx.stroke();
      for (let s = 0; s < 14; s++) {
        const p = point((s / 14 + time * (.000035 + lane * .000006)) % 1, lane);
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5 + s % 4, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      }
    });
    frame = visible && !document.hidden && !reduced.matches ? requestAnimationFrame(draw) : 0;
  }
  function restart() { cancelAnimationFrame(frame); frame = 0; draw(); }
  new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height; canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); restart();
  }).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; restart(); }).observe(canvas);
  document.addEventListener('visibilitychange', restart);
  reduced.addEventListener('change', restart);
})();
