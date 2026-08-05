import { showPageFeedback } from './page-feedback.js';

const DEFAULT_TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_name',
  'utm_creative',
  'utm_reader',
  'utm_referrer',
  'ga_source',
  'ga_medium',
  'ga_campaign',
  'gclid',
  'dclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'fbclid',
  'twclid',
  'ttclid',
  'igshid',
  'yclid',
  'mc_cid',
  'mc_eid',
  'mkt_tok',
  'vero_conv',
  'vero_id',
  'hscta',
  'hscid',
  'hsckey',
  '_hsenc',
  '_hsmi',
  'hsctatracking',
  'ref_src',
  'spm',
  'spm_id_from',
  'scm',
  'scm_id',
  'share_source',
  'share_id',
  'share_channel',
  'share_medium',
  'share_from',
  'campaign_id',
  'cmpid',
  'ad_id',
  'adgroupid',
  'adset_id'
];

const DEFAULT_TRACKING_PREFIXES = [
  'utm_',
  'ga_',
  'pk_',
  'mc_',
  'mtm_',
  'spm',
  'icn',
  'icp',
  'scm',
  'mkt_',
  'vero_',
  'hsa_',
  'hs_'
];

const DEFAULT_CONDITIONAL_TRACKING_PARAM_GROUPS = [
  {
    markers: ['publication_id', 'isfreemail', 'triedredirect'],
    remove: ['publication_id', 'post_id', 'isfreemail', 'r', 'triedredirect']
  }
];

const DEFAULT_OUTPUT_TEMPLATE = '[{{markdownTitle}}]({{markdownUrl}})';
const OUTPUT_PRESETS = [
  { id: 'markdown', template: DEFAULT_OUTPUT_TEMPLATE },
  { id: 'title-url', template: '{{title}}\n{{url}}' },
  { id: 'url', template: '{{url}}' }
];
const SETTINGS_VERSION = 2;
const LEGACY_RISKY_TRACKING_PARAMS = [
  'ref',
  'ref_url',
  'referrer',
  'referrer_id',
  'referral',
  'refid',
  'source',
  'from',
  'share',
  'campaign'
];
const LEGACY_RISKY_TRACKING_PREFIXES = ['ref_', 'share_'];

const DEFAULT_SETTINGS = {
  settingsVersion: SETTINGS_VERSION,
  stripTitleSuffix: true,
  titleSeparators: [' - ', ' – ', ' — ', ' | ', ' ｜ ', ' · ', ' • ', ' _ ', ' / '],
  titleSuffixKeywords: [],
  trackingParams: DEFAULT_TRACKING_PARAMS,
  trackingPrefixes: DEFAULT_TRACKING_PREFIXES,
  conditionalTrackingParamGroups: DEFAULT_CONDITIONAL_TRACKING_PARAM_GROUPS,
  outputTemplate: DEFAULT_OUTPUT_TEMPLATE
};

const statusEl = document.getElementById('status');
const resultPanelEl = document.getElementById('result-panel');
const titleSourceEl = document.getElementById('title-source');
const cleanupSummaryEl = document.getElementById('cleanup-summary');
const resultPreviewEl = document.getElementById('result-preview');
const retryCopyButton = document.getElementById('retry-copy');
const settingsStatusEl = document.getElementById('settings-status');
const stripTitleToggle = document.getElementById('strip-title-suffix');
const separatorsEl = document.getElementById('title-separators');
const keywordsEl = document.getElementById('title-suffix-keywords');
const trackingParamsEl = document.getElementById('tracking-params');
const trackingPrefixesEl = document.getElementById('tracking-prefixes');
const conditionalGroupsEl = document.getElementById('conditional-tracking-groups');
const outputTemplateEl = document.getElementById('output-template');
const outputPresetEl = document.getElementById('output-preset');
const exportSettingsButton = document.getElementById('export-settings');
const importSettingsButton = document.getElementById('import-settings');
const importSettingsFileEl = document.getElementById('import-settings-file');
const resetSettingsButton = document.getElementById('reset-settings');
const openSettingsButton = document.getElementById('open-settings');
const openShortcutsButton = document.getElementById('open-shortcuts');
let lastCopyText = '';
let lastSuccessStatus = '已复制链接文本';
let lastCopyTabId;

const setStatus = (message, state = 'neutral') => {
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.dataset.state = state;
  }
};

const setSettingsStatus = (message) => {
  if (settingsStatusEl) {
    settingsStatusEl.textContent = message;
  }
};

