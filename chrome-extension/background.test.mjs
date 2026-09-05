import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

let commandListener;
let activeTabs = [];
let clipboardScriptResult = true;
let uiLanguage = 'zh_CN';
const scriptExecutions = [];

Object.defineProperty(globalThis, 'chrome', {
  value: {
    i18n: {
      getUILanguage: () => 'zh-CN',
      getMessage: () => ''
    },
    runtime: {
      getURL: (resourcePath) => resourcePath
    },
    storage: {
      sync: {
        get: async () => ({ uiLanguage })
      }
    },
    commands: {
      onCommand: {
        addListener: (listener) => {
          commandListener = listener;
        }
      }
    },
    tabs: {
      query: async () => activeTabs
    },
    scripting: {
      executeScript: async (options) => {
        scriptExecutions.push(options);
        return [{ result: options.args?.length === 1 ? clipboardScriptResult : true }];
      }
    }
  },
  configurable: true
});

const backgroundSource = await fs.readFile(path.resolve('chrome-extension/background.js'), 'utf8');
const feedbackSource = await fs.readFile(path.resolve('chrome-extension/page-feedback.js'), 'utf8');
const i18nSource = await fs.readFile(path.resolve('chrome-extension/i18n.js'), 'utf8');
const feedbackModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(feedbackSource)}`;
const i18nModuleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(i18nSource)}`;

Object.defineProperty(globalThis, 'fetch', {
  value: async (resourcePath) => ({
    ok: true,
    json: async () =>
      JSON.parse(
        await fs.readFile(path.resolve('chrome-extension', String(resourcePath)), 'utf8')
      )
  }),
  configurable: true
});

const { COPY_PURE_URL_COMMAND, handleCommand, toPureUrl } = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(
    backgroundSource
      .replace("'./page-feedback.js'", JSON.stringify(feedbackModuleUrl))
      .replace("'./i18n.js'", JSON.stringify(i18nModuleUrl))
  )}`
);

test('removes the query string and fragment from a pure URL', () => {
  assert.equal(
    toPureUrl('https://example.com/docs/page?utm_source=newsletter&view=full#details'),
    'https://example.com/docs/page'
  );
});

test('keeps URL paths and returns an invalid input unchanged', () => {
  assert.equal(toPureUrl('https://example.com/docs/page/'), 'https://example.com/docs/page/');
  assert.equal(toPureUrl('not a URL'), 'not a URL');
});

test('registers the pure URL command listener', () => {
  assert.equal(COPY_PURE_URL_COMMAND, 'copy-pure-url');
  assert.equal(commandListener, handleCommand);
});

test('copies the active tab pure URL through an injected clipboard writer', async () => {
  activeTabs = [
    {
      id: 23,
      url: 'https://example.com/article?id=42&utm_source=test#comments'
    }
  ];
  clipboardScriptResult = true;
  scriptExecutions.length = 0;

  const copied = await handleCommand(COPY_PURE_URL_COMMAND);

  assert.equal(copied, true);
  assert.equal(scriptExecutions.length, 2);
  assert.deepEqual(scriptExecutions[0].target, { tabId: 23 });
  assert.deepEqual(scriptExecutions[0].args, ['https://example.com/article']);
  assert.equal(typeof scriptExecutions[0].func, 'function');
  assert.deepEqual(scriptExecutions[1].target, { tabId: 23 });
  assert.deepEqual(scriptExecutions[1].args, ['纯链接已复制', 'success']);
  assert.equal(typeof scriptExecutions[1].func, 'function');
});

test('shows an error message when pure URL clipboard writing fails', async () => {
  activeTabs = [{ id: 24, url: 'https://example.com/article?id=42' }];
  clipboardScriptResult = false;
  scriptExecutions.length = 0;

  const copied = await handleCommand(COPY_PURE_URL_COMMAND);

  assert.equal(copied, false);
  assert.deepEqual(scriptExecutions[1].target, { tabId: 24 });
  assert.deepEqual(scriptExecutions[1].args, ['纯链接复制失败', 'error']);
});

test('uses the manually selected English language for page feedback', async () => {
  activeTabs = [{ id: 25, url: 'https://example.com/article?id=42' }];
  clipboardScriptResult = true;
  scriptExecutions.length = 0;
  uiLanguage = 'en';

  const copied = await handleCommand(COPY_PURE_URL_COMMAND);

  assert.equal(copied, true);
  assert.deepEqual(scriptExecutions[1].args, ['Clean URL copied', 'success']);
  uiLanguage = 'zh_CN';
});

test('ignores unrelated commands and pages without a usable URL', async () => {
  clipboardScriptResult = true;
  scriptExecutions.length = 0;
  activeTabs = [{ id: 23, url: 'https://example.com/?id=42' }];
  assert.equal(await handleCommand('unrelated-command'), false);

  activeTabs = [{ id: 23 }];
  assert.equal(await handleCommand(COPY_PURE_URL_COMMAND), false);
  assert.equal(scriptExecutions.length, 0);
});
