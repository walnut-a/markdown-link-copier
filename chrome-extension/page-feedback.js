export function renderCopyFeedback(message, state = 'success') {
  const feedbackId = 'markdown-link-copier-page-feedback';
  document.getElementById(feedbackId)?.remove();

  const host = document.createElement('div');
  host.id = feedbackId;
  host.style.position = 'fixed';
  host.style.top = '18px';
  host.style.left = '50%';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';

  const shadowRoot = host.attachShadow({ mode: 'closed' });
  const toast = document.createElement('div');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = `${state === 'success' ? '✓' : '!'} ${message}`;
  toast.style.boxSizing = 'border-box';
  toast.style.maxWidth = 'min(360px, calc(100vw - 32px))';
  toast.style.padding = '8px 12px';
  toast.style.border = '1px solid rgba(255, 255, 255, 0.14)';
  toast.style.borderRadius = '8px';
  toast.style.background = state === 'success' ? '#183b2d' : '#52201d';
  toast.style.color = '#ffffff';
  toast.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.18)';
  toast.style.font =
    '500 13px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  toast.style.letterSpacing = '0.01em';
  toast.style.textAlign = 'center';
  toast.style.whiteSpace = 'normal';

  const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -6px)';
    toast.style.transition = 'opacity 140ms ease, transform 140ms ease';
  } else {
    toast.style.transform = 'translateX(-50%)';
  }

  shadowRoot.appendChild(toast);
  document.documentElement.appendChild(host);

  if (!reduceMotion) {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%)';
    });
  }

  const hideTimer = setTimeout(() => {
    if (reduceMotion) {
      host.remove();
      return;
    }

    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -4px)';
    const removeTimer = setTimeout(() => host.remove(), 160);
    removeTimer?.unref?.();
  }, 1400);
  hideTimer?.unref?.();
}

export async function showPageFeedback(tabId, message, state = 'success') {
  if (!Number.isInteger(tabId) || !chrome.scripting?.executeScript) {
    return false;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: renderCopyFeedback,
      args: [message, state]
    });
    return true;
  } catch {
    return false;
  }
}
