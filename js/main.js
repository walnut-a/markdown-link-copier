const copyButton = document.querySelector('[data-copy-target]');

if (copyButton) {
  copyButton.addEventListener('click', async () => {
    const output = document.getElementById(copyButton.dataset.copyTarget);
    if (!output) return;

    const previousLabel = copyButton.textContent;
    try {
      await navigator.clipboard.writeText(output.textContent.trim());
      copyButton.textContent = 'Copied';
      copyButton.dataset.state = 'success';
    } catch {
      copyButton.textContent = 'Select text to copy';
      window.getSelection()?.selectAllChildren(output);
    }

    window.setTimeout(() => {
      copyButton.textContent = previousLabel;
      delete copyButton.dataset.state;
    }, 1800);
  });
}