const clearCopyResult = () => {
  if (resultPanelEl) {
    resultPanelEl.hidden = true;
  }
  if (titleSourceEl) {
    titleSourceEl.textContent = '';
    titleSourceEl.hidden = true;
  }
  if (cleanupSummaryEl) {
    cleanupSummaryEl.textContent = '';
    cleanupSummaryEl.hidden = true;
  }
  if (resultPreviewEl) {
    resultPreviewEl.value = '';
    resultPreviewEl.hidden = true;
  }
  if (retryCopyButton) {
    retryCopyButton.hidden = true;
  }
};

const showCopyResult = (text, titleSourceLabel, cleanupSummary = '') => {
  if (resultPanelEl) {
    resultPanelEl.hidden = false;
  }
  if (titleSourceEl) {
    titleSourceEl.textContent = `标题来源：${titleSourceLabel}`;
    titleSourceEl.hidden = false;
  }
  if (cleanupSummaryEl) {
    cleanupSummaryEl.textContent = cleanupSummary;
    cleanupSummaryEl.hidden = !cleanupSummary;
  }
  if (resultPreviewEl) {
    resultPreviewEl.value = text;
    resultPreviewEl.hidden = false;
  }
};

const parseLines = (value) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const listToText = (list) => list.join('\n');

const normalizeList = (value, fallback) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return parseLines(value);
  }

  return [...fallback];
};

const normalizeParamList = (value, fallback) =>
  normalizeList(value, fallback).map((item) => item.toLowerCase());

const normalizeConditionalTrackingParamGroups = (value, fallback) => {
  const sourceGroups = Array.isArray(value) ? value : fallback;

  return sourceGroups
    .map((group) => ({
      markers: normalizeParamList(group?.markers ?? group?.markerParams, []),
      remove: normalizeParamList(group?.remove ?? group?.removableParams, [])
    }))
    .filter((group) => group.markers.length > 0 && group.remove.length > 0);
};

const normalizeOutputTemplate = (value, fallback) => {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return fallback;
};

const getOutputPresetId = (template) =>
  OUTPUT_PRESETS.find((preset) => preset.template === template)?.id || 'custom';

const serializeSettings = (settings) => JSON.stringify(normalizeSettings(settings), null, 2);

const parseImportedSettings = (text) => {
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error('设置文件不是有效的 JSON');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('设置文件必须是 JSON 对象');
  }

  return normalizeSettings(migrateSettings(parsed));
};

const listsHaveSameValues = (left, right) => {
  if (!Array.isArray(left) || left.length !== right.length) {
    return false;
  }

  const normalizedLeft = new Set(left.map((item) => String(item).trim().toLowerCase()));
  return right.every((item) => normalizedLeft.has(item.toLowerCase()));
};

const migrateSettings = (settings = {}) => {
  const migrated = { ...settings, settingsVersion: SETTINGS_VERSION };
  const storedVersion = Number(settings.settingsVersion) || 0;

  if (storedVersion >= SETTINGS_VERSION) {
    return migrated;
  }

  const legacyTrackingParams = [...DEFAULT_TRACKING_PARAMS, ...LEGACY_RISKY_TRACKING_PARAMS];
  const legacyTrackingPrefixes = [
    ...DEFAULT_TRACKING_PREFIXES,
    ...LEGACY_RISKY_TRACKING_PREFIXES
  ];

  if (listsHaveSameValues(settings.trackingParams, legacyTrackingParams)) {
    migrated.trackingParams = [...DEFAULT_TRACKING_PARAMS];
  }
  if (listsHaveSameValues(settings.trackingPrefixes, legacyTrackingPrefixes)) {
    migrated.trackingPrefixes = [...DEFAULT_TRACKING_PREFIXES];
  }

  return migrated;
};

const normalizeSettings = (settings = {}) => ({
  settingsVersion: SETTINGS_VERSION,
  stripTitleSuffix:
    typeof settings.stripTitleSuffix === 'boolean'
      ? settings.stripTitleSuffix
      : DEFAULT_SETTINGS.stripTitleSuffix,
  titleSeparators: normalizeList(settings.titleSeparators, DEFAULT_SETTINGS.titleSeparators),
  titleSuffixKeywords: normalizeList(
    settings.titleSuffixKeywords,
    DEFAULT_SETTINGS.titleSuffixKeywords
  ),
  trackingParams: normalizeParamList(settings.trackingParams, DEFAULT_SETTINGS.trackingParams),
  trackingPrefixes: normalizeParamList(settings.trackingPrefixes, DEFAULT_SETTINGS.trackingPrefixes),
  conditionalTrackingParamGroups: normalizeConditionalTrackingParamGroups(
    settings.conditionalTrackingParamGroups,
    DEFAULT_SETTINGS.conditionalTrackingParamGroups
  ),
  outputTemplate: normalizeOutputTemplate(settings.outputTemplate, DEFAULT_SETTINGS.outputTemplate)
});

