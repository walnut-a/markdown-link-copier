import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const extensionRoot = path.resolve('chrome-extension');

const readJson = async (relativePath) =>
  JSON.parse(await fs.readFile(path.join(extensionRoot, relativePath), 'utf8'));

test('resolves automatic and explicit UI language preferences', async () => {
  const { normalizeUiLanguage, resolveUiLanguage } = await import('./i18n.js');

  assert.equal(normalizeUiLanguage('zh_CN'), 'zh_CN');
  assert.equal(normalizeUiLanguage('en'), 'en');
  assert.equal(normalizeUiLanguage('unsupported'), 'auto');
  assert.equal(resolveUiLanguage('auto', 'zh-CN'), 'zh_CN');
  assert.equal(resolveUiLanguage('auto', 'en-US'), 'en');
  assert.equal(resolveUiLanguage('zh_CN', 'en-US'), 'zh_CN');
});

test('ships complete English and Simplified Chinese locale catalogs', async () => {
  const [english, chinese] = await Promise.all([
    readJson('_locales/en/messages.json'),
    readJson('_locales/zh_CN/messages.json')
  ]);
  const requiredKeys = [
    'extensionName',
    'extensionDescription',
    'actionTitle',
    'commandCopyPureUrl',
    'uiLanguage',
    'languageAuto',
    'languageChinese',
    'languageEnglish',
    'settingsSaved',
    'pureUrlCopied'
  ];

  for (const key of requiredKeys) {
    assert.equal(typeof english[key]?.message, 'string', `missing English message: ${key}`);
    assert.equal(typeof chinese[key]?.message, 'string', `missing Chinese message: ${key}`);
  }
  assert.deepEqual(Object.keys(english).sort(), Object.keys(chinese).sort());
});

test('has translations for every key referenced by the popup and settings markup', async () => {
  const [english, chinese, popupHtml, optionsHtml] = await Promise.all([
    readJson('_locales/en/messages.json'),
    readJson('_locales/zh_CN/messages.json'),
    fs.readFile(path.join(extensionRoot, 'popup.html'), 'utf8'),
    fs.readFile(path.join(extensionRoot, 'options.html'), 'utf8')
  ]);
  const referencedKeys = [...`${popupHtml}\n${optionsHtml}`.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(
    ([, key]) => key
  );

  for (const key of referencedKeys) {
    assert.equal(typeof english[key]?.message, 'string', `missing English message: ${key}`);
    assert.equal(typeof chinese[key]?.message, 'string', `missing Chinese message: ${key}`);
  }
});

test('formats named placeholders in both locale catalogs', async () => {
  const { createTranslator } = await import('./i18n.js');
  const [english, chinese] = await Promise.all([
    readJson('_locales/en/messages.json'),
    readJson('_locales/zh_CN/messages.json')
  ]);

  assert.equal(createTranslator(english)('titleSource', { source: 'Open Graph' }), 'Title source: Open Graph');
  assert.equal(createTranslator(chinese)('titleSource', { source: 'Open Graph' }), '标题来源：Open Graph');
  assert.equal(createTranslator(english)('copiedCleanedItem'), 'Copied · cleaned 1 item');
});

test('localizes manifest-owned strings and keeps the action command system-owned', async () => {
  const manifest = await readJson('manifest.json');

  assert.equal(manifest.default_locale, 'en');
  assert.equal(manifest.name, '__MSG_extensionName__');
  assert.equal(manifest.description, '__MSG_extensionDescription__');
  assert.equal(manifest.action.default_title, '__MSG_actionTitle__');
  assert.equal(manifest.commands['copy-pure-url'].description, '__MSG_commandCopyPureUrl__');
  assert.equal('description' in manifest.commands._execute_action, false);
});

test('offers automatic, Chinese, and English language choices in settings', async () => {
  const optionsHtml = await fs.readFile(path.join(extensionRoot, 'options.html'), 'utf8');

  assert.match(optionsHtml, /id="ui-language"/);
  assert.match(optionsHtml, /value="auto"/);
  assert.match(optionsHtml, /value="zh_CN"/);
  assert.match(optionsHtml, /value="en"/);
});

test('packages the runtime translator and locale catalogs', async () => {
  const packageScript = await fs.readFile(path.resolve('scripts/package-extension.sh'), 'utf8');

  assert.match(packageScript, /i18n\.js/);
  assert.match(packageScript, /_locales/);
});
