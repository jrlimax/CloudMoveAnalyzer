/* ==========================================================
   Cloud Move Analyzer — i18n core (data is split per language)

   The actual translation strings live in `js/i18n/<lang>.js` files, each
   loaded as a separate <script>. This keeps the initial payload small:
   the user only pays for the language(s) they need (~14–22 KB each)
   instead of all 8 (~130 KB total).

   Pre-rendered pages (built by scripts/build.js) include the correct
   <lang>.js inline before this file. Root visitors get `en.js` and the
   detected language is lazy-loaded by `set-lang.js` (if non-default).
   ========================================================== */

// Shared store populated by js/i18n/<lang>.js side-effect scripts.
const I18N = (window.__I18N_DATA__ = window.__I18N_DATA__ || {});

// Current language & helper
// Resolution order: window.__CMA_LANG__ (pre-rendered page marker) > localStorage > 'en'.
let currentLang = (() => {
  try {
    if (typeof window !== 'undefined' && window.__CMA_LANG__) {
      return window.__CMA_LANG__;
    }
    return localStorage.getItem('azure-move-lang');
  } catch (e) { return null; }
})() || 'en';

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key])
      || (I18N.en && I18N.en[key])
      || key;
}

// Cache-busting suffix for lazy-loaded language packs. Bump alongside the
// version on the <script src="js/i18n/<lang>.js?v=…"> tags in index.html.
window.__I18N_VER__ = window.__I18N_VER__ || '1';

// Lazy-loader for language packs not yet present in I18N (used by the
// language picker when the user switches to a language we haven't shipped).
const _i18nLoaders = {};
function ensureI18nLoaded(lang) {
  if (I18N[lang]) return Promise.resolve();
  if (_i18nLoaders[lang]) return _i18nLoaders[lang];
  _i18nLoaders[lang] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    // Absolute path: pre-rendered pages live under /<lang>/, so a relative
    // 'js/i18n/...' would resolve to /<lang>/js/i18n/... and 404.
    s.src = '/js/i18n/' + lang + '.js?v=' + window.__I18N_VER__;
    s.async = false;
    s.onload  = () => resolve();
    s.onerror = () => { delete _i18nLoaders[lang]; reject(new Error('i18n load failed: ' + lang)); };
    document.head.appendChild(s);
  });
  return _i18nLoaders[lang];
}
