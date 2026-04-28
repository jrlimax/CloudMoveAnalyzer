/* ==========================================================
   Cloud Move Analyzer — Lógica da aplicação
   ========================================================== */

// ── Constants ─────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
const SEARCH_DEBOUNCE_MS  = 200;
const PRINT_IFRAME_TTL_MS = 60000; // safety cleanup if afterprint never fires
const STORAGE_KEYS = {
  theme: 'azure-move-theme',
  lang:  'azure-move-lang',
  cols:  'azure-move-cols' // { order: [...], visible: { name: true, ... } }
};

// Sort column mapping (declared early to avoid TDZ when applyLanguage runs first)
const sortMap = {
  name:          'name',
  type:          'type',
  friendlyName:  'friendlyName',
  resourceGroup: 'resourceGroup',
  location:      'location',
  rg:            'moveRG',
  sub:           'moveSub',
  region:        'moveRegion',
  status:        'status',
  notes:         'noteKey'
};

// Reusable Intl.Collator (rebuilt only when language changes)
let _collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
function refreshCollator() {
  try { _collator = new Intl.Collator(currentLang || 'en', { sensitivity: 'base', numeric: true }); }
  catch (e) { _collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true }); }
}

// Respect prefers-reduced-motion for programmatic scrolling
const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── State ─────────────────────────────────────────────────
let allResults    = [];
let currentFilter = 'all';
let currentSearch = '';
let sortCol       = '';
let sortAsc       = true;

// ── Theme toggle ──────────────────────────────────────────
// Safe localStorage wrapper (private-mode Safari throws on setItem)
const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }
};

(function initTheme() {
  const saved = storage.get(STORAGE_KEYS.theme);
  if (saved === 'dark') {
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
  }
})();

document.getElementById('themeToggle').addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
  const isLight = document.documentElement.classList.contains('light');
  storage.set(STORAGE_KEYS.theme, isLight ? 'light' : 'dark');
  document.getElementById('themeToggle').setAttribute('aria-pressed', String(!isLight));
});

// Initial aria-pressed state for theme toggle (true = dark mode active)
(function setInitialThemeAria() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const isLight = document.documentElement.classList.contains('light');
  btn.setAttribute('aria-pressed', String(!isLight));
})();

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
  langMenu.querySelectorAll('li[data-lang]').forEach(li => {
    li.classList.toggle('active', li.dataset.lang === currentLang);
  });
}

langToggle.addEventListener('click', () => {
  const willOpen = langMenu.classList.contains('hidden');
  langMenu.classList.toggle('hidden');
  langPicker.classList.toggle('open', !langMenu.classList.contains('hidden'));
  langToggle.setAttribute('aria-expanded', String(willOpen));
  if (willOpen) {
    // Move focus to the active item (or first) for keyboard users
    const active = langMenu.querySelector('li.active') || langMenu.querySelector('li[data-lang]');
    if (active) active.focus();
  }
});

// Close menu on outside click or Escape
document.addEventListener('click', e => {
  if (!langPicker.contains(e.target)) {
    langMenu.classList.add('hidden');
    langPicker.classList.remove('open');
    langToggle.setAttribute('aria-expanded', 'false');
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !langMenu.classList.contains('hidden')) {
    langMenu.classList.add('hidden');
    langPicker.classList.remove('open');
    langToggle.setAttribute('aria-expanded', 'false');
    langToggle.focus();
  }
});

// Arrow-key + Home/End navigation inside the language menu
langMenu.addEventListener('keydown', e => {
  const items = Array.from(langMenu.querySelectorAll('li[data-lang]'));
  if (!items.length) return;
  const idx = items.indexOf(document.activeElement);
  let target = -1;
  if (e.key === 'ArrowDown') target = idx < items.length - 1 ? idx + 1 : 0;
  else if (e.key === 'ArrowUp') target = idx > 0 ? idx - 1 : items.length - 1;
  else if (e.key === 'Home') target = 0;
  else if (e.key === 'End') target = items.length - 1;
  else if (e.key === 'Enter' || e.key === ' ') {
    if (idx >= 0) { e.preventDefault(); items[idx].click(); return; }
  } else return;
  e.preventDefault();
  items[target].focus();
});

langMenu.querySelectorAll('li[data-lang]').forEach(li => {
  li.addEventListener('click', () => {
    currentLang = li.dataset.lang;
    storage.set(STORAGE_KEYS.lang, currentLang);
    refreshCollator();
    updateLangPicker();
    langMenu.classList.add('hidden');
    langPicker.classList.remove('open');
    langToggle.setAttribute('aria-expanded', 'false');
    langToggle.focus();
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
  // Update data-i18n-html elements (allow safe HTML like links)
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  // Update aria-labels
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });

  // Re-render table if data loaded; otherwise just keep sort arrows in sync
  if (allResults.length) {
    renderTable();
  } else {
    updateSortIndicators();
  }
}

// Apply on load
refreshCollator();
updateLangPicker();
applyLanguage();

// Set canonical URL and OG url (always use the custom domain)
(function setCanonicalUrl() {
  const SITE_URL = 'https://cloudmoveanalyzer.com/';
  const canonical = document.getElementById('canonicalLink');
  if (canonical) canonical.href = SITE_URL;
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = SITE_URL;
  const ogImage = document.querySelector('meta[property="og:image"]');
  const twImage = document.querySelector('meta[name="twitter:image"]');
  const absLogo = SITE_URL + 'assets/logo.png';
  if (ogImage) ogImage.content = absLogo;
  if (twImage) twImage.content = absLogo;
})();

// ── PIX copy button ───────────────────────────────────────
const pixCopyBtn = document.getElementById('pixCopyBtn');
const pixKeyEl   = document.getElementById('pixKey');
pixCopyBtn.addEventListener('click', () => {
  const key = pixKeyEl.textContent;
  navigator.clipboard.writeText(key).then(() => {
    pixCopyBtn.textContent = '✅ ' + (t('pixCopied') || 'Copied!');
    // Announce to screen readers
    let live = document.getElementById('pixCopiedLive');
    if (!live) {
      live = document.createElement('span');
      live.id = 'pixCopiedLive';
      live.className = 'sr-only';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('role', 'status');
      pixCopyBtn.parentNode.appendChild(live);
    }
    live.textContent = t('pixCopied') || 'Copied!';
    setTimeout(() => { pixCopyBtn.textContent = t('pixCopyBtn'); if (live) live.textContent = ''; }, 2000);
  }).catch(() => {
    // Fallback: select the text for manual copy
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('pixKey'));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  });
});