const conditionalGroupsToText = (groups) => JSON.stringify(groups, null, 2);

const parseConditionalGroupsText = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse(trimmed);
  if (!Array.isArray(parsed)) {
    throw new Error('Conditional tracking groups must be an array');
  }

  return normalizeConditionalTrackingParamGroups(parsed, []);
};

let currentSettings = normalizeSettings(DEFAULT_SETTINGS);

const loadSettings = async () => {
  const stored = await chrome.storage.sync.get({ ...DEFAULT_SETTINGS, settingsVersion: 0 });
  const normalized = normalizeSettings(migrateSettings(stored));
  currentSettings = normalized;

  if ((Number(stored.settingsVersion) || 0) < SETTINGS_VERSION) {
    await chrome.storage.sync.set(normalized);
  }

  return normalized;
};

const saveSettings = async (settings) => {
  const normalized = normalizeSettings(settings);
  currentSettings = normalized;
  await chrome.storage.sync.set(normalized);
};

const renderSettings = (settings) => {
  if (stripTitleToggle) {
    stripTitleToggle.checked = settings.stripTitleSuffix;
  }
  if (separatorsEl) {
    separatorsEl.value = listToText(settings.titleSeparators);
  }
  if (keywordsEl) {
    keywordsEl.value = listToText(settings.titleSuffixKeywords);
  }
  if (trackingParamsEl) {
    trackingParamsEl.value = listToText(settings.trackingParams);
  }
  if (trackingPrefixesEl) {
    trackingPrefixesEl.value = listToText(settings.trackingPrefixes);
  }
  if (conditionalGroupsEl) {
    conditionalGroupsEl.value = conditionalGroupsToText(settings.conditionalTrackingParamGroups);
  }
  if (outputTemplateEl) {
    outputTemplateEl.value = settings.outputTemplate;
  }
  if (outputPresetEl) {
    outputPresetEl.value = getOutputPresetId(settings.outputTemplate);
  }
};

const collectSettingsFromUI = () => ({
  stripTitleSuffix: stripTitleToggle?.checked ?? DEFAULT_SETTINGS.stripTitleSuffix,
  titleSeparators: separatorsEl ? parseLines(separatorsEl.value) : DEFAULT_SETTINGS.titleSeparators,
  titleSuffixKeywords: keywordsEl ? parseLines(keywordsEl.value) : DEFAULT_SETTINGS.titleSuffixKeywords,
  trackingParams: trackingParamsEl ? parseLines(trackingParamsEl.value) : DEFAULT_SETTINGS.trackingParams,
  trackingPrefixes: trackingPrefixesEl
    ? parseLines(trackingPrefixesEl.value)
    : DEFAULT_SETTINGS.trackingPrefixes,
  conditionalTrackingParamGroups: conditionalGroupsEl
    ? parseConditionalGroupsText(conditionalGroupsEl.value)
    : DEFAULT_SETTINGS.conditionalTrackingParamGroups,
  outputTemplate: outputTemplateEl ? outputTemplateEl.value : DEFAULT_SETTINGS.outputTemplate
});

const bindSettingsEvents = () => {
  if (
    !stripTitleToggle ||
    !separatorsEl ||
    !keywordsEl ||
    !trackingParamsEl ||
    !trackingPrefixesEl ||
    !conditionalGroupsEl ||
    !outputTemplateEl ||
    !outputPresetEl
  ) {
    return;
  }

  const handleSave = async () => {
    try {
      const nextSettings = collectSettingsFromUI();
      await saveSettings(nextSettings);
      setSettingsStatus('设置已保存');
    } catch (error) {
      console.warn('Unable to save settings.', error);
      setSettingsStatus('设置格式有误，请检查 JSON');
    }
  };

  [
    stripTitleToggle,
    separatorsEl,
    keywordsEl,
    trackingParamsEl,
    trackingPrefixesEl,
    conditionalGroupsEl
  ].forEach((element) => {
    element.addEventListener('change', handleSave);
  });

  outputTemplateEl.addEventListener('change', async () => {
    outputPresetEl.value = getOutputPresetId(outputTemplateEl.value);
    await handleSave();
  });

  outputPresetEl.addEventListener('change', async () => {
    const preset = OUTPUT_PRESETS.find((item) => item.id === outputPresetEl.value);
    if (!preset) {
      return;
    }

    outputTemplateEl.value = preset.template;
    await handleSave();
  });

  if (exportSettingsButton) {
    exportSettingsButton.addEventListener('click', () => {
      const blob = new Blob([serializeSettings(collectSettingsFromUI())], {
        type: 'application/json'
      });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'markdown-link-copier-settings.json';
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
      setSettingsStatus('设置已导出');
    });
  }

  if (importSettingsButton && importSettingsFileEl) {
    importSettingsButton.addEventListener('click', () => importSettingsFileEl.click());
    importSettingsFileEl.addEventListener('change', async () => {
      const [file] = importSettingsFileEl.files || [];
      if (!file) {
        return;
      }

      try {
        const imported = parseImportedSettings(await file.text());
        await saveSettings(imported);
        renderSettings(imported);
        setSettingsStatus('设置已导入');
      } catch (error) {
        console.warn('Unable to import settings.', error);
        setSettingsStatus(error.message || '设置导入失败');
      } finally {
        importSettingsFileEl.value = '';
      }
    });
  }

  if (resetSettingsButton) {
    resetSettingsButton.addEventListener('click', async () => {
      if (!confirm('确定恢复全部默认设置吗？')) {
        return;
      }

      await saveSettings(DEFAULT_SETTINGS);
      renderSettings(DEFAULT_SETTINGS);
      setSettingsStatus('已恢复默认设置');
    });
  }
};

