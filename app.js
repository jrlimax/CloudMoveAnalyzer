/* ==========================================================
   Cloud Move Analyzer — Lógica da aplicação
   ========================================================== */

// ── State ─────────────────────────────────────────────────
let allResults    = [];
let currentFilter = 'all';
let currentSearch = '';
let sortCol       = '';
let sortAsc       = true;

// ── Theme toggle ──────────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem('azure-move-theme');
  if (saved === 'light') document.documentElement.classList.add('light');
})();

document.getElementById('themeToggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
  const isLight = document.documentElement.classList.contains('light');
  localStorage.setItem('azure-move-theme', isLight ? 'light' : 'dark');
});

// ── Language switching ────────────────────────────────────
const langPicker = document.getElementById('langPicker');
const langToggle = document.getElementById('langToggle');
const langMenu   = document.getElementById('langMenu');
const langFlag   = document.getElementById('langFlag');
const langLabel  = document.getElementById('langLabel');

const LANG_FLAGS = {
  'en':    { flag: 'https://flagcdn.com/24x18/us.png', label: 'English' },
  'pt-BR': { flag: 'https://flagcdn.com/24x18/br.png', label: 'Português' },
  'zh-CN': { flag: 'https://flagcdn.com/24x18/cn.png', label: '中文' },
  'es':    { flag: 'https://flagcdn.com/24x18/es.png', label: 'Español' },
  'fr':    { flag: 'https://flagcdn.com/24x18/fr.png', label: 'Français' },
  'ar':    { flag: 'https://flagcdn.com/24x18/sa.png', label: 'العربية' },
  'ru':    { flag: 'https://flagcdn.com/24x18/ru.png', label: 'Русский' },
  'ja':    { flag: 'https://flagcdn.com/24x18/jp.png', label: '日本語' }
};

function updateLangPicker() {
  const info = LANG_FLAGS[currentLang] || LANG_FLAGS.en;
  langFlag.src = info.flag;
  langLabel.textContent = info.label;
  langMenu.querySelectorAll('li').forEach(li => {
    li.classList.toggle('active', li.dataset.lang === currentLang);
  });
}

langToggle.addEventListener('click', () => {
  const open = langMenu.classList.toggle('hidden');
  langPicker.classList.toggle('open', !langMenu.classList.contains('hidden'));
});

// Close menu on outside click
document.addEventListener('click', e => {
  if (!langPicker.contains(e.target)) {
    langMenu.classList.add('hidden');
    langPicker.classList.remove('open');
  }
});

langMenu.querySelectorAll('li[data-lang]').forEach(li => {
  li.addEventListener('click', () => {
    currentLang = li.dataset.lang;
    localStorage.setItem('azure-move-lang', currentLang);
    updateLangPicker();
    langMenu.classList.add('hidden');
    langPicker.classList.remove('open');
    applyLanguage();
  });
});

function applyLanguage() {
  const lang = I18N[currentLang] || I18N.en;
  document.documentElement.lang = lang.htmlLang;
  document.documentElement.dir = lang.dir;
  document.getElementById('themeToggle').title = t('themeToggle');

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Re-render table if data loaded
  if (allResults.length) renderTable();
}

// Apply on load
updateLangPicker();
applyLanguage();

// ── DOM refs ──────────────────────────────────────────────
const uploadArea     = document.getElementById('uploadArea');
const fileInput      = document.getElementById('fileInput');
const resultsSection = document.getElementById('resultsSection');
const tableBody      = document.getElementById('tableBody');
const searchInput    = document.getElementById('searchInput');
const exportBtn      = document.getElementById('exportBtn');

// ==========================================================
// File Upload
// ==========================================================
uploadArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  if (e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', e => {
  if (e.target.files.length) processFile(e.target.files[0]);
});

function showFileName(name) {
  uploadArea.querySelector('h3').textContent = name;
  uploadArea.querySelector('span').textContent = t('uploadReplace');
}

function processFile(file) {
  showFileName(file.name);
  const reader = new FileReader();
  const isCsv  = /\.(csv|tsv)$/i.test(file.name);

  reader.onload = function (e) {
    try {
      const wb = isCsv
        ? XLSX.read(e.target.result, { type: 'string' })
        : XLSX.read(new Uint8Array(e.target.result), { type: 'array' });

      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
      analyzeResources(data);
    } catch (err) {
      alert(t('alertError') + err.message);
    }
  };

  isCsv ? reader.readAsText(file, 'UTF-8') : reader.readAsArrayBuffer(file);
}

// ==========================================================
// Column detection helpers
// ==========================================================
function findColumn(headers, exact, partial) {
  for (const h of headers) {
    if (exact.includes(h.toLowerCase().trim())) return h;
  }
  for (const h of headers) {
    const low = h.toLowerCase();
    if (partial.some(p => low.includes(p))) return h;
  }
  return null;
}

const findTypeCol  = h => findColumn(h,
  ['type','resource type','tipo','tipo de recurso','resourcetype','resource_type','tipo recurso'],
  ['type','tipo']);