// ── Donation tabs ─────────────────────────────────────────
{
  const dtabs   = document.querySelectorAll('.donation-tab');
  const panels = document.querySelectorAll('.donation-panel');
  dtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dtabs.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.target).classList.add('active');
    });
  });
}

// ── DOM refs ──────────────────────────────────────────────
const uploadArea     = document.getElementById('uploadArea');
const fileInput      = document.getElementById('fileInput');
const resultsSection = document.getElementById('resultsSection');
const tableBody      = document.getElementById('tableBody');
const searchInput    = document.getElementById('searchInput');
const exportBtn      = document.getElementById('exportBtn');
const mainEl         = document.querySelector('main');

// ── Column picker for exports ─────────────────────────────
const colPickerToggle = document.getElementById('colPickerToggle');
const colPickerMenu   = document.getElementById('colPickerMenu');
const colPicker       = document.getElementById('colPicker');

function getExportCols() {
  const cols = {};
  colPickerMenu.querySelectorAll('input[data-col]').forEach(cb => {
    cols[cb.dataset.col] = cb.checked;
  });
  return cols;
}

// ── Persist column visibility & order ─────────────────────
function saveColumnPrefs() {
  const order = getColumnOrder();
  const visible = getExportCols();
  storage.set(STORAGE_KEYS.cols, JSON.stringify({ order, visible }));
}

function loadColumnPrefs() {
  const raw = storage.get(STORAGE_KEYS.cols);
  if (!raw) return;
  let prefs;
  try { prefs = JSON.parse(raw); } catch (e) { return; }
  if (!prefs || typeof prefs !== 'object') return;

  // Apply visibility
  if (prefs.visible) {
    colPickerMenu.querySelectorAll('input[data-col]').forEach(cb => {
      if (Object.prototype.hasOwnProperty.call(prefs.visible, cb.dataset.col)) {
        cb.checked = !!prefs.visible[cb.dataset.col];
      }
    });
  }

  // Apply order
  if (Array.isArray(prefs.order) && prefs.order.length) {
    const labelByCol = {};
    colPickerMenu.querySelectorAll('label[data-col-label]').forEach(l => {
      labelByCol[l.dataset.colLabel] = l;
    });
    prefs.order.forEach(col => {
      const lbl = labelByCol[col];
      if (lbl) colPickerMenu.appendChild(lbl);
    });
  }
}

colPickerToggle.addEventListener('click', () => {
  colPickerMenu.classList.toggle('hidden');
  colPicker.classList.toggle('open', !colPickerMenu.classList.contains('hidden'));
});

document.addEventListener('click', e => {
  if (!colPicker.contains(e.target)) {
    colPickerMenu.classList.add('hidden');
    colPicker.classList.remove('open');
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !colPickerMenu.classList.contains('hidden')) {
    colPickerMenu.classList.add('hidden');
    colPicker.classList.remove('open');
  }
});

// Toggle column visibility on the table in real time
const resultsTable = document.getElementById('resultsTable');

// Column order: the canonical order of column keys, matching the picker labels
function getColumnOrder() {
  return Array.from(colPickerMenu.querySelectorAll('label[data-col-label]'))
    .map(l => l.dataset.colLabel);
}

function applyColumnVisibility() {
  const order = getColumnOrder();
  // Build CSS rules dynamically based on current order
  let style = document.getElementById('colVisStyle');
  if (!style) {
    style = document.createElement('style');
    style.id = 'colVisStyle';
    document.head.appendChild(style);
  }
  let css = '';
  order.forEach((col, i) => {
    const nth = i + 1;
    const cb = colPickerMenu.querySelector(`input[data-col="${col}"]`);
    if (cb && !cb.checked) {
      css += `#resultsTable th:nth-child(${nth}), #resultsTable td:nth-child(${nth}) { display: none; }\n`;
    }
  });
  style.textContent = css;
}

colPickerMenu.querySelectorAll('input[data-col]').forEach(cb => {
  cb.addEventListener('change', () => {
    applyColumnVisibility();
    saveColumnPrefs();
    renderTable();
  });
});

// Restore saved column preferences (order + visibility) before first render
loadColumnPrefs();

// Apply initial state
applyColumnVisibility();

// Drag-and-drop column reorder in the picker
let dragLabel = null;
colPickerMenu.addEventListener('dragstart', e => {
  const label = e.target.closest('label[data-col-label]');
  if (!label) return;
  dragLabel = label;
  label.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
});
colPickerMenu.addEventListener('dragover', e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const target = e.target.closest('label[data-col-label]');
  if (!target || target === dragLabel) return;
  colPickerMenu.querySelectorAll('label').forEach(l => l.classList.remove('drag-over'));
  target.classList.add('drag-over');
});
colPickerMenu.addEventListener('dragleave', e => {
  const target = e.target.closest('label[data-col-label]');
  if (target) target.classList.remove('drag-over');
});
colPickerMenu.addEventListener('drop', e => {
  e.preventDefault();
  colPickerMenu.querySelectorAll('label').forEach(l => l.classList.remove('drag-over'));
  const target = e.target.closest('label[data-col-label]');
  if (!target || !dragLabel || target === dragLabel) return;

  // Reorder the labels in the picker
  const labels = Array.from(colPickerMenu.querySelectorAll('label[data-col-label]'));
  const fromIdx = labels.indexOf(dragLabel);
  const toIdx = labels.indexOf(target);
  if (fromIdx < toIdx) {
    target.after(dragLabel);
  } else {
    target.before(dragLabel);
  }

  // Reorder table columns to match
  reorderTableColumns();
});
colPickerMenu.addEventListener('dragend', () => {
  if (dragLabel) dragLabel.classList.remove('dragging');
  dragLabel = null;
  colPickerMenu.querySelectorAll('label').forEach(l => l.classList.remove('drag-over'));
});

