// app.js — Ministère de la Justice du Sénégal

// ── Données de référence ──────────────────────────────────────────────────────
const PAYS_DATA = [
  "Afghanistan","Afrique du Sud","Albanie","Algérie","Allemagne","Angola","Arabie Saoudite",
  "Argentine","Australie","Autriche","Azerbaïdjan","Bahreïn","Bangladesh","Belgique","Bénin",
  "Bolivie","Bosnie-Herzégovine","Brésil","Bulgarie","Burkina Faso","Burundi","Cambodge",
  "Cameroun","Canada","Cap-Vert","Chili","Chine","Chypre","Colombie","Comores","Congo",
  "Corée du Sud","Côte d'Ivoire","Croatie","Cuba","Danemark","Djibouti","Égypte","Émirats Arabes Unis",
  "Équateur","Érythrée","Espagne","Estonie","États-Unis","Éthiopie","Finlande","France","Gabon",
  "Gambie","Ghana","Grèce","Guatemala","Guinée","Guinée-Bissau","Guinée équatoriale","Haïti",
  "Honduras","Hongrie","Inde","Indonésie","Irak","Iran","Irlande","Islande","Israël","Italie",
  "Jamaïque","Japon","Jordanie","Kazakhstan","Kenya","Koweït","Laos","Lettonie","Liban","Libéria",
  "Libye","Lituanie","Luxembourg","Madagascar","Malawi","Mali","Malte","Maroc","Mauritanie",
  "Mexique","Moldova","Mozambique","Myanmar","Namibie","Népal","Nicaragua","Niger","Nigéria",
  "Norvège","Nouvelle-Zélande","Oman","Ouganda","Pakistan","Palestine","Panama","Paraguay","Pays-Bas",
  "Pérou","Philippines","Pologne","Portugal","Qatar","République Centrafricaine",
  "République Démocratique du Congo","République Dominicaine","République Tchèque","Roumanie",
  "Royaume-Uni","Russie","Rwanda","Salvador","Sénégal","Serbie","Sierra Leone","Slovaquie",
  "Slovénie","Somalie","Soudan","Sri Lanka","Suède","Suisse","Syrie","Tanzanie","Tchad",
  "Thaïlande","Togo","Tunisie","Turkménistan","Turquie","Ukraine","Uruguay","Uzbekistan",
  "Venezuela","Viêt Nam","Yémen","Zambie","Zimbabwe"
];

const NATIONALITES_DATA = [
  "Afghane","Algérienne","Allemande","Américaine","Angolaise","Arabie Saoudite","Argentine",
  "Australienne","Autrichienne","Azerbaïdjanaise","Bangladaise","Belge","Béninoise",
  "Bolivienne","Brésilienne","Bulgare","Burkinabé","Burundaise","Cambodgienne","Camerounaise",
  "Canadienne","Cap-Verdienne","Chilienne","Chinoise","Colombienne","Comorienne","Congolaise",
  "Coréenne","Croate","Cubaine","Danoise","Djiboutienne","Égyptienne","Émiratie",
  "Espagnole","Estonienne","Éthiopienne","Finlandaise","Française","Gabonaise","Gambienne",
  "Ghanéenne","Grecque","Guinéenne","Haïtienne","Hongroise","Indienne","Indonésienne",
  "Irakienne","Iranienne","Irlandaise","Israélienne","Italienne","Japonaise","Jordanienne",
  "Kazakhstanaise","Kényane","Koweitienne","Laotienne","Lettone","Libanaise","Libérienne",
  "Libyenne","Lituanienne","Luxembourgeoise","Malgache","Malawienne","Malienne","Marocaine",
  "Mauritanienne","Mexicaine","Mozambicaine","Namibienne","Népalaise","Néerlandaise",
  "Nicaraguayenne","Nigériane","Nigérienne","Norvégienne","Néo-Zélandaise","Ougandaise",
  "Pakistanaise","Palestinienne","Panaméenne","Paraguayenne","Péruvienne","Philippinne",
  "Polonaise","Portugaise","Qatarienne","Roumaine","Russe","Rwandaise","Salvadorienne",
  "Sénégalaise","Serbe","Sierra-Léonaise","Slovaque","Somalienne","Soudanaise",
  "Sri Lankaise","Suédoise","Suisse","Syrienne","Tanzanienne","Tchadienne","Thaïlandaise",
  "Togolaise","Tunisienne","Turque","Ukrainienne","Uruguayenne","Ouzbèke","Vénézuélienne",
  "Vietnamienne","Yéménite","Zambienne","Zimbabwéenne","Sud-Africaine","Britannique"
];

