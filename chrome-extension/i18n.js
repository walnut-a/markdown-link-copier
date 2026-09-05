export const DEFAULT_UI_LANGUAGE = 'auto';
export const UI_LANGUAGES = ['auto', 'zh_CN', 'en'];

export const normalizeUiLanguage = (value) =>
  UI_LANGUAGES.includes(value) ? value : DEFAULT_UI_LANGUAGE;

const getBrowserLanguage = () =>
  globalThis.chrome?.i18n?.getUILanguage?.() || globalThis.navigator?.language || 'en';

export const resolveUiLanguage = (preference = DEFAULT_UI_LANGUAGE, browserLanguage) => {
  const normalized = normalizeUiLanguage(preference);
  if (normalized !== DEFAULT_UI_LANGUAGE) {
    return normalized;
  }

  return /^zh(?:[-_]|$)/i.test(browserLanguage || getBrowserLanguage()) ? 'zh_CN' : 'en';
};

const formatMessage = (message, replacements = {}) =>
  message.replace(/\$([A-Z0-9_]+)\$/gi, (match, name) => {
    const value = replacements[name] ?? replacements[name.toLowerCase()];
    return value === undefined ? match : String(value);
  });

export const createTranslator = (catalog = {}) => (key, replacements = {}) => {
  const entry = catalog[key];
  const message = typeof entry === 'string' ? entry : entry?.message;
  return message ? formatMessage(message, replacements) : key;
};

export const createBrowserI18n = () => ({
  language: resolveUiLanguage(DEFAULT_UI_LANGUAGE),
  t: (key, replacements = {}) => {
    const substitutions = Object.values(replacements).map(String);
    return globalThis.chrome?.i18n?.getMessage?.(key, substitutions) || key;
  }
});

export const loadLocaleCatalog = async (
  language,
  {
    fetchImpl = globalThis.fetch,
    getUrl = (relativePath) => globalThis.chrome.runtime.getURL(relativePath)
  } = {}
) => {
  const response = await fetchImpl(getUrl(`_locales/${language}/messages.json`));
  if (!response.ok) {
    throw new Error(`Unable to load locale catalog: ${language}`);
  }
  return response.json();
};

export const createI18n = async (preference = DEFAULT_UI_LANGUAGE, options = {}) => {
  const language = resolveUiLanguage(preference, options.browserLanguage);

  try {
    const catalog = await loadLocaleCatalog(language, options);
    return { language, t: createTranslator(catalog) };
  } catch (error) {
    console.warn('Unable to load the selected locale catalog.', error);
    return createBrowserI18n();
  }
};

export const localizeDocument = (documentRef, i18n) => {
  if (!documentRef || !i18n) {
    return;
  }

  if (documentRef.documentElement) {
    documentRef.documentElement.lang = i18n.language === 'zh_CN' ? 'zh-CN' : 'en';
  }

  documentRef.querySelectorAll?.('[data-i18n]').forEach((element) => {
    element.textContent = i18n.t(element.dataset.i18n);
  });

  [
    ['data-i18n-aria-label', 'aria-label'],
    ['data-i18n-title', 'title'],
    ['data-i18n-placeholder', 'placeholder']
  ].forEach(([dataAttribute, targetAttribute]) => {
    documentRef.querySelectorAll?.(`[${dataAttribute}]`).forEach((element) => {
      element.setAttribute(targetAttribute, i18n.t(element.getAttribute(dataAttribute)));
    });
  });
};