// Keyboard alternative: focus a label and use Alt+ArrowUp / Alt+ArrowDown to reorder
colPickerMenu.querySelectorAll('label[data-col-label]').forEach(lbl => {
  if (!lbl.hasAttribute('tabindex')) lbl.setAttribute('tabindex', '0');
});
colPickerMenu.addEventListener('keydown', e => {
  if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
  const lbl = e.target.closest('label[data-col-label]');
  if (!lbl) return;
  e.preventDefault();
  const sibling = e.key === 'ArrowUp' ? lbl.previousElementSibling : lbl.nextElementSibling;
  if (!sibling || !sibling.matches('label[data-col-label]')) return;
  if (e.key === 'ArrowUp') sibling.before(lbl); else sibling.after(lbl);
  lbl.focus();
  reorderTableColumns();
});

function reorderTableColumns() {
  applyColumnVisibility();
  saveColumnPrefs();
  // Force <th> re-sync on next renderTable
  if (resultsTable && resultsTable.dataset) delete resultsTable.dataset.lastOrder;
  renderTable();
}

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
  if (e.target.files.length) {
    processFile(e.target.files[0]);
    fileInput.value = '';  // reset so same file can be re-uploaded
  }
});

function showFileName(name) {
  uploadArea.querySelector('h3').textContent = name;
  uploadArea.querySelector('span').textContent = t('uploadReplace');
}

function processFile(file) {
  // Size guard: warn for huge files before attempting to parse
  if (file.size > MAX_FILE_SIZE_BYTES) {
    showTemplateHint(
      (t('alertError') || 'Error: ') +
      `file too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`
    );
    return;
  }
  showFileName(file.name);

  // Remove any existing loading overlay
  const existing = document.getElementById('loadingOverlay');
  if (existing) existing.remove();

  // Show loading indicator
  const loadingEl = document.createElement('div');
  loadingEl.id = 'loadingOverlay';
  loadingEl.className = 'loading';
  loadingEl.innerHTML = `<div class="spinner"></div><p>${t('loadingText')}</p>`;
  resultsSection.classList.add('hidden');
  mainEl.classList.remove('has-results');
  uploadArea.parentNode.insertBefore(loadingEl, resultsSection);

  const reader = new FileReader();
  const isCsv  = /\.(csv|tsv)$/i.test(file.name);

  reader.onload = function (e) {
    // Defer parsing two frames so the spinner paints first
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try {
        let result = e.target.result;
        // CSV BOM detection — strip UTF-8 BOM if present
        if (isCsv && typeof result === 'string' && result.charCodeAt(0) === 0xFEFF) {
          result = result.slice(1);
        }
        const wb = isCsv
          ? XLSX.read(result, { type: 'string' })
          : XLSX.read(new Uint8Array(result), { type: 'array' });

        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        analyzeResources(data);
      } catch (err) {
        showTemplateHint(t('alertError') + err.message);
      } finally {
        loadingEl.remove();
      }
    }));
  };

  reader.onerror = function () {
    loadingEl.remove();
    showTemplateHint(t('alertError') + reader.error);
  };

  isCsv ? reader.readAsText(file, 'UTF-8') : reader.readAsArrayBuffer(file);
}

// ==========================================================
// Column detection helpers
// ==========================================================
function findColumn(headers, exact, partial, exclude) {
  for (const h of headers) {
    if (exact.includes(String(h ?? '').toLowerCase().trim())) return h;
  }
  for (const h of headers) {
    const low = String(h ?? '').toLowerCase();
    if (exclude && exclude.some(e => low.includes(e))) continue;
    if (partial.some(p => low.includes(p))) return h;
  }
  return null;
}

const findTypeCol  = h => findColumn(h,
  ['type','resource type','tipo','tipo de recurso','resourcetype','resource_type','tipo recurso'],
  ['type','tipo']);

const findNameCol  = h => findColumn(h,
  ['name','nome','resource name','nome do recurso','resourcename','resource_name'],
  ['name','nome'],
  ['resourcegroupname','resource group','grupo de recursos','resourcegroup','servicename','service name','meter']);

const findLinkCol  = h => findColumn(h,
  ['link de recursos','resource link','link','url','resource id','resourceid','resource_id','id do recurso'],
  ['link','url','resource id']);

const findRGCol    = h => findColumn(h,
  ['resource group','grupo de recursos','resourcegroup','resource_group','grupo recursos','rg','resourcegroupname'],
  ['resource group','grupo de recursos','grupo recursos','resourcegroup']);

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

/** Look up migration notes/dependencies i18n key for a resource type */
function getNoteKeyForType(rawType) {
  if (!rawType) return '';
  const clean = rawType.toLowerCase().trim();
  if (MOVE_NOTES[clean]) return MOVE_NOTES[clean];
  // Try progressively shorter paths (for child resources)
  const parts = clean.split('/');
  for (let len = parts.length; len >= 2; len--) {
    const attempt = parts.slice(0, len).join('/');
    if (MOVE_NOTES[attempt]) return MOVE_NOTES[attempt];
  }
  return '';
}

/** Look up user-friendly display name for an Azure resource type (memoized) */
const _friendlyCache = new Map();
function getFriendlyName(rawType) {
  if (!rawType) return '';
  const cached = _friendlyCache.get(rawType);
  if (cached !== undefined) return cached;

  const clean = rawType.toLowerCase().trim();
  let result;
  if (FRIENDLY_NAMES[clean]) {
    result = FRIENDLY_NAMES[clean];
  } else {
    // Try progressively shorter paths (for child resources)
    const parts = clean.split('/');
    let found = '';
    for (let len = parts.length; len >= 2; len--) {
      const attempt = parts.slice(0, len).join('/');
      if (FRIENDLY_NAMES[attempt]) { found = FRIENDLY_NAMES[attempt]; break; }
    }
    if (found) {
      result = found;
    } else {
      // Fallback: derive from the last segment
      const last = parts[parts.length - 1] || '';
      result = last.replace(/([a-z])([A-Z])/g, '$1 $2')
                   .replace(/^./, c => c.toUpperCase());
    }
  }
  _friendlyCache.set(rawType, result);
  return result;
}

