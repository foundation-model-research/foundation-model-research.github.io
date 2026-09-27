// Progressive enhancement for public contact and collaborator information.
// Address fragments discourage simple HTML harvesting; they are not a security boundary.
(() => {
  const contact = document.querySelector('#pi-contact');
  if (contact) {
    const parts = [[114, 101, 110, 107, 97, 110], [115, 104, 97, 110, 103, 104, 97, 105, 116, 101, 99, 104], [101, 100, 117], [99, 110]];
    const addressLength = parts.reduce((length, part) => length + part.length, parts.length - 1);
    const decode = () => parts.map(p => String.fromCharCode(...p)).reduce((a, p, i) => a + (i === 1 ? '@' : '.') + p);
    const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
    const scramble = () => Array.from({ length: addressLength }, (_, i) => i === 6 ? '·' : alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    contact.classList.add('pi-contact');
    // Keep the masked and revealed addresses in the same right-aligned slot.
    contact.style.setProperty('--contact-address-width', addressLength + 'ch');
    contact.innerHTML = '<button class="pi-contact-reveal" type="button" aria-label="Reveal email address"><span class="pi-contact-label">Email</span><span id="pi-contact-value" class="pi-contact-value" aria-hidden="true"></span></button><span class="pi-contact-help">Hover, focus or tap to reveal</span><button class="pi-contact-copy" type="button" hidden>Copy address</button><span class="pi-contact-status" role="status"></span>';
    const trigger = contact.querySelector('.pi-contact-reveal');
    const value = contact.querySelector('.pi-contact-value');
    const help = contact.querySelector('.pi-contact-help');
    const copy = contact.querySelector('.pi-contact-copy');
    const status = contact.querySelector('.pi-contact-status');
    let revealed = false;
    let touchPrimed = false;
    let latestPointer = '';

    function reveal() {
      revealed = true;
      value.textContent = decode();
      value.removeAttribute('aria-hidden');
      trigger.setAttribute('aria-label', 'Open email application');
      trigger.setAttribute('aria-describedby', 'pi-contact-value');
      help.textContent = 'Select the address to email';
      copy.hidden = false;
    }

    function conceal() {
      revealed = false;
      touchPrimed = false;
      value.textContent = scramble();
      value.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-label', 'Reveal email address');
      trigger.removeAttribute('aria-describedby');
      help.textContent = 'Hover, focus or tap to reveal';
      copy.hidden = true;
      status.textContent = '';
    }

    contact.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') reveal();
    });
    contact.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'touch') conceal();
    });
    trigger.addEventListener('pointerdown', event => { latestPointer = event.pointerType; });
    contact.addEventListener('focusin', reveal);
    contact.addEventListener('focusout', event => {
      if (!contact.contains(event.relatedTarget)) conceal();
    });
    trigger.addEventListener('click', event => {
      // Touch focus may reveal before click; still require a second tap to compose.
      if (event.detail !== 0 && latestPointer === 'touch' && !touchPrimed) {
        touchPrimed = true;
        reveal();
        return;
      }
      if (!revealed) {
        reveal();
        return;
      }
      window.location.href = 'mailto:' + decode();
    });
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(decode());
        if (revealed) status.textContent = 'Copied';
      } catch {
        status.textContent = 'Select and copy the address above.';
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!contact.contains(event.target)) conceal();
    });
    contact.addEventListener('keydown', event => {
      if (event.key === 'Escape') conceal();
    });
    window.addEventListener('blur', conceal);
    conceal();
  }

  const strip = document.querySelector('#partner-strip');
  if (strip) {
    const names = [
      'Beijing Institute for General Artificial Intelligence (BIGAI)',
      'Microsoft Research Asia',
      'Ant Group',
      'ByteDance',
      'Meituan',
      'University of Illinois Urbana-Champaign',
      'Fudan University',
      'Shanghai Jiao Tong University',
      'University College London (UCL)',
      'Tencent',
      'Meta'
    ];
    strip.classList.add('partner-strip');
    strip.setAttribute('aria-labelledby', 'partner-strip-title');
    strip.innerHTML = '<div class="partner-heading"><h3 id="partner-strip-title">Collaborators</h3><button class="partner-pause" type="button" aria-label="Pause collaborator names" aria-pressed="false">Pause</button></div><div class="partner-window"><div class="partner-track"></div></div>';
    const track = strip.querySelector('.partner-track');
    const list = document.createElement('ul');
    list.className = 'partner-names';
    names.forEach(name => {
      const item = document.createElement('li');
      item.textContent = name;
      list.append(item);
    });
    const duplicate = list.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.setAttribute('inert', '');
    track.append(list, duplicate);
    const pause = strip.querySelector('.partner-pause');
    pause.addEventListener('click', () => {
      const paused = strip.classList.toggle('is-paused');
      pause.setAttribute('aria-pressed', String(paused));
      pause.setAttribute('aria-label', (paused ? 'Resume' : 'Pause') + ' collaborator names');
      pause.textContent = paused ? 'Resume' : 'Pause';
    });
  }
})();
