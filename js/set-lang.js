/* Set <html lang> and dir early (before crawlers parse body).
   Runs before i18n.js / app.js. Uses localStorage or browser language. */
(function () {
  try {
    var saved = localStorage.getItem('azure-move-lang');
    var nav = (navigator.language || 'en');
    var supported = ['en', 'pt-BR', 'zh-CN', 'es', 'fr', 'ar', 'ru', 'ja'];
    var lang = saved || (supported.indexOf(nav) !== -1 ? nav : (nav.indexOf('pt') === 0 ? 'pt-BR' : nav.split('-')[0]));
    if (supported.indexOf(lang) === -1) lang = 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  } catch (e) { /* localStorage unavailable (private mode) */ }
})();