/** Build documentation URL from resource type provider namespace.
 *  Uses current language locale; falls back to en-us when unsupported. */
function getDocUrlForType(rawType) {
  if (!rawType) return '';
  const clean = rawType.toLowerCase().trim().replace(/^\//, '');
  const provider = clean.split('/')[0];
  if (!provider || !provider.startsWith('microsoft.')) return '';
  const anchor = provider.replace(/\./g, '').toLowerCase();
  // Locale map kept inside the function so it can be loaded standalone (tests)
  const DOC_LOCALE_MAP = {
    'en': 'en-us', 'pt-BR': 'pt-br', 'zh-CN': 'zh-cn',
    'es': 'es-es', 'fr': 'fr-fr', 'ar': 'en-us', // ar not on Learn
    'ru': 'ru-ru', 'ja': 'ja-jp'
  };
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
  const locale = DOC_LOCALE_MAP[lang] || 'en-us';
  return `https://learn.microsoft.com/${locale}/azure/azure-resource-manager/management/move-support-resources#${anchor}`;
}

function getStatus(info) {
  if (!info) return 'unknown';
  if (info.moveRG === 1 && info.moveSub === 1) return 'movable';
  if (info.moveRG === 1 || info.moveSub === 1 || info.moveRegion === 1) return 'partial';
  return 'not-movable';
}

// ==========================================================
// Template download
// ==========================================================
const templateHint = document.getElementById('templateHint');
const templateMsg  = document.getElementById('templateMsg');
const templateBtn  = document.getElementById('templateDownloadBtn');

function downloadTemplate() {
  const headers = [t('csvName'), t('csvType'), t('csvRG'), t('csvLocation'), 'Resource ID'];
  const csvEscape = s => '"' + String(s).replace(/"/g, '""') + '"';
  const csv = headers.map(csvEscape).join(',') + '\n';
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'cloud-move-analyzer-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function showTemplateHint(reason) {
  templateMsg.textContent = reason;
  templateBtn.textContent = t('templateBtn');
  templateHint.classList.remove('hidden');
}

function hideTemplateHint() {
  templateHint.classList.add('hidden');
}

templateBtn.addEventListener('click', downloadTemplate);

// ==========================================================
// Analysis
// ==========================================================
function analyzeResources(data) {
  hideTemplateHint();

  // Reset filters so the new file is shown unfiltered
  currentFilter = 'all';
  currentSearch = '';
  searchInput.value = '';
  document.querySelectorAll('.stat-card[data-filter]').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === 'all');
    c.setAttribute('aria-pressed', c.dataset.filter === 'all');
  });

  if (!data.length) {
    showTemplateHint(t('alertEmpty'));
    return;
  }

  const headers = Object.keys(data[0]);
  const typeCol = findTypeCol(headers);
  const nameCol = findNameCol(headers);
  const linkCol = findLinkCol(headers);
  const rgCol   = findRGCol(headers);
  const locCol  = findLocCol(headers);

  if (!typeCol && !linkCol) {
    showTemplateHint(t('alertNoCols') + headers.join(', '));
    return;
  }

  // Warn about missing optional columns
  const missing = [];
  if (!nameCol) missing.push(t('csvName'));
  if (!rgCol)   missing.push(t('csvRG'));
  if (!locCol)  missing.push(t('csvLocation'));
  if (missing.length) {
    showTemplateHint(t('templateMissing') + missing.join(', '));
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
      status:        getStatus(info),
      noteKey:       getNoteKeyForType(finalType),
      docUrl:        getDocUrlForType(finalType)
    };
  }).filter(r => r.type !== '—');

  // Deduplicate (Cost Management exports list same resource for each meter)
  // Only dedup when name and resourceGroup are real values (not missing)
  if (nameCol && rgCol) {
    const seen = new Set();
    allResults = allResults.filter(r => {
      const key = (r.type + '|' + r.name + '|' + r.resourceGroup).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Incompatible spreadsheet: had data and a type column, but no row resolved
  // to a known Azure resource type (e.g., user uploaded an unrelated file).
  if (!allResults.length) {
    resultsSection.classList.add('hidden');
    mainEl.classList.remove('has-results');
    showTemplateHint(t('alertIncompatible'));
    return;
  }

  // If every resolved type is "unknown" (not in MOVE_DB), the spreadsheet
  // technically parsed but contains no recognizable Azure resources.
  const anyKnown = allResults.some(r => r.status !== 'unknown');
  if (!anyKnown) {
    resultsSection.classList.add('hidden');
    mainEl.classList.remove('has-results');
    showTemplateHint(t('alertIncompatible'));
    return;
  }

  updateStats();
  renderTable();
  const wasVisible = !resultsSection.classList.contains('hidden');
  resultsSection.classList.remove('hidden');
  mainEl.classList.add('has-results');
  if (!wasVisible) {
    resultsSection.scrollIntoView({ behavior: PREFERS_REDUCED_MOTION ? 'auto' : 'smooth' });
  }
}

// ==========================================================
// Stats
// ==========================================================
function updateStats() {
  let movable = 0, partial = 0, notMovable = 0, unknownCount = 0;
  for (const r of allResults) {
    if (r.status === 'movable') movable++;
    else if (r.status === 'partial') partial++;
    else if (r.status === 'not-movable') notMovable++;
    else unknownCount++;
  }
  const total = allResults.length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statMovable').textContent = movable;
  document.getElementById('statPartial').textContent = partial;
  document.getElementById('statNotMovable').textContent = notMovable;
  document.getElementById('statUnknown').textContent = unknownCount;

  // Descriptive aria-labels for stat cards
  document.querySelector('.stat-card.total').setAttribute('aria-label', `${t('statTotal')}: ${total}`);
  document.querySelector('.stat-card.movable').setAttribute('aria-label', `${t('statMovable')}: ${movable}`);
  document.querySelector('.stat-card.partial').setAttribute('aria-label', `${t('statPartial')}: ${partial}`);
  document.querySelector('.stat-card.not-movable').setAttribute('aria-label', `${t('statNotMovable')}: ${notMovable}`);

  const unknownCard = document.getElementById('statUnknownCard');
  unknownCard.setAttribute('aria-label', `${t('statUnknown')}: ${unknownCount}`);
  if (unknownCount > 0) {
    unknownCard.classList.remove('hidden');
  } else {
    unknownCard.classList.add('hidden');
  }
}

// ==========================================================
// Rendering helpers
// ==========================================================
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ESC_MAP[c]);
}

