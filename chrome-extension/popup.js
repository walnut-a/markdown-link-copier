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
  'ref',
  'ref_src',
  'ref_url',
  'referrer',
  'referrer_id',
  'referral',
  'refid',
  'spm',
  'spm_id_from',
  'scm',
  'scm_id',
  'source',
  'from',
  'share',
  'share_source',
  'share_id',
  'share_channel',
  'share_medium',
  'share_from',
  'campaign',
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
  'ref_',
  'share_',
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

const DEFAULT_SETTINGS = {
  stripTitleSuffix: true,
  titleSeparators: [' - ', ' – ', ' — ', ' | ', ' ｜ ', ' · ', ' • ', ' _ ', ' / '],
  titleSuffixKeywords: [],
  trackingParams: DEFAULT_TRACKING_PARAMS,
  trackingPrefixes: DEFAULT_TRACKING_PREFIXES,
  conditionalTrackingParamGroups: DEFAULT_CONDITIONAL_TRACKING_PARAM_GROUPS,
  outputTemplate: DEFAULT_OUTPUT_TEMPLATE
};

const statusEl = document.getElementById('status');
const settingsStatusEl = document.getElementById('settings-status');
const stripTitleToggle = document.getElementById('strip-title-suffix');
const separatorsEl = document.getElementById('title-separators');
const keywordsEl = document.getElementById('title-suffix-keywords');
const trackingParamsEl = document.getElementById('tracking-params');
const trackingPrefixesEl = document.getElementById('tracking-prefixes');
const conditionalGroupsEl = document.getElementById('conditional-tracking-groups');
const outputTemplateEl = document.getElementById('output-template');
const openSettingsButton = document.getElementById('open-settings');

const setStatus = (message) => {
  if (statusEl) {
    statusEl.textContent = message;
  }
};

const setSettingsStatus = (message) => {
  if (settingsStatusEl) {
    settingsStatusEl.textContent = message;
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

const normalizeSettings = (settings = {}) => ({
  stripTitleSuffix: Boolean(settings.stripTitleSuffix),
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
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const normalized = normalizeSettings(stored);
  currentSettings = normalized;
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
    !outputTemplateEl
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
    conditionalGroupsEl,
    outputTemplateEl
  ].forEach((element) => {
    element.addEventListener('change', handleSave);
  });
};

const bindPopupEvents = () => {
  if (!openSettingsButton) {
    return;
  }

  openSettingsButton.addEventListener('click', () => {
    if (chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  });
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

const getPageTitleSnapshot = async (tabId) => {
  if (tabId === undefined || !chrome.scripting?.executeScript) {
    return null;
  }

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const getMetaContent = (selector) =>
          document.querySelector(selector)?.getAttribute('content')?.trim() || '';
        const h1Title =
          Array.from(document.querySelectorAll('h1'))
            .map((element) => element.textContent?.trim() || '')
            .find(Boolean) || '';
        const articleTitle =
          document.querySelector('[data-testid="twitter-article-title"]')?.textContent?.trim() || '';

        return {
          articleTitle,
          ogTitle: getMetaContent('meta[property="og:title"]'),
          twitterTitle: getMetaContent('meta[name="twitter:title"]'),
          h1Title,
          documentTitle: document.title?.trim() || ''
        };
      }
    });

    return result?.result || null;
  } catch (error) {
    console.warn('Unable to read page title metadata, falling back to tab title.', error);
    return null;
  }
};

const pickPreferredTitle = (tabTitle, pageTitleSnapshot) => {
  const candidates = [
    pageTitleSnapshot?.articleTitle,
    pageTitleSnapshot?.ogTitle,
    pageTitleSnapshot?.twitterTitle,
    pageTitleSnapshot?.h1Title,
    pageTitleSnapshot?.documentTitle,
    tabTitle
  ];

  for (const candidate of candidates) {
    const normalized = normalizeTitleCandidate(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return '未命名页面';
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
};

const looksLikeQueryString = (value) => value.includes('=') || value.includes('&');

const cleanQueryString = (queryString, settings = currentSettings) => {
  const params = new URLSearchParams(queryString);
  stripTrackingParams(params, settings);
  return params.toString();
};

const cleanHash = (hash, settings = currentSettings) => {
  if (!hash) {
    return '';
  }

  const hashValue = hash.replace(/^#/, '');

  if (!hashValue) {
    return '';
  }

  if (hashValue.includes('?')) {
    const [pathPart, queryPart] = hashValue.split('?');
    const cleanedQuery = cleanQueryString(queryPart, settings);

    if (!cleanedQuery) {
      return pathPart ? `#${pathPart}` : '';
    }

    return `#${pathPart}?${cleanedQuery}`;
  }

  if (looksLikeQueryString(hashValue)) {
    const cleanedQuery = cleanQueryString(hashValue, settings);
    return cleanedQuery ? `#${cleanedQuery}` : '';
  }

  if (shouldRemoveParam(hashValue, settings)) {
    return '';
  }

  return `#${hashValue}`;
};

const cleanUrl = (rawUrl, settings = currentSettings) => {
  try {
    const effectiveSettings = normalizeSettings(settings);
    const url = new URL(rawUrl);
    stripTrackingParams(url.searchParams, effectiveSettings);

    if (!url.searchParams.toString()) {
      url.search = '';
    }

    url.hash = cleanHash(url.hash, effectiveSettings);

    return url.toString();
  } catch (error) {
    console.warn('Unable to clean URL, returning raw.', error);
    return rawUrl;
  }
};

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

const copyMarkdownLink = async (settings = currentSettings) => {
  setStatus('处理中...');

  try {
    const effectiveSettings = normalizeSettings(settings);
    const tab = await getActiveTab();
    if (!tab.url) {
      setStatus('无法获取当前页面信息');
      return;
    }

    const pageTitleSnapshot = await getPageTitleSnapshot(tab.id);
    const rawTitle = tab.title || '';
    const rawUrl = tab.url;
    const title = cleanTitle(pickPreferredTitle(rawTitle, pageTitleSnapshot), effectiveSettings);
    const cleanLink = cleanUrl(rawUrl, effectiveSettings);
    const outputContext = buildOutputContext({
      title,
      url: cleanLink,
      rawTitle,
      rawUrl
    });
    const outputSnippet = renderOutputTemplate(effectiveSettings.outputTemplate, outputContext);

    await copyToClipboard(outputSnippet);
    setStatus('已复制链接文本 ✔️');
  } catch (error) {
    console.error('Failed to copy link text', error);
    setStatus('复制失败，请稍后重试');
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