document.addEventListener('DOMContentLoaded', function () {

  // ── Auto-dismiss alerts ────────────────────────────────────────────────────
  setTimeout(() => {
    document.querySelectorAll('.alert').forEach(a => {
      try { new bootstrap.Alert(a).close(); } catch(e){}
    });
  }, 6000);

  // ── Autocomplete générique ─────────────────────────────────────────────────
  function initAutocomplete(input, data) {
    if (!input) return;
    const wrapper = input.parentElement;
    wrapper.style.position = 'relative';
    const dropdown = document.createElement('ul');
    dropdown.className = 'autocomplete-dropdown';
    wrapper.appendChild(dropdown);

    input.addEventListener('input', function() {
      const q = this.value.trim().toLowerCase();
      dropdown.innerHTML = '';
      if (!q || q.length < 1) { dropdown.classList.remove('show'); return; }
      const matches = data.filter(d => d.toLowerCase().includes(q)).slice(0, 8);
      if (!matches.length) { dropdown.classList.remove('show'); return; }
      matches.forEach(match => {
        const li = document.createElement('li');
        li.className = 'autocomplete-item';
        // Highlight matching part
        const idx = match.toLowerCase().indexOf(q);
        li.innerHTML = match.substring(0,idx)
          + '<strong>' + match.substring(idx, idx+q.length) + '</strong>'
          + match.substring(idx+q.length);
        li.addEventListener('mousedown', function(e) {
          e.preventDefault();
          input.value = match;
          dropdown.classList.remove('show');
          input.classList.add('is-valid');
          clearFeedback(input);
        });
        dropdown.appendChild(li);
      });
      dropdown.classList.add('show');
    });

    input.addEventListener('blur', function() {
      setTimeout(() => dropdown.classList.remove('show'), 150);
    });

    input.addEventListener('focus', function() {
      if (this.value.trim()) this.dispatchEvent(new Event('input'));
    });
  }

  // Initialiser autocomplete pays et nationalité
  document.querySelectorAll('input[name="pays"], input[name="pays_residence"]').forEach(inp => {
    initAutocomplete(inp, PAYS_DATA);
  });
  document.querySelectorAll('input[name="nationalite"]').forEach(inp => {
    initAutocomplete(inp, NATIONALITES_DATA);
  });

  // ── NINEA – validation temps réel + masque ─────────────────────────────────
  const nineaInput = document.querySelector('input[name="ninea"]');
  if (nineaInput) {
    nineaInput.setAttribute('placeholder', 'Ex : 0043385142U2');
    nineaInput.setAttribute('maxlength', '13');
    nineaInput.setAttribute('style', 'text-transform:uppercase');
    nineaInput.addEventListener('input', function() { this.value = this.value.toUpperCase(); });
    nineaInput.addEventListener('input', debounce(function() {
      const val = this.value.trim();
      if (!val) { clearFeedback(this); return; }
      fetch('/api/valider/ninea?v=' + encodeURIComponent(val))
        .then(r => r.json())
        .then(d => showFeedback(this, d.valide, d.message || '✓ NINEA valide'));
    }, 400));
  }

  // ── CNI – 13 chiffres, clavier numérique ──────────────────────────────────
  const cniInput = document.querySelector('input[name="numero_cni"]');
  if (cniInput) {
    cniInput.setAttribute('maxlength', '13');
    cniInput.setAttribute('inputmode', 'numeric');
    cniInput.setAttribute('placeholder', '13 chiffres ex: 2755197600113 2');
    // Indicateur de progression
    const cniHint = document.createElement('div');
    cniHint.className = 'cni-hint';
    cniInput.parentElement.appendChild(cniHint);

    cniInput.addEventListener('keypress', e => { if (!/\d/.test(e.key)) e.preventDefault(); });
    cniInput.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g,'').substring(0,13);
      const n = this.value.length;
      cniHint.textContent = n + '/13 chiffres';
      cniHint.className = 'cni-hint ' + (n===13 ? 'cni-ok' : n>0 ? 'cni-progress' : '');
      if (n === 13) {
        fetch('/api/valider/cni?v=' + encodeURIComponent(this.value))
          .then(r => r.json())
          .then(d => showFeedback(this, d.valide, d.message || '✓ CNI valide'));
      } else if (n > 0) {
        showFeedback(this, false, `${13-n} chiffre(s) manquant(s)`);
      } else { clearFeedback(this); }
    });
  }

  // ── Téléphone – masque sénégalais ─────────────────────────────────────────
  document.querySelectorAll('input[name="telephone"]').forEach(input => {
    input.setAttribute('placeholder', '+221 77 123 45 67');
    input.setAttribute('inputmode', 'tel');
    input.addEventListener('input', function() {
      // Masque automatique: +221 XX XXX XX XX
      let val = this.value.replace(/[^\d+]/g,'');
      if (val.startsWith('00221')) val = '+221' + val.substring(5);
      if (val.startsWith('221') && !val.startsWith('+')) val = '+' + val;
      if (!val.startsWith('+221') && val.match(/^[0-9]{9}/)) val = '+221' + val;
      this.dataset.raw = val;
    });
    input.addEventListener('blur', debounce(function() {
      const val = this.value.trim();
      if (!val) { clearFeedback(this); return; }
      fetch('/api/valider/telephone?v=' + encodeURIComponent(val))
        .then(r => r.json())
        .then(d => showFeedback(this, d.valide, d.message || '✓ Numéro valide'));
    }, 300));
  });

  // ── Passeport – format libre mais structuré ────────────────────────────────
  const passport = document.querySelector('input[name="numero_passeport"]');
  if (passport) {
    passport.setAttribute('placeholder', 'Ex : AB1234567');
    passport.setAttribute('maxlength', '20');
    passport.addEventListener('input', function() {
      this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
    });
  }

  // ── RCCM – format structuré ────────────────────────────────────────────────
  const rccm = document.querySelector('input[name="rccm"]');
  if (rccm) {
    rccm.setAttribute('placeholder', 'Ex : SN.DKR.2011.B.2041');
    rccm.addEventListener('input', function() {
      this.value = this.value.toUpperCase();
    });
  }

  // ── Pourcentages 2–100 ─────────────────────────────────────────────────────
  ['pourcentage_participation','pourcentage_voix',
   'pourcentage_participation_indirecte','pourcentage_participation_mere'].forEach(name => {
    const inp = document.querySelector(`input[name="${name}"]`);
    if (!inp) return;
    inp.setAttribute('min','2'); inp.setAttribute('max','100'); inp.setAttribute('step','0.01');
    inp.setAttribute('placeholder','Entre 2 et 100');
    inp.addEventListener('input', function() {
      const val = parseFloat(this.value);
      if (this.value==='') { clearFeedback(this); return; }
      if (isNaN(val)||val<2) showFeedback(this,false,'Minimum 2%');
      else if (val>100) showFeedback(this,false,'Maximum 100%');
      else showFeedback(this,true,`✓ ${val}%`);
    });
    inp.addEventListener('blur', function() {
      if (this.value && parseFloat(this.value)<2) { this.value='2'; showFeedback(this,true,'✓ 2%'); }
      if (this.value && parseFloat(this.value)>100) { this.value='100'; showFeedback(this,true,'✓ 100%'); }
    });
  });

  // ── Parts >= 0 ────────────────────────────────────────────────────────────
  ['nombre_parts_directes','nombre_parts_indirectes','nombre_voix'].forEach(name => {
    const inp = document.querySelector(`input[name="${name}"]`);
    if (!inp) return;
    inp.setAttribute('min','0'); inp.setAttribute('inputmode','numeric');
    inp.addEventListener('input', function() {
      if (this.value && parseFloat(this.value)<0) { this.value='0'; }
    });
  });

  // ── Date naissance max = aujourd'hui ──────────────────────────────────────
  const ddn = document.querySelector('input[name="date_naissance"]');
  if (ddn) {
    ddn.setAttribute('max', new Date().toISOString().split('T')[0]);
    ddn.addEventListener('change', function() {
      if (new Date(this.value) >= new Date()) {
        showFeedback(this,false,"Date invalide : doit être antérieure à aujourd'hui");
      } else clearFeedback(this);
    });
  }

  // ── Upload drag & drop ────────────────────────────────────────────────────
  const fileInput  = document.getElementById('file-input');
  const fileList   = document.getElementById('file-list');
  const uploadZone = document.getElementById('upload-zone');
  if (fileInput && uploadZone) {
    fileInput.addEventListener('change', updateFileList);
    ['dragover','dragenter'].forEach(ev => uploadZone.addEventListener(ev, e => {
      e.preventDefault(); uploadZone.classList.add('drag-over');
    }));
    ['dragleave','dragend'].forEach(ev => uploadZone.addEventListener(ev, () =>
      uploadZone.classList.remove('drag-over')
    ));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault(); uploadZone.classList.remove('drag-over');
      fileInput.files = e.dataTransfer.files; updateFileList();
    });
  }

  function updateFileList() {
    if (!fileList) return;
    fileList.innerHTML='';
    Array.from(fileInput.files).forEach(file => {
      const size=(file.size/1024/1024).toFixed(2);
      const big=file.size>100*1024*1024;
      const ext=file.name.split('.').pop().toLowerCase();
      const iconMap={pdf:'fa-file-pdf text-danger',zip:'fa-file-archive text-warning',
                     docx:'fa-file-word text-primary',xlsx:'fa-file-excel text-success',
                     png:'fa-file-image text-info',jpg:'fa-file-image text-info',jpeg:'fa-file-image text-info'};
      const icon=iconMap[ext]||'fa-file text-secondary';
      const div=document.createElement('div');
      div.className='file-item'+(big?' file-too-large':'');
      div.innerHTML=`<i class="fas ${icon} me-2"></i><span class="flex-grow-1">${file.name}</span>
        <small class="${big?'text-danger fw-bold':'text-muted'}">${size} Mo${big?' — TROP GRAND':''}</small>`;
      fileList.appendChild(div);
    });
  }

  function getFileIcon(n) {
    const e=n.split('.').pop().toLowerCase();
    return {pdf:'pdf',zip:'archive',docx:'word',xlsx:'excel'}[e]||'alt';
  }

  // ── Progress steps ────────────────────────────────────────────────────────
  const sections=document.querySelectorAll('.form-section[id]');
  if (sections.length) {
    const steps=document.querySelectorAll('.progress-step');
    const map={'section-a':0,'section-b':1,'section-c':2,'section-d':3};
    sections.forEach(s => {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx=map[e.target.id];
            if (idx!==undefined) steps.forEach((st,i)=>st.classList.toggle('active',i<=idx));
          }
        });
      },{threshold:0.4}).observe(s);
    });
  }

  // ── Submit loading ────────────────────────────────────────────────────────
  const form=document.getElementById('declaration-form');
  if (form) {
    form.addEventListener('submit',function() {
      const btn=document.getElementById('submit-btn');
      if (btn && form.checkValidity()) {
        btn.innerHTML='<i class="fas fa-spinner fa-spin me-2"></i>Traitement…';
        btn.disabled=true;
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function showFeedback(input, valid, message) {
    let fb=input.parentElement.querySelector('.field-feedback');
    if (!fb) {
      fb=document.createElement('div');
      fb.className='field-feedback';
      input.parentElement.appendChild(fb);
    }
    fb.innerHTML=`<i class="fas fa-${valid?'check-circle':'times-circle'} me-1"></i>${message}`;
    fb.className=`field-feedback ${valid?'success':'error'}`;
    input.classList.toggle('is-invalid',!valid);
    input.classList.toggle('is-valid',valid);
  }

  function clearFeedback(input) {
    const fb=input.parentElement.querySelector('.field-feedback');
    if (fb) { fb.className='field-feedback'; fb.innerHTML=''; }
    input.classList.remove('is-invalid','is-valid');
  }

  function debounce(fn, delay) {
    let t; return function(...args){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args),delay); };
  }

  // ── Viewer de document inline (iframe) ────────────────────────────────────
  window.ouvrirDocument = function(url, nom) {
    const modal=document.getElementById('docViewerModal');
    if (!modal) return;
    const title=modal.querySelector('#docViewerTitle');
    const frame=modal.querySelector('#docViewerFrame');
    const link=modal.querySelector('#docViewerDownload');
    if (title) title.textContent=nom;
    if (link) link.href=url+'?dl=1';
    const ext=nom.split('.').pop().toLowerCase();
    if (['pdf','png','jpg','jpeg'].includes(ext)) {
      frame.src=url;
      frame.style.display='block';
      modal.querySelector('#docViewerNoPreview').style.display='none';
    } else {
      frame.src='';
      frame.style.display='none';
      modal.querySelector('#docViewerNoPreview').style.display='flex';
      modal.querySelector('#docViewerNoPreview a').href=url;
    }
    new bootstrap.Modal(modal).show();
  };

});