const bindPopupEvents = () => {
  if (openSettingsButton) {
    openSettingsButton.addEventListener('click', () => {
      if (chrome.runtime?.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    });
  }

  if (openShortcutsButton) {
    openShortcutsButton.addEventListener('click', () => {
      chrome.tabs?.create?.({ url: 'chrome://extensions/shortcuts' });
    });
  }

  if (retryCopyButton) {
    retryCopyButton.addEventListener('click', retryLastCopy);
  }
};

const getActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || tab.id === undefined) {
    throw new Error('无法获取当前页面信息');
  }

  return tab;
};

const normalizeTitleCandidate = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
};

const escapeMarkdownText = (value) => value.replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]');

const escapeMarkdownUrl = (value) => value.replace(/\\/g, '\\\\').replace(/\)/g, '\\)');

const getHostname = (rawUrl) => {
  try {
    return new URL(rawUrl).hostname;
  } catch (error) {
    return '';
  }
};

const renderOutputTemplate = (template, context) =>
  template.replace(/{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      return context[key];
    }

    return '';
  });

const buildOutputContext = ({ title, url, rawTitle, rawUrl }) => ({
  title,
  url,
  rawTitle: rawTitle || '',
  rawUrl: rawUrl || '',
  hostname: getHostname(url || rawUrl),
  markdownTitle: escapeMarkdownText(title),
  markdownUrl: escapeMarkdownUrl(url)
});

const normalizeSiteTitleKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const isSiteOnlyTitle = (value, pageUrl) => {
  try {
    const hostname = new URL(pageUrl).hostname.replace(/^www\./, '');
    const siteLabel = hostname.split('.')[0];
    const titleKey = normalizeSiteTitleKey(value);

    return Boolean(titleKey) && titleKey === normalizeSiteTitleKey(siteLabel);
  } catch (error) {
    return false;
  }
};