const findNameCol  = h => findColumn(h,
  ['name','nome','resource name','nome do recurso','resourcename','resource_name'],
  ['name','nome']);

const findLinkCol  = h => findColumn(h,
  ['link de recursos','resource link','link','url','resource id','resourceid','resource_id','id do recurso'],
  ['link','url','resource id']);

const findRGCol    = h => findColumn(h,
  ['resource group','grupo de recursos','resourcegroup','resource_group','grupo recursos','rg'],
  ['resource group','grupo de recursos','grupo recursos']);

const findLocCol   = h => findColumn(h,
  ['location','localização','localizacao','região','regiao','region'],
  ['location','localiza']);

// ==========================================================
// Resource type extraction & lookup
// ==========================================================

/** Extract "Microsoft.X/type" from an Azure portal URL */
function extractTypeFromUrl(url) {
  if (!url) return null;
  const m = url.match(/providers\/(Microsoft\.[^/]+\/[^/]+)/i);
  return m ? m[1] : null;
}

/** Look up a resource type in MOVE_DB (case-insensitive, progressive fallback) */
function lookupResourceType(rawType) {
  if (!rawType) return null;
  const clean = rawType.toLowerCase().trim().replace(/^\//, '');

  if (MOVE_DB[clean]) return MOVE_DB[clean];

  // Try progressively shorter paths
  const parts = clean.split('/');
  for (let len = parts.length; len >= 2; len--) {
    const attempt = parts.slice(0, len).join('/');
    if (MOVE_DB[attempt]) return MOVE_DB[attempt];
  }
  return null;
}

function getStatus(info) {
  if (!info) return 'unknown';
  if (info.moveRG === 1 && info.moveSub === 1) return 'movable';
  if (info.moveRG === 1 || info.moveSub === 1 || info.moveRegion === 1) return 'partial';
  return 'not-movable';
}

// ==========================================================
// Analysis
// ==========================================================
function analyzeResources(data) {
  if (!data.length) { alert(t('alertEmpty')); return; }

  const headers = Object.keys(data[0]);
  const typeCol = findTypeCol(headers);
  const nameCol = findNameCol(headers);
  const linkCol = findLinkCol(headers);
  const rgCol   = findRGCol(headers);
  const locCol  = findLocCol(headers);

  if (!typeCol && !linkCol) {
    alert(t('alertNoCols') + headers.join(', '));
    return;
  }

  allResults = data.map(row => {
    const displayType = typeCol ? String(row[typeCol] || '').trim() : '';
    const name        = nameCol ? String(row[nameCol] || '').trim() : '';
    const link        = linkCol ? String(row[linkCol] || '').trim() : '';
    const rg          = rgCol   ? String(row[rgCol]   || '').trim() : '';
    const loc         = locCol  ? String(row[locCol]  || '').trim() : '';

    const resolvedType = link ? extractTypeFromUrl(link) : null;
    const finalType    = resolvedType || displayType;

    let info = resolvedType ? lookupResourceType(resolvedType) : null;
    if (!info && displayType) info = lookupResourceType(displayType);

    return {
      name:          name || '—',
      type:          finalType || '—',
      displayType,
      resourceGroup: rg,
      location:      loc,
      moveRG:        info ? info.moveRG     : -1,
      moveSub:       info ? info.moveSub    : -1,
      moveRegion:    info ? info.moveRegion : -1,
      status:        getStatus(info)
    };
  }).filter(r => r.type !== '—');

  updateStats();
  renderTable();
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================================
// Stats
// ==========================================================
function updateStats() {
  const count = s => allResults.filter(r => r.status === s).length;
  document.getElementById('statTotal').textContent      = allResults.length;
  document.getElementById('statMovable').textContent    = count('movable');
  document.getElementById('statPartial').textContent    = count('partial');
  document.getElementById('statNotMovable').textContent = count('not-movable');

  const unknownCount = count('unknown');
  document.getElementById('statUnknown').textContent = unknownCount;
  const unknownCard = document.getElementById('statUnknownCard');
  if (unknownCount > 0) {
    unknownCard.classList.remove('hidden');
  } else {
    unknownCard.classList.add('hidden');
  }
}

// ==========================================================
// Rendering helpers
// ==========================================================
function escapeHtml(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML;
}

function badgeFor(value) {
  if (value === 1) return `<span class="badge yes">${t('badgeYes')}</span>`;
  if (value === 0) return `<span class="badge no">${t('badgeNo')}</span>`;
  return '<span class="badge unknown">N/A</span>';
}

function statusBadge(status, r) {
  let tooltip = '';
  if (status === 'movable') {
    tooltip = t('tooltipMovable');
  } else if (status === 'partial') {
    const parts = [];
    if (r.moveRG === 1)     parts.push(t('tooltipRG'));
    if (r.moveSub === 1)    parts.push(t('tooltipSub'));
    if (r.moveRegion === 1) parts.push(t('tooltipRegion'));
    const no = [];
    if (r.moveRG === 0)     no.push(t('tooltipRG'));
    if (r.moveSub === 0)    no.push(t('tooltipSub'));
    if (r.moveRegion === 0) no.push(t('tooltipRegion'));
    tooltip = t('tooltipMove') + ': ' + (parts.length ? parts.join(', ') : '—') +
              '\n' + t('tooltipNoMove') + ': ' + (no.length ? no.join(', ') : '—');
  } else if (status === 'not-movable') {
    tooltip = t('tooltipNotMovable');
  } else {
    tooltip = t('tooltipUnknown');
  }
  const safeTooltip = tooltip.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  const map = {
    'movable':     `<span class="badge yes" title="${safeTooltip}">${t('statusMovable')}</span>`,
    'partial':     `<span class="badge partial" title="${safeTooltip}">${t('statusPartial')}</span>`,
    'not-movable': `<span class="badge no" title="${safeTooltip}">${t('statusNotMovable')}</span>`,
    'unknown':     `<span class="badge unknown" title="${safeTooltip}">${t('statusUnknown')}</span>`
  };
  return map[status] || '';
}

// ==========================================================
// Filtering & sorting
// ==========================================================
function getFiltered() {
  let results = allResults;

  if (currentFilter !== 'all') {
    results = results.filter(r => r.status === currentFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    results = results.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      (r.displayType   && r.displayType.toLowerCase().includes(q)) ||
      (r.resourceGroup && r.resourceGroup.toLowerCase().includes(q))
    );
  }

  if (sortCol) {
    results = [...results].sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ?  1 : -1;
      return 0;
    });
  }
  return results;
}

