const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const [chromeBinary, sourceHtml, outputDirectory, frameCountValue] = process.argv.slice(2);
const frameCount = Number(frameCountValue);

if (!chromeBinary || !sourceHtml || !outputDirectory || !Number.isInteger(frameCount) || frameCount < 2) {
  console.error('用法：render-promotion-frames.cjs <chrome> <html> <output-dir> <frame-count>');
  process.exit(1);
}

const render = async () => {
  const browser = await chromium.launch({
    executablePath: chromeBinary,
    headless: true,
    args: ['--disable-background-networking', '--disable-default-apps', '--hide-scrollbars']
  });

  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
    const sourceUrl = pathToFileURL(sourceHtml).href;

    for (let frame = 0; frame < frameCount; frame += 1) {
      const frameName = `frame-${String(frame).padStart(3, '0')}.png`;
      await page.goto(`${sourceUrl}?frame=${frame}&total=${frameCount}`, { waitUntil: 'load' });
      await page.screenshot({ path: path.join(outputDirectory, frameName) });
    }
  } finally {
    await browser.close();
  }
};

render().catch((error) => {
  console.error(error);
  process.exit(1);
});