const getPageTitleSnapshot = async (tabId) => {
  if (tabId === undefined || !chrome.scripting?.executeScript) {
    return null;
  }

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        const isSiteOnlyTitle = (value, pageUrl) => {
          try {
            const hostname = new URL(pageUrl).hostname.replace(/^www\./, '');
            const siteLabel = hostname.split('.')[0];
            const normalize = (text) =>
              String(text || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '');
            const titleKey = normalize(value);

            return Boolean(titleKey) && titleKey === normalize(siteLabel);
          } catch (error) {
            return false;
          }
        };
        const isTranslatedPage = () => {
          const rootClasses = document.documentElement?.classList;
          const hasTranslatedClass =
            rootClasses?.contains('translated-ltr') || rootClasses?.contains('translated-rtl');
          const hasTranslateArtifact = document.querySelector(
            '[data-google-translate], .goog-te-spinner-pos, #goog-gt-tt'
          );

          return Boolean(hasTranslatedClass || hasTranslateArtifact);
        };
        const readTitleSnapshot = (root, pageUrl) => {
          const getMetaContent = (selector) =>
            root.querySelector(selector)?.getAttribute('content')?.trim() || '';
          const findHeadline = (value) => {
            if (Array.isArray(value)) {
              for (const item of value) {
                const headline = findHeadline(item);
                if (headline) {
                  return headline;
                }
              }
              return '';
            }

            if (!value || typeof value !== 'object') {
              return '';
            }

            if (typeof value.headline === 'string' && value.headline.trim()) {
              return value.headline.trim();
            }

            for (const child of Object.values(value)) {
              const headline = findHeadline(child);
              if (headline) {
                return headline;
              }
            }

            return '';
          };
          const jsonLdTitle =
            Array.from(root.querySelectorAll('script[type="application/ld+json"]'))
              .map((element) => {
                try {
                  return findHeadline(JSON.parse(element.textContent || ''));
                } catch (error) {
                  return '';
                }
              })
              .find(Boolean) || '';
          const h1Title =
            Array.from(root.querySelectorAll('h1'))
              .map((element) => element.textContent?.trim() || '')
              .find(Boolean) || '';
          const articleTitle =
            root
              .querySelector('[data-testid="twitter-article-title"]')
              ?.textContent?.trim() || '';
          const articleHeadingTitle =
            root
              .querySelector('article h1, article h2, main h1, main h2')
              ?.textContent?.trim() || '';
          const canonicalHref =
            root.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() || '';
          let canonicalUrl = '';

          if (canonicalHref) {
            try {
              canonicalUrl = new URL(canonicalHref, pageUrl).href;
            } catch (error) {
              canonicalUrl = '';
            }
          }

          return {
            articleTitle,
            jsonLdTitle,
            ogTitle: getMetaContent('meta[property="og:title"]'),
            twitterTitle: getMetaContent('meta[name="twitter:title"]'),
            metaTitle: getMetaContent('meta[name="title"]'),
            articleHeadingTitle,
            h1Title,
            documentTitle: root.title?.trim() || '',
            canonicalUrl
          };
        };

        const pageUrl = location.href;
        const liveSnapshot = readTitleSnapshot(document, pageUrl);
        const liveMetadataTitles = [
          liveSnapshot.jsonLdTitle,
          liveSnapshot.ogTitle,
          liveSnapshot.twitterTitle,
          liveSnapshot.metaTitle
        ];
        if (liveMetadataTitles.some((title) => title && !isSiteOnlyTitle(title, pageUrl))) {
          return liveSnapshot;
        }

        const liveReadableTitles = [
          liveSnapshot.articleTitle,
          liveSnapshot.articleHeadingTitle,
          liveSnapshot.h1Title,
          liveSnapshot.documentTitle
        ];
        if (
          !isTranslatedPage() &&
          liveReadableTitles.some((title) => title && !isSiteOnlyTitle(title, pageUrl))
        ) {
          return liveSnapshot;
        }

        const sourceRequestController = new AbortController();
        const sourceRequestTimeout = setTimeout(() => sourceRequestController.abort(), 2000);

        try {
          const response = await fetch(location.href, {
            credentials: 'same-origin',
            signal: sourceRequestController.signal
          });
          const contentType = response.headers.get('content-type') || '';
          if (response.ok && contentType.toLowerCase().includes('text/html')) {
            const sourceDocument = new DOMParser().parseFromString(await response.text(), 'text/html');
            const sourceSnapshot = readTitleSnapshot(sourceDocument, pageUrl);

            return {
              ...liveSnapshot,
              sourceArticleTitle: sourceSnapshot.articleTitle,
              sourceJsonLdTitle: sourceSnapshot.jsonLdTitle,
              sourceOgTitle: sourceSnapshot.ogTitle,
              sourceTwitterTitle: sourceSnapshot.twitterTitle,
              sourceMetaTitle: sourceSnapshot.metaTitle,
              sourceArticleHeadingTitle: sourceSnapshot.articleHeadingTitle,
              sourceH1Title: sourceSnapshot.h1Title,
              sourceDocumentTitle: sourceSnapshot.documentTitle,
              sourceCanonicalUrl: sourceSnapshot.canonicalUrl
            };
          }
        } catch (error) {
          // Some pages cannot be fetched again; their live title remains the fallback.
        } finally {
          clearTimeout(sourceRequestTimeout);
        }

        return liveSnapshot;
      }
    });

    return result?.result || null;
  } catch (error) {
    console.warn('Unable to read page title metadata, falling back to tab title.', error);
    return null;
  }
};

const pickPreferredTitle = (tabTitle, pageTitleSnapshot, pageUrl) => {
  const candidates = [
    [pageTitleSnapshot?.sourceArticleTitle, '原始源码文章标题'],
    [pageTitleSnapshot?.sourceJsonLdTitle, '原始源码 JSON-LD'],
    [pageTitleSnapshot?.sourceOgTitle, '原始源码 Open Graph'],
    [pageTitleSnapshot?.sourceTwitterTitle, '原始源码 Twitter Card'],
    [pageTitleSnapshot?.sourceMetaTitle, '原始源码页面元数据'],
    [pageTitleSnapshot?.sourceArticleHeadingTitle, '原始源码文章标题'],
    [pageTitleSnapshot?.sourceDocumentTitle, '原始源码页面标题'],
    [pageTitleSnapshot?.sourceH1Title, '原始源码 H1'],
    [pageTitleSnapshot?.articleTitle, '文章标题'],
    [pageTitleSnapshot?.jsonLdTitle, 'JSON-LD'],
    [pageTitleSnapshot?.ogTitle, 'Open Graph'],
    [pageTitleSnapshot?.twitterTitle, 'Twitter Card'],
    [pageTitleSnapshot?.metaTitle, '页面元数据'],
    [pageTitleSnapshot?.articleHeadingTitle, '文章标题'],
    [pageTitleSnapshot?.h1Title, '页面 H1'],
    [pageTitleSnapshot?.documentTitle, '页面标题'],
    [tabTitle, '标签页标题']
  ];

  let siteFallback = null;

  for (const [candidate, sourceLabel] of candidates) {
    const normalized = normalizeTitleCandidate(candidate);
    if (!normalized) {
      continue;
    }

    if (isSiteOnlyTitle(normalized, pageUrl)) {
      siteFallback ||= { title: normalized, sourceLabel };
      continue;
    }

    return { title: normalized, sourceLabel };
  }

  return siteFallback || { title: '未命名页面', sourceLabel: '回退标题' };
};