function badgeFor(value) {
  if (value === 1) return `<span class="badge yes">${t('badgeYes')}</span>`;
  if (value === 0) return `<span class="badge no">${t('badgeNo')}</span>`;
  return `<span class="badge unknown">${t('badgeNA') || 'N/A'}</span>`;
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

// Data used by exports (CSV/MD/PDF): always returns the full analyzed set,
// applying only the search query — never the status filter (clicking a stat
// card should not reduce exports). Sort is applied for consistent output.
function getExportData() {
  let results = allResults.slice();

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    results = results.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      (r.displayType   && r.displayType.toLowerCase().includes(q)) ||
      (r.resourceGroup && r.resourceGroup.toLowerCase().includes(q)) ||
      (r.location      && r.location.toLowerCase().includes(q)) ||
      (r.type          && getFriendlyName(r.type).toLowerCase().includes(q)) ||
      (r.noteKey       && t(r.noteKey).toLowerCase().includes(q))
    );
  }

  if (sortCol) {
    const dir = sortAsc ? 1 : -1;
    const getVal = sortCol === 'noteKey'
      ? r => (r.noteKey ? t(r.noteKey) : '')
      : sortCol === 'friendlyName'
        ? r => getFriendlyName(r.type)
        : r => r[sortCol];
    results.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === 'string' || typeof vb === 'string') {
        return _collator.compare(String(va ?? ''), String(vb ?? '')) * dir;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return  1 * dir;
      return 0;
    });
  }
  return results;
}

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
      (r.resourceGroup && r.resourceGroup.toLowerCase().includes(q)) ||
      (r.location      && r.location.toLowerCase().includes(q)) ||
      (r.type          && getFriendlyName(r.type).toLowerCase().includes(q)) ||
      (r.noteKey       && t(r.noteKey).toLowerCase().includes(q))
    );
  }
  if (sortCol) {
    const dir = sortAsc ? 1 : -1;
    // For the "notes" column, sort by the translated text (not the i18n key)
    // For "friendlyName", sort by the computed friendly name
    const getVal = sortCol === 'noteKey'
      ? r => (r.noteKey ? t(r.noteKey) : '')
      : sortCol === 'friendlyName'
        ? r => getFriendlyName(r.type)
        : r => r[sortCol];
    results = [...results].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === 'string' || typeof vb === 'string') {
        return _collator.compare(String(va ?? ''), String(vb ?? '')) * dir;
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return  1 * dir;
      return 0;
    });
  }
  return results;
}

// ==========================================================
// Note cell renderer (text + optional doc link)
// ==========================================================
function renderNoteCell(r) {
  const docLink = r.docUrl
    ? `<a href="${escapeHtml(r.docUrl)}" target="_blank" rel="noopener noreferrer" class="doc-link" title="${escapeHtml(t('docLinkTitle'))}">${escapeHtml(t('docLinkText'))}</a>`
    : '';
  if (!r.noteKey) return docLink || '—';
  const noteText = escapeHtml(t(r.noteKey));
  return docLink ? noteText + '<br>' + docLink : noteText;
}

// ==========================================================
// Table rendering
// ==========================================================
function renderTable() {
  const filtered = getFiltered();
  updateSortIndicators();

  // Update results count
  const countEl = document.getElementById('resultsCount');
  if (currentFilter !== 'all' || currentSearch) {
    countEl.textContent = t('resultsCount').replace('{filtered}', filtered.length).replace('{total}', allResults.length);
  } else {
    countEl.textContent = '';
  }

  if (!filtered.length) {
    // Compute visible column count so colspan is correct after column toggles
    const visibleCols = colPickerMenu.querySelectorAll('input[data-col]:checked').length || 1;
    tableBody.innerHTML = `
      <tr><td colspan="${visibleCols}">
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
          </svg>
          <p>${t('emptyState')}</p>
        </div>
      </td></tr>`;
    return;
  }

  const cellBuilders = {
    name:          r => `<td>${escapeHtml(r.name)}</td>`,
    type:          r => `<td><code class="type-tag">${escapeHtml(r.type)}</code></td>`,
    friendlyName:  r => `<td>${escapeHtml(getFriendlyName(r.type))}</td>`,
    resourceGroup: r => `<td class="cell-muted">${escapeHtml(r.resourceGroup || '—')}</td>`,
    location:      r => `<td class="cell-muted">${escapeHtml(r.location || '—')}</td>`,
    moveRG:        r => `<td>${badgeFor(r.moveRG)}</td>`,
    moveSub:       r => `<td>${badgeFor(r.moveSub)}</td>`,
    moveRegion:    r => `<td>${badgeFor(r.moveRegion)}</td>`,
    status:        r => `<td>${statusBadge(r.status, r)}</td>`,
    notes:         r => `<td class="cell-notes">${renderNoteCell(r)}</td>`
  };

  const order = getColumnOrder();
  const fragment = document.createDocumentFragment();
  for (const r of filtered) {
    const tr = document.createElement('tr');
    tr.innerHTML = order.map(col => cellBuilders[col](r)).join('');
    fragment.appendChild(tr);
  }
  tableBody.replaceChildren(fragment);

  // Reorder header to match (skip if order unchanged since last render)
  const thead = resultsTable.querySelector('thead tr');
  if (thead) {
    const orderKey = order.join('|');
    if (resultsTable.dataset.lastOrder !== orderKey) {
      const thMap = {};
      Array.from(thead.children).forEach(th => {
        const colId = th.dataset.colId;
        if (colId) thMap[colId] = th;
      });
      for (const key of order) {
        if (thMap[key]) thead.appendChild(thMap[key]);
      }
      resultsTable.dataset.lastOrder = orderKey;
    }
  }
}

