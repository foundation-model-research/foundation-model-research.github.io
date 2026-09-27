(function(){
  'use strict';
  const catalog=new Map(window.MLDI_PAPER_MEDIA.map(m=>[m.id,m]));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function figure(id,{caption=true}={}){
    const m=catalog.get(id);if(!m)return '';
    if(id==='difflens')return `<figure class="paper-media difflens-media" data-paper-media="difflens"><div class="difflens-demo-grid"><div class="difflens-mechanism"><h4>Generative model</h4><img src="assets/paper-originals/difflens-ppt-mechanism.png" width="1568" height="1452" alt="Generative model with an identified internal feature" loading="lazy"/><div class="difflens-intervention" aria-hidden="true"></div></div><div class="difflens-example"><h4>Gender control</h4><video muted loop playsinline preload="metadata" poster="assets/paper-originals/difflens-ppt-gender-poster.jpg" aria-label="Original presentation animation: gender attribute control"><source src="assets/paper-originals/difflens-ppt-gender.mp4" type="video/mp4"></video></div><div class="difflens-example"><h4>Age control</h4><video muted loop playsinline preload="metadata" poster="assets/paper-originals/difflens-ppt-age-poster.jpg" aria-label="Original presentation animation: age attribute control"><source src="assets/paper-originals/difflens-ppt-age.mp4" type="video/mp4"></video></div></div><button class="difflens-play-all" type="button" aria-label="Play both DiffLens demonstrations">Play demos</button><figcaption><p>Scaling identified internal features steers generated attributes.</p><a href="https://foundation-model-research.github.io/difflens/" target="_blank" rel="noreferrer">DiffLens · CVPR 2025 · author’s presentation ↗</a></figcaption></figure>`;
    const label=m.type==='certificate'?'certificate':'figure';
    const content=m.type==='video'
      ? `<video controls muted loop playsinline preload="metadata" poster="${esc(m.poster)}" aria-label="${esc(m.alt)}"><source src="${esc(m.path)}" type="video/mp4"></video>`
      : `<button class="figure-open" data-media-id="${esc(id)}" type="button" aria-label="Enlarge ${esc(m.sourceFigure)}"><img src="${esc(m.path)}" alt="${esc(m.alt)}" ${m.width?`width="${m.width}" height="${m.height}"`:''} loading="lazy"/><span>Enlarge ${label} ↗</span></button>`;
    return `<figure class="paper-media ${m.type==='certificate'?'award-certificate':''}" data-paper-media="${esc(id)}">${content}<figcaption>${caption?`<p>${esc(m.caption||'')}</p>`:''}<a href="${esc(m.source)}" target="_blank" rel="noreferrer">${m.type==='certificate'?'Award certificate':m.type==='video'?'Original demo':'Original figure'} · ${esc(m.venue)} ↗</a></figcaption></figure>`;
  }
  function renderFrontier(host,key){
    host.className='frontier-visual frontier-originals';
    const ids={sequence:['verbalts'],foundation:['kairos'],agents:['kairos-agent'],interpretability:['miclip']}[key];
    host.innerHTML=ids.map(id=>figure(id,{caption:false})).join('');
  }
  function renderCards(host){
    host.innerHTML=window.MLDI_RESEARCH.map(p=>`<article class="paper-card" id="paper-${esc(p.id)}"><div class="paper-card-heading"><p class="paper-source">${esc(p.title)} · ${esc(p.venue)}</p><h3>${esc(p.headline)}</h3></div>${figure(p.id,{caption:false})}<div class="paper-card-copy"><p>${esc(p.summary)}</p><p class="paper-evidence">${esc(p.evidence)}</p><a class="text-link" href="${esc(p.url)}" target="_blank" rel="noreferrer">Read the paper &amp; project ↗</a></div></article>`).join('');
  }
  const dialog=document.querySelector('#figure-dialog');
  let trigger=null;
  document.addEventListener('click',e=>{
    const play=e.target.closest('.difflens-play-all');
    if(play){
      const videos=[...play.closest('figure').querySelectorAll('video')];
      if(videos.every(v=>!v.paused))videos.forEach(v=>v.pause());
      else Promise.all(videos.map(v=>v.play())).catch(()=>{play.textContent='Use video controls';});
      return;
    }
    const button=e.target.closest('[data-media-id]');if(!button)return;
    const m=catalog.get(button.dataset.mediaId);if(!m)return;
    trigger=button;dialog.querySelector('h2').textContent=m.sourceFigure;
    const img=dialog.querySelector('img');img.src=m.path;img.alt=m.alt;
    const link=dialog.querySelector('.figure-source');link.href=m.source;link.textContent=`Original source · ${m.venue} ↗`;
    dialog.classList.remove('actual-size');dialog.querySelector('[data-zoom]').setAttribute('aria-pressed','false');
    dialog.querySelector('[data-zoom]').textContent='Actual size';
    document.body.classList.add('figure-modal-open');dialog.showModal();
  });
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.querySelector('[data-zoom]').addEventListener('click',()=>{
    const active=dialog.classList.toggle('actual-size');const button=dialog.querySelector('[data-zoom]');
    button.setAttribute('aria-pressed',String(active));button.textContent=active?'Fit to screen':'Actual size';
  });
  dialog.addEventListener('close',()=>{document.body.classList.remove('figure-modal-open');trigger?.focus();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  function updateDemoControls(e){const figure=e.target.closest('.difflens-media');if(!figure)return;const active=[...figure.querySelectorAll('video')].every(v=>!v.paused);const button=figure.querySelector('.difflens-play-all');button.textContent=active?'Pause demos':'Play demos';button.setAttribute('aria-label',`${active?'Pause':'Play'} both DiffLens demonstrations`);}
  document.addEventListener('play',updateDemoControls,true);
  document.addEventListener('pause',updateDemoControls,true);
  document.querySelectorAll('[data-paper-static]').forEach(host=>host.innerHTML=figure(host.dataset.paperStatic,{caption:false}));
  window.MLDI_MEDIA={renderFrontier,renderCards};
})();
