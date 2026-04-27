/* Set <html lang> and dir early (before crawlers parse body).
   Runs before i18n.js / app.js. Uses localStorage or browser language. */
(function () {
  var SUPPORTED = ['en', 'pt-BR', 'zh-CN', 'es', 'fr', 'ar', 'ru', 'ja'];
  // Map common locale variants to a supported language code
  var VARIANT_MAP = {
    'pt': 'pt-BR', 'pt-PT': 'pt-BR', 'pt-br': 'pt-BR',
    'zh': 'zh-CN', 'zh-TW': 'zh-CN', 'zh-HK': 'zh-CN', 'zh-SG': 'zh-CN', 'zh-cn': 'zh-CN',
    'en-GB': 'en', 'en-US': 'en', 'en-CA': 'en', 'en-AU': 'en',
    'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es', 'es-CL': 'es',
    'fr-FR': 'fr', 'fr-CA': 'fr', 'fr-BE': 'fr',
    'ar-SA': 'ar', 'ar-EG': 'ar', 'ar-AE': 'ar',
    'ru-RU': 'ru',
    'ja-JP': 'ja'
  };

  function resolveLang(raw) {
    if (!raw) return 'en';
    if (SUPPORTED.indexOf(raw) !== -1) return raw;
    if (VARIANT_MAP[raw]) return VARIANT_MAP[raw];
    var base = raw.split('-')[0];
    if (SUPPORTED.indexOf(base) !== -1) return base;
    if (VARIANT_MAP[base]) return VARIANT_MAP[base];
    return 'en';
  }

  try {
    var saved = localStorage.getItem('azure-move-lang');
    var nav = (navigator.language || 'en');
    var lang = resolveLang(saved || nav);
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  } catch (e) { /* localStorage unavailable (private mode) */ }
})();

