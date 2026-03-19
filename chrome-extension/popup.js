const TRACKING_PARAMS = new Set([
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
]);

const TRACKING_PREFIXES = [
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

const DEFAULT_SETTINGS = {
  stripTitleSuffix: true,
  titleSeparators: [' - ', ' – ', ' — ', ' | ', ' ｜ ', ' · ', ' • ', ' _ ', ' / '],
  titleSuffixKeywords: []
};

const statusEl = document.getElementById('status');
const settingsStatusEl = document.getElementById('settings-status');
const stripTitleToggle = document.getElementById('strip-title-suffix');
const separatorsEl = document.getElementById('title-separators');
const keywordsEl = document.getElementById('title-suffix-keywords');

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

let currentSettings = { ...DEFAULT_SETTINGS };

const loadSettings = async () => {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const normalized = {
    stripTitleSuffix: Boolean(stored.stripTitleSuffix),
    titleSeparators: normalizeList(stored.titleSeparators, DEFAULT_SETTINGS.titleSeparators),
    titleSuffixKeywords: normalizeList(
      stored.titleSuffixKeywords,
      DEFAULT_SETTINGS.titleSuffixKeywords
    )
  };
  currentSettings = normalized;
  return normalized;
};

const saveSettings = async (settings) => {
  currentSettings = settings;
  await chrome.storage.sync.set(settings);
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
};

const collectSettingsFromUI = () => ({
  stripTitleSuffix: stripTitleToggle?.checked ?? DEFAULT_SETTINGS.stripTitleSuffix,
  titleSeparators: separatorsEl ? parseLines(separatorsEl.value) : DEFAULT_SETTINGS.titleSeparators,
  titleSuffixKeywords: keywordsEl ? parseLines(keywordsEl.value) : DEFAULT_SETTINGS.titleSuffixKeywords
});

const bindSettingsEvents = () => {
  if (!stripTitleToggle || !separatorsEl || !keywordsEl) {
    return;
  }

  const handleSave = async () => {
    const nextSettings = collectSettingsFromUI();
    await saveSettings(nextSettings);
    setSettingsStatus('设置已保存');
  };

  stripTitleToggle.addEventListener('change', handleSave);
  separatorsEl.addEventListener('change', handleSave);
  keywordsEl.addEventListener('change', handleSave);
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

  return value.trim();
};

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

const shouldRemoveParam = (key) => {
  const normalizedKey = normalizeKey(key);

  if (TRACKING_PARAMS.has(normalizedKey)) {
    return true;
  }

  return TRACKING_PREFIXES.some((prefix) => normalizedKey.startsWith(prefix));
};

const collectParamsToDelete = (searchParams) => {
  const keysToDelete = [];

  for (const key of searchParams.keys()) {
    if (shouldRemoveParam(key)) {
      keysToDelete.push(key);
    }
  }

  return keysToDelete;
};

const stripTrackingParams = (searchParams) => {
  const paramsToDelete = collectParamsToDelete(searchParams);
  paramsToDelete.forEach((key) => {
    searchParams.delete(key);
  });
};

const looksLikeQueryString = (value) => value.includes('=') || value.includes('&');

const cleanQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  stripTrackingParams(params);
  return params.toString();
};

const cleanHash = (hash) => {
  if (!hash) {
    return '';
  }

  const hashValue = hash.replace(/^#/, '');

  if (!hashValue) {
    return '';
  }

  if (hashValue.includes('?')) {
    const [pathPart, queryPart] = hashValue.split('?');
    const cleanedQuery = cleanQueryString(queryPart);

    if (!cleanedQuery) {
      return pathPart ? `#${pathPart}` : '';
    }

    return `#${pathPart}?${cleanedQuery}`;
  }

  if (looksLikeQueryString(hashValue)) {
    const cleanedQuery = cleanQueryString(hashValue);
    return cleanedQuery ? `#${cleanedQuery}` : '';
  }

  if (shouldRemoveParam(hashValue)) {
    return '';
  }

  return `#${hashValue}`;
};

const cleanUrl = (rawUrl) => {
  try {
    const url = new URL(rawUrl);
    stripTrackingParams(url.searchParams);

    if (!url.searchParams.toString()) {
      url.search = '';
    }

    url.hash = cleanHash(url.hash);

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
  const baseTitle = (rawTitle || '未命名页面').trim() || '未命名页面';
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
    const tab = await getActiveTab();
    if (!tab.url) {
      setStatus('无法获取当前页面信息');
      return;
    }

    const pageTitleSnapshot = await getPageTitleSnapshot(tab.id);
    const title = cleanTitle(pickPreferredTitle(tab.title, pageTitleSnapshot), settings);
    const cleanLink = cleanUrl(tab.url);
    const markdownSnippet = `[${title}](${cleanLink})`;

    await copyToClipboard(markdownSnippet);
    setStatus('已复制 Markdown 链接 ✔️');
  } catch (error) {
    console.error('Failed to copy markdown link', error);
    setStatus('复制失败，请稍后重试');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    const settings = await loadSettings();
    renderSettings(settings);
    bindSettingsEvents();
    copyMarkdownLink(settings);
  })();
});