const normalizeComparableHostname = (hostname) => hostname.toLowerCase().replace(/^www\./, '');

const pickPreferredUrl = (rawUrl, pageTitleSnapshot) => {
  const canonicalUrl =
    pageTitleSnapshot?.sourceCanonicalUrl || pageTitleSnapshot?.canonicalUrl || '';

  if (!canonicalUrl) {
    return { url: rawUrl, usedCanonical: false };
  }

  try {
    const raw = new URL(rawUrl);
    const canonical = new URL(canonicalUrl, raw);
    const isHttp = canonical.protocol === 'http:' || canonical.protocol === 'https:';
    const isSameSite =
      normalizeComparableHostname(raw.hostname) === normalizeComparableHostname(canonical.hostname);

    if (isHttp && isSameSite) {
      return { url: canonical.href, usedCanonical: canonical.href !== rawUrl };
    }

    return { url: rawUrl, usedCanonical: false };
  } catch (error) {
    return { url: rawUrl, usedCanonical: false };
  }
};

const normalizeKey = (key) => key.toLowerCase();

const shouldRemoveParam = (key, settings = currentSettings) => {
  const normalizedKey = normalizeKey(key);
  const effectiveSettings = normalizeSettings(settings);

  if (effectiveSettings.trackingParams.includes(normalizedKey)) {
    return true;
  }

  return effectiveSettings.trackingPrefixes.some((prefix) => normalizedKey.startsWith(prefix));
};

const hasTrackingMarkers = (searchParams, markerParams) => {
  for (const key of searchParams.keys()) {
    if (markerParams.has(normalizeKey(key))) {
      return true;
    }
  }

  return false;
};

const collectParamsToDelete = (searchParams, settings = currentSettings) => {
  const keysToDelete = [];
  const effectiveSettings = normalizeSettings(settings);
  const activeConditionalGroups = effectiveSettings.conditionalTrackingParamGroups.filter((group) =>
    hasTrackingMarkers(searchParams, new Set(group.markers))
  );

  for (const key of searchParams.keys()) {
    const normalizedKey = normalizeKey(key);

    if (
      shouldRemoveParam(key, effectiveSettings) ||
      activeConditionalGroups.some((group) => group.remove.includes(normalizedKey))
    ) {
      keysToDelete.push(key);
    }
  }

  return keysToDelete;
};

const stripTrackingParams = (searchParams, settings = currentSettings) => {
  const paramsToDelete = collectParamsToDelete(searchParams, settings);
  paramsToDelete.forEach((key) => {
    searchParams.delete(key);
  });
  return paramsToDelete;
};

const looksLikeQueryString = (value) => value.includes('=') || value.includes('&');

const cleanQueryString = (queryString, settings = currentSettings, removedParams = []) => {
  const params = new URLSearchParams(queryString);
  removedParams.push(...stripTrackingParams(params, settings));
  return params.toString();
};