// ==========================================================
// Sort indicators (↑ / ↓ — only shown on active sort column)
// ==========================================================
function updateSortIndicators() {
  document.querySelectorAll('th[data-sort]').forEach(th => {
    const col = sortMap[th.dataset.sort];
    const key = th.dataset.i18n;
    const label = key ? t(key).replace(/\s*[↕↑↓]\s*$/, '') : th.textContent.replace(/\s*[↕↑↓]\s*$/, '');
    const arrow = (col === sortCol) ? (sortAsc ? ' ↑' : ' ↓') : '';
    th.textContent = label + arrow;
    th.setAttribute('aria-sort',
      col === sortCol ? (sortAsc ? 'ascending' : 'descending') : 'none');
  });
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
// Search (debounced)
// ==========================================================
let searchTimer = null;
searchInput.addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentSearch = e.target.value;
    renderTable();
  }, SEARCH_DEBOUNCE_MS);
});

// ==========================================================
// Sorting (sortMap is declared at top of file to avoid TDZ)
// ==========================================================
document.querySelectorAll('th[data-sort]').forEach(th => {
  // Make sortable headers reachable & operable by keyboard
  if (!th.hasAttribute('tabindex')) th.setAttribute('tabindex', '0');
  // Note: <th> already has implicit role=columnheader; do NOT override.

  const triggerSort = () => {
    const col = sortMap[th.dataset.sort];
    if (sortCol === col) { sortAsc = !sortAsc; }
    else { sortCol = col; sortAsc = true; }
    renderTable();
  };

  th.addEventListener('click', triggerSort);
  th.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerSort();
    }
  });
});

// Keep sort arrows in sync when language changes (applyLanguage re-renders table)
// updateSortIndicators() runs at the end of renderTable()