// ==========================================================
// Table rendering
// ==========================================================
function renderTable() {
  const filtered = getFiltered();

  // Update results count
  const countEl = document.getElementById('resultsCount');
  if (currentFilter !== 'all' || currentSearch) {
    countEl.textContent = t('resultsCount').replace('{filtered}', filtered.length).replace('{total}', allResults.length);
  } else {
    countEl.textContent = '';
  }

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <p>${t('emptyState')}</p>
        </div>
      </td></tr>`;
    return;
  }

  let html = '';
  for (const r of filtered) {
    html += `<tr>
      <td>${escapeHtml(r.name)}</td>
      <td><code class="type-tag">${escapeHtml(r.type)}</code></td>
      <td class="cell-muted">${escapeHtml(r.resourceGroup || '—')}</td>
      <td class="cell-muted">${escapeHtml(r.location || '—')}</td>
      <td>${badgeFor(r.moveRG)}</td>
      <td>${badgeFor(r.moveSub)}</td>
      <td>${badgeFor(r.moveRegion)}</td>
      <td>${statusBadge(r.status, r)}</td>
    </tr>`;
  }
  tableBody.innerHTML = html;
}

// ==========================================================
// Clickable stat card filters
// ==========================================================
document.querySelectorAll('.stat-card[data-filter]').forEach(card => {
  const handleClick = () => {
    const filter = card.dataset.filter;
    if (currentFilter === filter) {
      currentFilter = 'all';
    } else {
      currentFilter = filter;
    }
    document.querySelectorAll('.stat-card[data-filter]').forEach(c => {
      const isActive = c.dataset.filter === currentFilter;
      c.classList.toggle('active', isActive);
      c.setAttribute('aria-pressed', isActive);
    });
    renderTable();
  };

  card.addEventListener('click', handleClick);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  });
});

// ==========================================================
// Search
// ==========================================================
searchInput.addEventListener('input', e => {
  currentSearch = e.target.value;
  renderTable();
});

// ==========================================================
// Sorting
// ==========================================================
const sortMap = {
  name:          'name',
  type:          'type',
  resourceGroup: 'resourceGroup',
  location:      'location',
  rg:            'moveRG',
  sub:           'moveSub',
  region:        'moveRegion',
  status:        'status'
};

document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const col = sortMap[th.dataset.sort];
    if (sortCol === col) { sortAsc = !sortAsc; }
    else { sortCol = col; sortAsc = true; }
    renderTable();
  });
});

// ==========================================================
// CSV export
// ==========================================================
exportBtn.addEventListener('click', () => {
  if (!allResults.length) return;

  const statusLabel = {
    'movable': t('csvMovable'), 'partial': t('csvPartial'),
    'not-movable': t('csvNotMovable'), 'unknown': t('csvNotFound')
  };
  const yesNo = v => v === 1 ? t('csvYes') : v === 0 ? t('csvNo') : 'N/A';
  const csvEscape = s => '"' + String(s).replace(/"/g, '""') + '"';

  let csv = [t('csvName'),t('csvType'),t('csvRG'),t('csvLocation'),t('csvMoveRG'),t('csvMoveSub'),t('csvMoveRegion'),t('csvStatus')].join(',') + '\n';
  for (const r of allResults) {
    csv += `${csvEscape(r.name)},${csvEscape(r.type)},${csvEscape(r.resourceGroup || '')},${csvEscape(r.location || '')},${csvEscape(yesNo(r.moveRG))},${csvEscape(yesNo(r.moveSub))},${csvEscape(yesNo(r.moveRegion))},${csvEscape(statusLabel[r.status])}\n`;
  }

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'cloud-move-analyzer-export.csv';
  a.click();
  URL.revokeObjectURL(url);
});