const cleanHash = (hash, settings = currentSettings, removedParams = []) => {
  if (!hash) {
    return '';
  }

  const hashValue = hash.replace(/^#/, '');

  if (!hashValue) {
    return '';
  }

  if (hashValue.includes('?')) {
    const [pathPart, queryPart] = hashValue.split('?');
    const cleanedQuery = cleanQueryString(queryPart, settings, removedParams);

    if (!cleanedQuery) {
      return pathPart ? `#${pathPart}` : '';
    }

    return `#${pathPart}?${cleanedQuery}`;
  }

  if (looksLikeQueryString(hashValue)) {
    const cleanedQuery = cleanQueryString(hashValue, settings, removedParams);
    return cleanedQuery ? `#${cleanedQuery}` : '';
  }

  if (shouldRemoveParam(hashValue, settings)) {
    removedParams.push(hashValue);
    return '';
  }

  return `#${hashValue}`;
};

const uniqueParamNames = (paramNames) => {
  const seen = new Set();

  return paramNames.filter((name) => {
    const normalized = normalizeKey(name);
    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
};

const cleanUrlWithDetails = (rawUrl, settings = currentSettings) => {
  try {
    const effectiveSettings = normalizeSettings(settings);
    const url = new URL(rawUrl);
    const removedParams = stripTrackingParams(url.searchParams, effectiveSettings);

    if (!url.searchParams.toString()) {
      url.search = '';
    }

    url.hash = cleanHash(url.hash, effectiveSettings, removedParams);

    return { url: url.toString(), removedParams: uniqueParamNames(removedParams) };
  } catch (error) {
    console.warn('Unable to clean URL, returning raw.', error);
    return { url: rawUrl, removedParams: [] };
  }
};

const cleanUrl = (rawUrl, settings = currentSettings) =>
  cleanUrlWithDetails(rawUrl, settings).url;

const findLastSeparatorMatch = (title, separators) => {
  if (!separators || separators.length === 0) {
    return null;
  }

  let bestMatch = null;

  separators.forEach((separator) => {
    if (!separator) {
      return;
    }

    const index = title.lastIndexOf(separator);
    if (index <= 0) {
      return;
    }

    if (!bestMatch || index > bestMatch.index) {
      bestMatch = { index, separator };
    }
  });

  return bestMatch;
};

const countWords = (value) => value.trim().split(/\s+/).filter(Boolean).length;

const looksLikeShortLabel = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const wordCount = countWords(trimmed);
  const hasSentencePunctuation = /[?!:;,.，。！？：；]/.test(trimmed);

  return !hasSentencePunctuation && (trimmed.length <= 20 || wordCount <= 3);
};

const isClearlyMoreDescriptive = (candidate, other) =>
  candidate.length >= other.length + 8 || candidate.length >= Math.ceil(other.length * 1.6);

const chooseSegmentAroundSeparator = (title, separators) => {
  const match = findLastSeparatorMatch(title, separators);
  if (!match) {
    return title;
  }

  const left = title.slice(0, match.index).trim();
  const right = title.slice(match.index + match.separator.length).trim();

  if (!left || !right) {
    return title;
  }

  if (looksLikeShortLabel(right) && isClearlyMoreDescriptive(left, right)) {
    return left;
  }

  if (looksLikeShortLabel(left) && isClearlyMoreDescriptive(right, left)) {
    return right;
  }

  return title;
};

const stripBySeparators = (title, separators) => chooseSegmentAroundSeparator(title, separators);

const stripByKeyword = (title, keyword, separators) => {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) {
    return title;
  }

  const lowerTitle = title.toLowerCase();
  const lowerKeyword = trimmedKeyword.toLowerCase();

  if (lowerTitle.endsWith(lowerKeyword)) {
    return title.slice(0, title.length - trimmedKeyword.length).trim();
  }

  for (const separator of separators) {
    if (!separator) {
      continue;
    }

    const combined = separator + trimmedKeyword;
    if (lowerTitle.endsWith(combined.toLowerCase())) {
      return title.slice(0, title.length - combined.length).trim();
    }
  }

  return title;
};

const stripByKeywords = (title, keywords, separators) => {
  if (!keywords || keywords.length === 0) {
    return title;
  }

  let result = title;
  keywords.forEach((keyword) => {
    result = stripByKeyword(result, keyword, separators);
  });

  return result;
};

const findSeparatorBeforeIndex = (title, separators, index) => {
  if (!separators || separators.length === 0) {
    return -1;
  }

  let bestIndex = -1;

  separators.forEach((separator) => {
    if (!separator) {
      return;
    }

    const separatorIndex = title.lastIndexOf(separator, index);
    if (separatorIndex > bestIndex) {
      bestIndex = separatorIndex;
    }
  });

  return bestIndex;
};

const findKeywordCutIndex = (title, keywords, separators) => {
  if (!keywords || keywords.length === 0) {
    return -1;
  }

  const lowerTitle = title.toLowerCase();
  let earliestIndex = -1;

  keywords.forEach((keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      return;
    }

    const index = lowerTitle.indexOf(trimmed.toLowerCase());
    if (index !== -1 && (earliestIndex === -1 || index < earliestIndex)) {
      earliestIndex = index;
    }
  });

  if (earliestIndex === -1) {
    return -1;
  }

  const separatorIndex = findSeparatorBeforeIndex(title, separators, earliestIndex);
  if (separatorIndex <= 0) {
    return -1;
  }

  return separatorIndex;
};