// ==========================================================
// CSV export
// ==========================================================
exportBtn.addEventListener('click', () => {
  if (!allResults.length) return;

  const filtered = getExportData();
  if (!filtered.length) return;
  const cols = getExportCols();

  const statusLabel = {
    'movable': t('csvMovable'), 'partial': t('csvPartial'),
    'not-movable': t('csvNotMovable'), 'unknown': t('csvNotFound')
  };
  const yesNo = v => v === 1 ? t('csvYes') : v === 0 ? t('csvNo') : 'N/A';
  const csvEscape = s => '"' + String(s).replace(/"/g, '""') + '"';

  // Column definitions: [key, headerLabel, valueFn]
  const allColDefs = {
    name:          [t('csvName'),        r => r.name],
    type:          [t('csvType'),        r => r.type],
    friendlyName:  [t('thFriendlyName'), r => getFriendlyName(r.type)],
    resourceGroup: [t('csvRG'),          r => r.resourceGroup || ''],
    location:      [t('csvLocation'),    r => r.location || ''],
    moveRG:        [t('csvMoveRG'),      r => yesNo(r.moveRG)],
    moveSub:       [t('csvMoveSub'),     r => yesNo(r.moveSub)],
    moveRegion:    [t('csvMoveRegion'),  r => yesNo(r.moveRegion)],
    status:        [t('csvStatus'),      r => statusLabel[r.status]],
    notes:         [t('csvNotes'),       r => r.noteKey ? t(r.noteKey) : ''],
  };
  const colDefs = getColumnOrder()
    .filter(k => cols[k])
    .map(k => [k, allColDefs[k][0], allColDefs[k][1]]);
  // Append Doc URL if notes is visible
  if (cols['notes']) colDefs.push(['notes', t('csvDocUrl'), r => r.docUrl || '']);

  let csv = colDefs.map(d => csvEscape(d[1])).join(',') + '\n';
  for (const r of filtered) {
    csv += colDefs.map(d => csvEscape(d[2](r))).join(',') + '\n';
  }

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'cloud-move-analyzer-export.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Delay revoke so Firefox/Safari can complete the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// ==========================================================
// Markdown export
// ==========================================================
const exportMdBtn = document.getElementById('exportMdBtn');
exportMdBtn.addEventListener('click', () => {
  if (!allResults.length) return;

  const filtered = getExportData();
  if (!filtered.length) return;
  const cols = getExportCols();

  const statusLabel = {
    'movable': t('csvMovable'), 'partial': t('csvPartial'),
    'not-movable': t('csvNotMovable'), 'unknown': t('csvNotFound')
  };
  const yesNo = v => v === 1 ? '✅' : v === 0 ? '❌' : '—';
  const statusEmoji = s => s === 'movable' ? '🟢' : s === 'partial' ? '🟡' : s === 'not-movable' ? '🔴' : '⚫';

  // Summary counts
  let movable = 0, partial = 0, notMovable = 0, unknownCount = 0;
  for (const r of filtered) {
    if (r.status === 'movable') movable++;
    else if (r.status === 'partial') partial++;
    else if (r.status === 'not-movable') notMovable++;
    else unknownCount++;
  }

  const date = new Date().toLocaleDateString(currentLang || 'en', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  let md = `<img src="https://cloudmoveanalyzer.com/assets/logo.png" alt="Cloud Move Analyzer" width="96" align="right" />\n\n`;
  md += `# Cloud Move Analyzer — ${t('title') || 'Report'}\n\n`;
  md += `> ${t('exportHint')}\n\n`;
  md += `**${date}** | ${t('statTotal')}: **${filtered.length}**`;
  md += ` | 🟢 ${t('statMovable')}: **${movable}**`;
  md += ` | 🟡 ${t('statPartial')}: **${partial}**`;
  md += ` | 🔴 ${t('statNotMovable')}: **${notMovable}**`;
  if (unknownCount) md += ` | ⚫ ${t('statUnknown')}: **${unknownCount}**`;
  md += '\n\n';

  // Column definitions for MD: [key, header, align, valueFn]
  const allMdCols = {
    name:          [t('csvName'),        '---',   r => r.name],
    type:          [t('csvType'),        '---',   r => '`' + r.type + '`'],
    friendlyName:  [t('thFriendlyName'), '---',   r => getFriendlyName(r.type)],
    resourceGroup: [t('csvRG'),          '---',   r => r.resourceGroup || '—'],
    location:      [t('csvLocation'),    '---',   r => r.location || '—'],
    moveRG:        [t('csvMoveRG'),      ':---:',  r => yesNo(r.moveRG)],
    moveSub:       [t('csvMoveSub'),     ':---:',  r => yesNo(r.moveSub)],
    moveRegion:    [t('csvMoveRegion'),  ':---:',  r => yesNo(r.moveRegion)],
    status:        [t('csvStatus'),      '---',   r => statusEmoji(r.status) + ' ' + statusLabel[r.status]],
    notes:         [t('csvNotes'),       '---',   r => {
      const note = r.noteKey ? t(r.noteKey).replace(/\|/g, '\\|').replace(/\n/g, ' ') : '—';
      const docLink = r.docUrl ? ` [📄](${r.docUrl})` : '';
      return note + docLink;
    }]
  };
  const mdCols = getColumnOrder()
    .filter(k => cols[k])
    .map(k => [k, allMdCols[k][0], allMdCols[k][1], allMdCols[k][2]]);

  // Table header
  md += '| ' + mdCols.map(d => d[1]).join(' | ') + ' |\n';
  md += '|' + mdCols.map(d => d[2]).join('|') + '|\n';

  for (const r of filtered) {
    md += '| ' + mdCols.map(d => d[3](r)).join(' | ') + ' |\n';
  }

  md += `\n---\n*Generated by [Cloud Move Analyzer](https://cloudmoveanalyzer.com/) — cloudmoveanalyzer.com*\n`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'cloud-move-analyzer-export.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// ==========================================================
// PDF export (browser print)
// ==========================================================
const exportPdfBtn = document.getElementById('exportPdfBtn');
exportPdfBtn.addEventListener('click', () => {
  if (!allResults.length) return;

  const filtered = getExportData();
  if (!filtered.length) return;
  const cols = getExportCols();

  const statusLabel = {
    'movable': t('csvMovable'), 'partial': t('csvPartial'),
    'not-movable': t('csvNotMovable'), 'unknown': t('csvNotFound')
  };
  const yesNo = v => v === 1 ? '✅ ' + t('csvYes') : v === 0 ? '❌ ' + t('csvNo') : '—';
  const statusColor = s => s === 'movable' ? '#22c55e' : s === 'partial' ? '#eab308' : s === 'not-movable' ? '#ef4444' : '#6b7280';

  // Summary counts
  let movable = 0, partial = 0, notMovable = 0, unknownCount = 0;
  for (const r of filtered) {
    if (r.status === 'movable') movable++;
    else if (r.status === 'partial') partial++;
    else if (r.status === 'not-movable') notMovable++;
    else unknownCount++;
  }

  const date = new Date().toLocaleDateString(currentLang || 'en', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Column definitions for PDF: [key, header, cellFn]
  const allPdfCols = {
    name:          [t('csvName'),        r => `<td>${escapeHtml(r.name)}</td>`],
    type:          [t('csvType'),        r => `<td><code>${escapeHtml(r.type)}</code><br><em style="font-size:10px;color:#64748b">${escapeHtml(getFriendlyName(r.type))}</em></td>`],
    friendlyName:  [t('thFriendlyName'), r => `<td>${escapeHtml(getFriendlyName(r.type))}</td>`],
    resourceGroup: [t('csvRG'),          r => `<td>${escapeHtml(r.resourceGroup || '—')}</td>`],
    location:      [t('csvLocation'),    r => `<td>${escapeHtml(r.location || '—')}</td>`],
    moveRG:        [t('csvMoveRG'),      r => `<td style="text-align:center">${yesNo(r.moveRG)}</td>`],
    moveSub:       [t('csvMoveSub'),     r => `<td style="text-align:center">${yesNo(r.moveSub)}</td>`],
    moveRegion:    [t('csvMoveRegion'),  r => `<td style="text-align:center">${yesNo(r.moveRegion)}</td>`],
    status:        [t('csvStatus'),      r => `<td><span style="color:${statusColor(r.status)};font-weight:600">${escapeHtml(statusLabel[r.status])}</span></td>`],
    notes:         [t('csvNotes'),       r => `<td style="font-size:11px">${r.noteKey ? escapeHtml(t(r.noteKey)) : '—'}</td>`]
  };
  const pdfCols = getColumnOrder()
    .filter(k => cols[k])
    .map(k => [k, allPdfCols[k][0], allPdfCols[k][1]]);

  // Build rows
  let rows = '';
  for (const r of filtered) {
    rows += '<tr>' + pdfCols.map(d => d[2](r)).join('') + '</tr>';
  }

  const thHtml = pdfCols.map(d => `<th>${escapeHtml(d[1])}</th>`).join('\n  ');

  const movablePct = Math.round((movable / filtered.length) * 100);
  const partialPct = Math.round((partial / filtered.length) * 100);
  const notMovPct  = Math.round((notMovable / filtered.length) * 100);

  const html = `<!DOCTYPE html>
<html lang="${currentLang || 'en'}">
<head>
<meta charset="UTF-8"/>
<title>Cloud Move Analyzer — Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:auto}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:20px 20px 40px;color:#1e293b;font-size:12px}
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
  .header img{width:96px;height:96px}
  h1{font-size:18px}
  .meta{color:#64748b;margin-bottom:12px;font-size:12px}
  .summary{display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap}
  .summary span{padding:4px 10px;border-radius:6px;font-weight:600;font-size:12px}
  .s-total{background:#e2e8f0}
  .s-mov{background:#dcfce7;color:#166534}
  .s-par{background:#fef9c3;color:#854d0e}
  .s-not{background:#fee2e2;color:#991b1b}
  .s-unk{background:#f1f5f9;color:#475569}
  .exec-summary{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin-bottom:16px}
  .exec-summary h2{font-size:14px;margin-bottom:8px;color:#0f172a}
  .exec-summary p{font-size:12px;line-height:1.6;color:#334155;margin-bottom:6px}
  .exec-summary .glossary{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;margin-bottom:8px}
  .exec-summary .glossary span{font-size:11px;font-weight:500}
  .exec-summary .recommendation{background:#eff6ff;border-left:3px solid #3b82f6;padding:6px 10px;border-radius:0 4px 4px 0;font-size:11px;color:#1e40af;margin-top:8px}
  table{width:100%;border-collapse:collapse;margin-bottom:12px}
  th,td{border:1px solid #cbd5e1;padding:4px 6px;text-align:left;font-size:11px}
  th{background:#f1f5f9;font-weight:600;font-size:11px}
  tr:nth-child(even){background:#f8fafc}
  thead{display:table-header-group} /* repeat header on each printed page */
  tr{page-break-inside:avoid;break-inside:avoid}
  code{background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:10px}
  .page-break{page-break-after:always;break-after:page}
  .data-table{width:100%;border-collapse:collapse;margin-bottom:12px}
  .data-table th,.data-table td{border:1px solid #cbd5e1;padding:4px 6px;text-align:left;font-size:11px}
  .data-table th{background:#f1f5f9;font-weight:600;font-size:11px}
  .data-table tr:nth-child(even){background:#f8fafc}
  .print-footer{position:fixed;bottom:0;left:0;right:0;text-align:center;color:#94a3b8;font-size:9px;font-family:inherit;background:#fff;padding:4px 0 6px;border-top:1px solid #e2e8f0;z-index:9999}
  @media print{
    body{padding:10px 10px 30mm}
    @page{size:landscape;margin:10mm 10mm 22mm 10mm}
    .print-footer{padding:3mm 0 4mm}
  }
</style>
</head>
<body>
<div class="header">
  <h1>Cloud Move Analyzer</h1>
  <img src="https://cloudmoveanalyzer.com/assets/logo.png" alt="Cloud Move Analyzer" />
</div>
<p class="meta">${date}</p>
<div class="summary">
  <span class="s-total">${t('statTotal')}: ${filtered.length}</span>
  <span class="s-mov">🟢 ${t('statMovable')}: ${movable}</span>
  <span class="s-par">🟡 ${t('statPartial')}: ${partial}</span>
  <span class="s-not">🔴 ${t('statNotMovable')}: ${notMovable}</span>
  ${unknownCount ? `<span class="s-unk">⚫ ${t('statUnknown')}: ${unknownCount}</span>` : ''}
</div>
<div class="exec-summary">
  <h2>${t('execSummaryTitle')}</h2>
  <p>${t('execSummaryIntro').replace('{total}', filtered.length).replace('{movable}', movable).replace('{movablePct}', movablePct).replace('{partial}', partial).replace('{notMovable}', notMovable)}</p>
  <div class="glossary">
    ${movable   ? `<span>🟢 <b>${t('csvMovable')}</b>: ${t('execGlossaryMovable')}</span>` : ''}
    ${partial   ? `<span>🟡 <b>${t('csvPartial')}</b>: ${t('execGlossaryPartial')}</span>` : ''}
    ${notMovable? `<span>🔴 <b>${t('csvNotMovable')}</b>: ${t('execGlossaryNotMovable')}</span>` : ''}
    ${unknownCount ? `<span>⚫ <b>${t('csvNotFound')}</b>: ${t('execGlossaryUnknown')}</span>` : ''}
  </div>
  <div class="recommendation">${movablePct >= 70
    ? t('execRecHigh').replace('{pct}', movablePct)
    : movablePct >= 40
      ? t('execRecMedium').replace('{pct}', movablePct).replace('{partialPct}', partialPct)
      : t('execRecLow').replace('{pct}', notMovPct)}</div>
</div>
${(() => {
  // Critical resources: those with migration notes
  const critical = filtered.filter(r => r.noteKey);
  if (!critical.length) return '';
  // Deduplicate by type
  const seen = new Set();
  const unique = [];
  for (const r of critical) {
    const key = r.type.toLowerCase();
    if (!seen.has(key)) { seen.add(key); unique.push(r); }
  }
  let html = '<div class="exec-summary" style="margin-top:12px">';
  html += '<h2>⚠️ ' + t('execCriticalTitle') + '</h2>';
  html += '<p style="margin-bottom:8px">' + t('execCriticalIntro') + '</p>';
  html += '<table class="data-table" style="margin:0"><thead><tr><th>' + t('csvType') + '</th><th>' + t('thFriendlyName') + '</th><th>' + t('csvNotes') + '</th></tr></thead><tbody>';
  for (const r of unique) {
    html += '<tr><td><code>' + escapeHtml(r.type) + '</code></td>';
    html += '<td>' + escapeHtml(getFriendlyName(r.type)) + '</td>';
    html += '<td style="font-size:11px">' + escapeHtml(t(r.noteKey)) + '</td></tr>';
  }
  html += '</tbody></table></div>';
  return html;
})()}
<div class="page-break"></div>
<table class="data-table">
<thead><tr>
  ${thHtml}
</tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="print-footer">Generated by Cloud Move Analyzer — cloudmoveanalyzer.com</div>
</body>
</html>`;

  // Use a hidden iframe to print without opening a new tab
  const oldFrame = document.getElementById('pdfPrintFrame');
  if (oldFrame) oldFrame.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'pdfPrintFrame';
  iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:0;height:0;border:none;';
  document.body.appendChild(iframe);

  // Safety net: always remove the iframe eventually, even if afterprint never fires
  let removed = false;
  const removeFrame = () => {
    if (removed) return;
    removed = true;
    iframe.remove();
  };
  const safetyTimer = setTimeout(removeFrame, PRINT_IFRAME_TTL_MS);

  // Prefer srcdoc when available (avoids deprecated document.write)
  const useSrcdoc = 'srcdoc' in iframe;
  const onReady = () => {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    iframe.contentWindow.addEventListener('afterprint', () => {
      clearTimeout(safetyTimer);
      setTimeout(removeFrame, 500);
    });

    const img = doc.querySelector('.header img');
    const triggerPrint = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };

    if (img && !img.complete) {
      img.addEventListener('load', triggerPrint);
      img.addEventListener('error', triggerPrint);
    } else {
      setTimeout(triggerPrint, 100);
    }
  };

  if (useSrcdoc) {
    iframe.addEventListener('load', onReady, { once: true });
    iframe.srcdoc = html;
  } else {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    onReady();
  }
});
