(() => {
  'use strict';
  const states = {
    suppressed: {label:'Suppressed reasoning',equation:'7.5n = 90 + 3n',solve:'4.5n = 90 → n = 20.',answer:'20',diagnosis:'The response subtracts yearly upkeep again from an already net income.',profit:'Actual profit at year 20: +$60'},
    original: {label:'Original reasoning',equation:'7.50n − 90 ≥ 0',solve:'n ≥ 12 → the response returns 12.',answer:'12',diagnosis:'The non-strict constraint permits break-even instead of requiring positive profit.',profit:'Actual profit at year 12: $0'},
    enhanced: {label:'Enhanced reasoning',equation:'7.50n − 90 > 0',solve:'n > 12 → the first whole-number year is 13.',answer:'13',diagnosis:'The strict positive-profit constraint is respected.',profit:'Actual profit at year 13: +$7.50'}
  };
  const panel = document.querySelector('.case-panel');
  document.querySelectorAll('[data-state]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.state;
      const state = states[key];
      if (!state) return;
      panel.dataset.active = key;
      Object.entries(state).forEach(([field,value]) => {
        const target = document.getElementById('state-' + field);
        if (target) target.textContent = value;
      });
      document.querySelectorAll('[data-state]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
  });
  const copy = document.getElementById('copy-citation');
  const status = document.getElementById('copy-status');
  copy.addEventListener('click', async () => {
    const citation = document.getElementById('bibtex').textContent;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(citation);
      status.textContent = 'Citation copied.';
    } catch (_) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('bibtex'));
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Citation selected. Press Ctrl+C (Windows) or Command+C (Mac) to copy.';
    }
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
      });
    }, {rootMargin:'-15% 0px -65% 0px'});
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
})();