const cleanTitle = (rawTitle, settings) => {
  const baseTitle = normalizeTitleCandidate(rawTitle || '未命名页面') || '未命名页面';
  const effectiveSettings = settings || DEFAULT_SETTINGS;

  if (!effectiveSettings.stripTitleSuffix) {
    return baseTitle;
  }

  let cleaned = baseTitle;
  const separators = effectiveSettings.titleSeparators || DEFAULT_SETTINGS.titleSeparators;
  const keywords = effectiveSettings.titleSuffixKeywords || DEFAULT_SETTINGS.titleSuffixKeywords;
  const keywordCutIndex = findKeywordCutIndex(cleaned, keywords, separators);

  if (keywordCutIndex > 0) {
    cleaned = cleaned.slice(0, keywordCutIndex).trim();
    return cleaned || baseTitle;
  }

  cleaned = stripByKeywords(cleaned, keywords, separators);
  cleaned = stripBySeparators(cleaned, separators);

  return cleaned || baseTitle;
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn('Clipboard API failed, falling back to execCommand.', error);
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const successful = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!successful) {
    throw new Error('execCommand copy failed');
  }
};

const describeUrlProcessing = ({ usedCanonical, removedParams }) => {
  const details = [];

  if (usedCanonical) {
    details.push('采用规范链接');
  }
  if (removedParams.length > 0) {
    details.push(`移除 ${removedParams.join('、')}`);
  }

  return {
    summary: details.length > 0 ? `链接处理：${details.join(' · ')}` : '',
    count: (usedCanonical ? 1 : 0) + removedParams.length
  };
};

const copyPreparedText = async (text, successStatus) => {
  try {
    await copyToClipboard(text);
    if (retryCopyButton) {
      retryCopyButton.hidden = true;
    }
    setStatus(successStatus, 'success');
    return true;
  } catch (error) {
    console.error('Failed to write generated link text to the clipboard.', error);
    if (retryCopyButton) {
      retryCopyButton.hidden = false;
    }
    setStatus('自动复制失败，请手动复制', 'error');
    return false;
  }
};

const retryLastCopy = async () => {
  if (!lastCopyText) {
    return;
  }

  setStatus('正在再次复制...', 'loading');
  if (retryCopyButton) {
    retryCopyButton.hidden = true;
  }
  const copied = await copyPreparedText(lastCopyText, lastSuccessStatus);
  await showPageFeedback(
    lastCopyTabId,
    copied ? '链接文本已复制' : '链接文本复制失败',
    copied ? 'success' : 'error'
  );
};

const copyMarkdownLink = async (settings = currentSettings) => {
  setStatus('正在读取当前页面...', 'loading');
  clearCopyResult();
  lastCopyText = '';
  lastSuccessStatus = '已复制链接文本';

  try {
    const effectiveSettings = normalizeSettings(settings);
    const tab = await getActiveTab();
    if (!tab.url) {
      setStatus('无法获取当前页面信息', 'error');
      return;
    }

    const pageTitleSnapshot = await getPageTitleSnapshot(tab.id);
    lastCopyTabId = tab.id;
    const rawTitle = tab.title || '';
    const rawUrl = tab.url;
    const preferredTitle = pickPreferredTitle(rawTitle, pageTitleSnapshot, rawUrl);
    const title = cleanTitle(preferredTitle.title, effectiveSettings);
    const preferredUrl = pickPreferredUrl(rawUrl, pageTitleSnapshot);
    const cleanLink = cleanUrlWithDetails(preferredUrl.url, effectiveSettings);
    const urlProcessing = describeUrlProcessing({
      usedCanonical: preferredUrl.usedCanonical,
      removedParams: cleanLink.removedParams
    });
    const outputContext = buildOutputContext({
      title,
      url: cleanLink.url,
      rawTitle,
      rawUrl
    });
    const outputSnippet = renderOutputTemplate(effectiveSettings.outputTemplate, outputContext);

    lastCopyText = outputSnippet;
    lastSuccessStatus =
      urlProcessing.count > 0 ? `已复制 · 清理 ${urlProcessing.count} 项` : '已复制链接文本';
    showCopyResult(outputSnippet, preferredTitle.sourceLabel, urlProcessing.summary);
    const copied = await copyPreparedText(outputSnippet, lastSuccessStatus);
    await showPageFeedback(
      tab.id,
      copied ? '链接文本已复制' : '链接文本复制失败',
      copied ? 'success' : 'error'
    );
  } catch (error) {
    console.error('Failed to copy link text', error);
    setStatus('复制失败，请稍后重试', 'error');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    const settings = await loadSettings();
    renderSettings(settings);
    bindSettingsEvents();
    bindPopupEvents();

    if (document.body?.dataset?.page === 'popup') {
      copyMarkdownLink(settings);
    }
  })();
});
