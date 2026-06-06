// form_controls.js — Contrôles de saisie avancés

document.addEventListener('DOMContentLoaded', function() {

  /* ═══════════════════════════════════════════════════════
     1. AUTOCOMPLETE GÉNÉRIQUE
     ═══════════════════════════════════════════════════════ */
  function makeAutocomplete(inputEl, getData, renderItem, onSelect, opts={}) {
    if (!inputEl) return;
    const wrap = inputEl.closest('.ac-wrap') || inputEl.parentElement;
    const drop = document.createElement('ul');
    drop.className = 'ac-drop';
    wrap.style.position = 'relative';
    wrap.appendChild(drop);
    let focIdx = -1;

    function normalize(s) {
      return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    }

    function render(q) {
      drop.innerHTML = ''; focIdx = -1;
      if (!q && !opts.showOnFocus) { drop.classList.remove('show'); return; }
      const matches = getData(normalize(q));
      if (!matches.length) {
        drop.innerHTML = '<li class="ac-empty"><i class="fas fa-search me-2"></i>Aucun résultat pour « '+q+' »</li>';
        drop.classList.add('show'); return;
      }
      matches.slice(0,12).forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'ac-item';
        li.dataset.idx = i;
        li.innerHTML = renderItem(item, q);
        li.addEventListener('mousedown', e => {
          e.preventDefault();
          onSelect(item, inputEl);
          drop.classList.remove('show');
        });
        drop.appendChild(li);
      });
      drop.classList.add('show');
    }

    inputEl.addEventListener('input', () => render(inputEl.value.trim()));
    inputEl.addEventListener('focus', () => {
      if (opts.showOnFocus || inputEl.value.trim()) render(inputEl.value.trim());
    });
    inputEl.addEventListener('blur', () => setTimeout(() => drop.classList.remove('show'), 180));
    inputEl.addEventListener('keydown', e => {
      const items = drop.querySelectorAll('.ac-item');
      if (!items.length) return;
      if (e.key==='ArrowDown'){ e.preventDefault(); focIdx=Math.min(focIdx+1,items.length-1); items.forEach((it,i)=>it.classList.toggle('ac-focused',i===focIdx)); items[focIdx]?.scrollIntoView({block:'nearest'}); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); focIdx=Math.max(focIdx-1,0); items.forEach((it,i)=>it.classList.toggle('ac-focused',i===focIdx)); }
      else if(e.key==='Enter'&&focIdx>=0){ e.preventDefault(); items[focIdx].dispatchEvent(new Event('mousedown')); }
      else if(e.key==='Escape'){ drop.classList.remove('show'); }
    });
    return { refresh: () => render(inputEl.value.trim()) };
  }

  function hl(text, q) { // highlight matching
    if (!q) return text;
    const n = (text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const nq = q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const i = n.indexOf(nq);
    if (i < 0) return text;
    return text.substring(0,i)+'<mark>'+text.substring(i,i+q.length)+'</mark>'+text.substring(i+q.length);
  }

  /* ═══════════════════════════════════════════════════════
     2. SÉLECTEUR PAYS avec indicatif téléphonique
     ═══════════════════════════════════════════════════════ */
  function initPaysSelect(inputId, onChoose) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    inp.setAttribute('readonly','readonly');
    inp.style.cursor='pointer';
    inp.placeholder='Cliquer pour choisir un pays…';

    function getData(q) {
      return q ? PAYS_REF.filter(p =>
        p.nom.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)
      ) : PAYS_REF;
    }

    makeAutocomplete(inp, getData,
      (p, q) => `<span class="ac-flag">${p.flag}</span> <span>${hl(p.nom, q)}</span> <small class="ms-auto text-muted">${p.indicatif}</small>`,
      (p) => { inp.value = p.nom; inp.dataset.indicatif = p.indicatif; inp.dataset.flag = p.flag; if(onChoose) onChoose(p); setValid(inp,true); },
      { showOnFocus: true }
    );

    inp.addEventListener('focus', function() { this.removeAttribute('readonly'); });
    inp.addEventListener('blur', function() {
      setTimeout(() => {
        const found = PAYS_REF.find(p => p.nom.toLowerCase() === this.value.toLowerCase().trim());
        if (found) { this.value = found.nom; setValid(this,true); if(onChoose) onChoose(found); }
        else if (this.value.trim()) setValid(this, false);
        this.setAttribute('readonly','readonly');
      }, 200);
    });
  }

  /* ═══════════════════════════════════════════════════════
     3. TÉLÉPHONE AVEC INDICATIF
     ═══════════════════════════════════════════════════════ */
  function initTelephone(wrapId, opts={}) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;

    const flagEl  = wrap.querySelector('.tel-flag');
    const indEl   = wrap.querySelector('.tel-indicatif');
    const numEl   = wrap.querySelector('.tel-number');
    const hidEl   = wrap.querySelector('.tel-hidden');
    const dropEl  = wrap.querySelector('.tel-drop');
    const fbEl    = wrap.querySelector('.tel-fb');

    // Initialiser avec Sénégal
    let current = PAYS_REF[0]; // Sénégal
    setIndicatif(current);

    // Ouvrir dropdown pays
    const prefix = wrap.querySelector('.tel-prefix');
    if(prefix) {
      prefix.addEventListener('click', () => {
        dropEl.classList.toggle('show');
        const searchEl = dropEl.querySelector('.tel-search');
        if(searchEl && dropEl.classList.contains('show')) { searchEl.value=''; renderTelDrop(''); searchEl.focus(); }
      });
    }

    function renderTelDrop(q) {
      const list = dropEl.querySelector('.tel-list');
      const norm = (q||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      const matches = norm ? PAYS_REF.filter(p=>p.nom.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(norm)) : PAYS_REF;
      list.innerHTML = matches.slice(0,20).map(p=>`
        <li class="tel-item" data-nom="${p.nom}" data-ind="${p.indicatif}" data-flag="${p.flag}">
          <span>${p.flag}</span>
          <span class="tel-item-nom">${hl(p.nom,q)}</span>
          <small class="ms-auto">${p.indicatif}</small>
        </li>`).join('');
      list.querySelectorAll('.tel-item').forEach(li=>{
        li.addEventListener('click',()=>{
          const p = PAYS_REF.find(x=>x.nom===li.dataset.nom);
          if(p){ setIndicatif(p); dropEl.classList.remove('show'); validate(); }
        });
      });
    }

    const searchEl = dropEl?.querySelector('.tel-search');
    if(searchEl) searchEl.addEventListener('input',()=>renderTelDrop(searchEl.value));
    renderTelDrop('');

    document.addEventListener('click', e=>{
      if(!wrap.contains(e.target)) dropEl?.classList.remove('show');
    });

    function setIndicatif(p) {
      current = p;
      if(flagEl) flagEl.textContent = p.flag;
      if(indEl)  indEl.textContent  = p.indicatif;
      updateHidden();
    }

    // Saisie du numéro — chiffres + espaces uniquement
    if(numEl) {
      numEl.addEventListener('keypress', e=>{
        if(!/[\d\s]/.test(e.key)) e.preventDefault();
      });
      numEl.addEventListener('input', function(){
        // Format automatique XX XXX XX XX
        let raw = this.value.replace(/\D/g,'').substring(0,9);
        let fmt = raw.replace(/(\d{2})(\d{3})?(\d{2})?(\d{2})?/,(m,a,b,c,d)=>[a,b,c,d].filter(Boolean).join(' '));
        this.value = fmt;
        updateHidden();
        validate();
      });
      numEl.addEventListener('blur', validate);
    }

    function updateHidden() {
      if(hidEl) hidEl.value = current.indicatif + (numEl?.value||'').replace(/\s/g,'');
    }

    function validate() {
      if (!fbEl) return;
      const raw = (numEl?.value||'').replace(/\s/g,'');
      if (!raw) { fbEl.className='f-fb'; fbEl.innerHTML=''; setValid(numEl,null); return; }
      // Sénégal: commence par 7 et 9 chiffres
      if (current.indicatif==='+221') {
        const ok = /^[0-9]{9}$/.test(raw) && ['70','75','76','77','78','33','30','31','32'].some(p=>raw.startsWith(p.replace('0','')||p));
        const ok2 = /^[0-9]{9}$/.test(raw);
        if(ok2){ fbEl.innerHTML='<i class="fas fa-check-circle me-1"></i>Numéro valide'; fbEl.className='f-fb ok'; setValid(numEl,true); }
        else { fbEl.innerHTML='<i class="fas fa-times-circle me-1"></i>9 chiffres requis pour le Sénégal'; fbEl.className='f-fb err'; setValid(numEl,false); }
      } else {
        const ok = raw.length >= 6 && raw.length <= 12;
        fbEl.innerHTML = ok ? '<i class="fas fa-check-circle me-1"></i>Numéro saisi' : '<i class="fas fa-times-circle me-1"></i>Numéro trop court';
        fbEl.className = 'f-fb '+(ok?'ok':'err');
        setValid(numEl, ok);
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     4. RÉGION / DÉPARTEMENT SÉNÉGAL
     ═══════════════════════════════════════════════════════ */
  function initRegionDept(regionId, deptId) {
    const regEl  = document.getElementById(regionId);
    const deptEl = document.getElementById(deptId);
    if (!regEl || !deptEl) return;

    regEl.innerHTML = '<option value="">— Choisir la région —</option>' +
      REGIONS_SN.map(r=>`<option value="${r.region}">${r.region}</option>`).join('');

    regEl.addEventListener('change', function() {
      const r = REGIONS_SN.find(x=>x.region===this.value);
      deptEl.innerHTML = '<option value="">— Choisir le département —</option>';
      if(r) r.departements.forEach(d=>{ const o=document.createElement('option'); o.value=d; o.textContent=d; deptEl.appendChild(o); });
      deptEl.disabled = !r;
    });

    // Pré-remplir si valeurs existantes
    const defReg = regEl.dataset.value;
    const defDept = deptEl.dataset.value;
    if(defReg) { regEl.value=defReg; regEl.dispatchEvent(new Event('change')); if(defDept) setTimeout(()=>{ deptEl.value=defDept; },50); }
  }

  /* ═══════════════════════════════════════════════════════
     5. NINEA — validation stricte
     ═══════════════════════════════════════════════════════ */
  function initNINEA(inputId, fbId) {
    const inp = document.getElementById(inputId);
    const fb  = document.getElementById(fbId);
    if(!inp) return;

    inp.setAttribute('maxlength','13');
    inp.setAttribute('placeholder','Ex : 0043385142U2');

    inp.addEventListener('input', function(){
      this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
      const v = this.value;
      if(!v){ clearFb(fb); setValid(inp,null); return; }
      const ok = /^\d{10}[A-Z]{1,2}\d?$/.test(v);
      if(v.length < 11) { showFb(fb,null,`${11-v.length} caractère(s) manquant(s)`); setValid(inp,null); }
      else if(ok){ showFb(fb,true,'✓ Format NINEA valide'); setValid(inp,true); }
      else { showFb(fb,false,'Format invalide — attendu : 10 chiffres + 1-2 lettres (ex: 0043385142U2)'); setValid(inp,false); }
    });
  }

  /* ═══════════════════════════════════════════════════════
     6. CNI — 13 chiffres exacts
     ═══════════════════════════════════════════════════════ */
  function initCNI(inputId, counterId, fbId) {
    const inp = document.getElementById(inputId);
    const ctr = document.getElementById(counterId);
    const fb  = document.getElementById(fbId);
    if(!inp) return;

    inp.setAttribute('maxlength','13');
    inp.setAttribute('inputmode','numeric');
    inp.setAttribute('placeholder','13 chiffres ex: 1234567890123');

    inp.addEventListener('keypress', e=>{if(!/\d/.test(e.key)) e.preventDefault();});
    inp.addEventListener('paste', e=>{
      e.preventDefault();
      const txt = (e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').substring(0,13);
      inp.value = txt; inp.dispatchEvent(new Event('input'));
    });
    inp.addEventListener('input', function(){
      this.value = this.value.replace(/\D/g,'').substring(0,13);
      const n = this.value.length;
      if(ctr){ ctr.textContent=`${n}/13`; ctr.className='char-ctr'+(n===13?' done':n>0?' warn':''); }
      if(!n){ clearFb(fb); setValid(inp,null); return; }
      if(n===13){ showFb(fb,true,'✓ CNI valide — 13 chiffres'); setValid(inp,true); }
      else { showFb(fb,false,`${13-n} chiffre(s) manquant(s)`); setValid(inp,false); }
    });
  }

  /* ═══════════════════════════════════════════════════════
     7. PASSEPORT
     ═══════════════════════════════════════════════════════ */
  function initPasseport(inputId) {
    const inp = document.getElementById(inputId);
    if(!inp) return;
    inp.setAttribute('maxlength','20');
    inp.setAttribute('placeholder','Ex : AB1234567');
    inp.addEventListener('input',function(){ this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,''); });
  }

  /* ═══════════════════════════════════════════════════════
     8. NATIONALITÉ autocomplete
     ═══════════════════════════════════════════════════════ */
  function initNationalite(inputId) {
    const inp = document.getElementById(inputId);
    if(!inp) return;
    inp.setAttribute('placeholder','Taper pour chercher…');
    inp.setAttribute('autocomplete','off');
    // add ac-wrap class to parent if needed
    if(!inp.closest('.ac-wrap')) { const w=inp.parentElement; w.classList.add('ac-wrap'); w.style.position='relative'; }

    makeAutocomplete(inp,
      q => q ? PAYS_REF.filter(p=>p.nat.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)) : PAYS_REF,
      (p,q)=>`<span class="ac-flag">${p.flag}</span> <span>${hl(p.nat,q)}</span>`,
      (p)=>{ inp.value=p.nat; setValid(inp,true); },
      {showOnFocus:true}
    );
  }

  /* ═══════════════════════════════════════════════════════
     9. EMAIL
     ═══════════════════════════════════════════════════════ */
  function initEmail(inputId, fbId) {
    const inp = document.getElementById(inputId);
    const fb  = document.getElementById(fbId);
    if(!inp) return;
    inp.addEventListener('blur',function(){
      const v=this.value.trim();
      if(!v){ clearFb(fb); setValid(inp,null); return; }
      const ok=/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v);
      showFb(fb,ok,ok?'✓ Email valide':'Format invalide — ex: nom@domaine.sn');
      setValid(inp,ok);
    });
  }

  /* ═══════════════════════════════════════════════════════
     10. POURCENTAGE 2–100
     ═══════════════════════════════════════════════════════ */
  function initPourcentage(inputId, fbId) {
    const inp = document.getElementById(inputId);
    const fb  = document.getElementById(fbId);
    if(!inp) return;
    inp.setAttribute('min','2'); inp.setAttribute('max','100'); inp.setAttribute('step','0.01');
    inp.addEventListener('input',function(){
      const v=parseFloat(this.value);
      if(this.value===''){ clearFb(fb); setValid(inp,null); return; }
      if(isNaN(v)||v<2){ showFb(fb,false,'Minimum 2%'); setValid(inp,false); }
      else if(v>100){ this.value=100; showFb(fb,true,'✓ 100%'); setValid(inp,true); }
      else{ showFb(fb,true,`✓ ${v}%`); setValid(inp,true); }
    });
    inp.addEventListener('blur',function(){
      if(this.value&&parseFloat(this.value)<2){ this.value=2; showFb(fb,true,'✓ 2%'); setValid(inp,true); }
    });
  }

  /* ═══════════════════════════════════════════════════════
     11. NOMBRE ENTIER >= 0
     ═══════════════════════════════════════════════════════ */
  function initNombrePositif(inputId) {
    const inp=document.getElementById(inputId);
    if(!inp) return;
    inp.setAttribute('min','0'); inp.setAttribute('inputmode','numeric');
    inp.addEventListener('keypress',e=>{if(!/[\d]/.test(e.key))e.preventDefault();});
    inp.addEventListener('input',function(){ if(this.value&&parseInt(this.value)<0)this.value=0; });
  }

  /* ═══════════════════════════════════════════════════════
     12. DATE MAX = AUJOURD'HUI
     ═══════════════════════════════════════════════════════ */
  function initDateNaissance(inputId,fbId){
    const inp=document.getElementById(inputId);
    const fb=document.getElementById(fbId);
    if(!inp) return;
    const today=new Date().toISOString().split('T')[0];
    inp.setAttribute('max',today);
    inp.addEventListener('change',function(){
      if(!this.value){clearFb(fb);setValid(inp,null);return;}
      const age = Math.floor((new Date()-new Date(this.value))/31557600000);
      if(new Date(this.value)>=new Date()){showFb(fb,false,"Date invalide : doit être antérieure à aujourd'hui");setValid(inp,false);}
      else if(age>120){showFb(fb,false,"Âge supérieur à 120 ans — vérifier");setValid(inp,false);}
      else if(age<18){showFb(fb,null,`ℹ️ Personne de ${age} ans — vérifier si cohérent`);setValid(inp,null);}
      else{showFb(fb,true,`✓ Âge : ${age} ans`);setValid(inp,true);}
    });
  }

  /* ═══════════════════════════════════════════════════════
     13. PILLS RADIO
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('.pill-group').forEach(group=>{
    const toggleId = group.dataset.toggle;
    group.querySelectorAll('input[type=radio]').forEach(r=>{
      r.addEventListener('change',function(){
        group.querySelectorAll('.pill-lbl').forEach(l=>l.className='pill-lbl');
        const lbl=this.closest('.pill-lbl');
        if(this.value==='Oui') lbl.classList.add('p-yes');
        else if(this.value==='Non') lbl.classList.add('p-no');
        else lbl.classList.add('p-nr');
        if(toggleId){
          const t=document.getElementById(toggleId);
          if(t) t.classList.toggle('d-none',this.value!=='Oui');
        }
      });
      // Init état visuel au chargement
      if(r.checked) r.dispatchEvent(new Event('change'));
    });
  });

  /* ═══════════════════════════════════════════════════════
     14. UPLOAD FICHIERS
     ═══════════════════════════════════════════════════════ */
  const fileInput  = document.getElementById('file-input');
  const fileList   = document.getElementById('file-list');
  const uploadZone = document.getElementById('upload-zone');
  if(fileInput&&uploadZone){
    fileInput.addEventListener('change',renderFiles);
    ['dragover','dragenter'].forEach(ev=>uploadZone.addEventListener(ev,e=>{e.preventDefault();uploadZone.classList.add('drag-over');}));
    ['dragleave','dragend'].forEach(ev=>uploadZone.addEventListener(ev,()=>uploadZone.classList.remove('drag-over')));
    uploadZone.addEventListener('drop',e=>{e.preventDefault();uploadZone.classList.remove('drag-over');fileInput.files=e.dataTransfer.files;renderFiles();});
  }
  function renderFiles(){
    if(!fileList)return;
    fileList.innerHTML='';
    const icons={pdf:'fa-file-pdf text-danger',zip:'fa-file-archive text-warning',docx:'fa-file-word text-primary',xlsx:'fa-file-excel text-success',png:'fa-file-image',jpg:'fa-file-image',jpeg:'fa-file-image'};
    Array.from(fileInput.files).forEach(file=>{
      const ext=file.name.split('.').pop().toLowerCase();
      const sz=(file.size/1024/1024).toFixed(2);
      const big=file.size>100*1024*1024;
      const d=document.createElement('div');
      d.className='file-item'+(big?' file-err':'');
      d.innerHTML=`<i class="fas ${icons[ext]||'fa-file'} me-2"></i><span class="flex-grow-1">${file.name}</span><span class="${big?'text-danger fw-bold':'text-muted'} small">${sz} Mo${big?' — MAX DÉPASSÉ':''}</span>`;
      fileList.appendChild(d);
    });
  }

  /* ═══════════════════════════════════════════════════════
     15. PROGRESS STEPS
     ═══════════════════════════════════════════════════════ */
  const secMap={'section-a':0,'section-b':1,'section-c':2,'section-d':3};
  const steps=document.querySelectorAll('.ps-step');
  document.querySelectorAll('.form-section[id]').forEach(sec=>{
    new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const idx=secMap[e.target.id];
          if(idx!==undefined) steps.forEach((s,i)=>s.classList.toggle('active',i<=idx));
        }
      });
    },{threshold:0.4}).observe(sec);
  });

  /* ═══════════════════════════════════════════════════════
     16. SUBMIT PROTECTION
     ═══════════════════════════════════════════════════════ */
  document.getElementById('declaration-form')?.addEventListener('submit',function(){
    const btn=document.getElementById('submit-btn');
    if(btn){btn.innerHTML='<i class="fas fa-spinner fa-spin me-2"></i>Envoi en cours…';btn.disabled=true;}
  });

  /* ═══════════════════════════════════════════════════════
     HELPERS COMMUNS
     ═══════════════════════════════════════════════════════ */
  function showFb(el,valid,msg){
    if(!el)return;
    el.innerHTML=`<i class="fas fa-${valid===true?'check-circle':valid===false?'times-circle':'info-circle'} me-1"></i>${msg}`;
    el.className='f-fb '+(valid===true?'ok':valid===false?'err':'info');
  }
  function clearFb(el){ if(el){el.innerHTML='';el.className='f-fb';} }
  function setValid(el,v){
    if(!el)return;
    el.classList.remove('is-valid','is-invalid');
    if(v===true)el.classList.add('is-valid');
    else if(v===false)el.classList.add('is-invalid');
  }

  /* ═══════════════════════════════════════════════════════
     INSTANCIATION — appel de tous les contrôles
     ═══════════════════════════════════════════════════════ */

  // Pays entité déclarante
  initPaysSelect('pays-ent-input', (p) => {
    const isSn = p.nom === 'Sénégal';
    document.getElementById('ville-text-row')?.classList.toggle('d-none', isSn);
    document.getElementById('ville-region-row')?.classList.toggle('d-none', !isSn);
    const vt = document.getElementById('ville-text');
    const rs = document.getElementById('region-sel');
    const ds = document.getElementById('dept-sel');
    if(vt){ vt.name = isSn ? '' : 'ville'; }
    if(rs){ rs.name = isSn ? 'ville' : ''; }
    if(ds){ ds.name = isSn ? 'departement' : ''; }
  });

  // Initialiser région/département
  initRegionDept('region-sel','dept-sel');

  // Vérifier état initial pays
  const paysEntEl = document.getElementById('pays-ent-input');
  if(paysEntEl && paysEntEl.value){
    const isSn = paysEntEl.value === 'Sénégal';
    document.getElementById('ville-text-row')?.classList.toggle('d-none', isSn);
    document.getElementById('ville-region-row')?.classList.toggle('d-none', !isSn);
    const vt=document.getElementById('ville-text');
    const rs=document.getElementById('region-sel');
    if(vt) vt.name = isSn?'':'ville';
    if(rs) rs.name = isSn?'ville':'';
  }

  // Pays de résidence bénéficiaire
  initPaysSelect('paysres-input', null);

  // Nationalité
  initNationalite('nat-input');

  // NINEA
  initNINEA('ninea-input','ninea-fb');

  // CNI
  initCNI('cni-input','cni-counter','cni-fb');

  // Passeport
  initPasseport('passport-input');

  // Téléphones
  initTelephone('tel-ent-wrap');
  initTelephone('tel-ben-wrap');

  // Emails
  initEmail('email-ent-input','email-ent-fb');

  // Date naissance
  initDateNaissance('ddn-input','ddn-fb');

  // Pourcentages
  ['pct-direct','pct-voix','pct-indirect','pct-mere'].forEach(id=>{
    initPourcentage(id+'-input', id+'-fb');
  });

  // Nombres positifs
  ['nb-parts-direct','nb-parts-indirect','nb-voix'].forEach(id=>initNombrePositif(id));

  // RCCM
  document.getElementById('rccm-input')?.addEventListener('input',function(){
    this.value=this.value.toUpperCase();
  });

});
