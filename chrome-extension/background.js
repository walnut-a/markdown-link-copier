import { showPageFeedback } from './page-feedback.js';
import { createI18n } from './i18n.js';

export const COPY_PURE_URL_COMMAND = 'copy-pure-url';

export function toPureUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return rawUrl;
  }
}

export async function writeTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    try {
      textarea.focus();
      textarea.select();
      return document.execCommand('copy');
    } finally {
      textarea.remove();
    }
  }
}

export async function copyActiveTabPureUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!Number.isInteger(tab?.id) || typeof tab.url !== 'string' || tab.url.length === 0) {
    return false;
  }

  const pureUrl = toPureUrl(tab.url);
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: writeTextToClipboard,
    args: [pureUrl]
  });

  const copied = results.some(({ result }) => result === true);
  const { uiLanguage } = await chrome.storage.sync.get({ uiLanguage: 'auto' });
  const i18n = await createI18n(uiLanguage);
  await showPageFeedback(
    tab.id,
    copied ? i18n.t('pureUrlCopied') : i18n.t('pureUrlCopyFailed'),
    copied ? 'success' : 'error'
  );

  return copied;
}

export async function handleCommand(command) {
  if (command !== COPY_PURE_URL_COMMAND) {
    return false;
  }

  try {
    return await copyActiveTabPureUrl();
  } catch (error) {
    console.warn('Unable to copy the clean URL.', error);
    return false;
  }
}

globalThis.chrome?.commands?.onCommand?.addListener(handleCommand);
