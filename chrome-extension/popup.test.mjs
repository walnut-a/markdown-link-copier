import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const popupPath = path.resolve('chrome-extension/popup.js');
const popupSource = await fs.readFile(popupPath, 'utf8');
const clipboardWrites = [];
let activeTabs = [];
let executeScriptResult = [];
let executeScriptError = null;

Object.defineProperty(globalThis, 'document', {
  value: {
    getElementById: () => null,
    addEventListener: () => {},
    createElement: () => ({
      setAttribute: () => {},
      focus: () => {},
      select: () => {},
      style: {}
    }),
    body: {
      appendChild: () => {},
      removeChild: () => {}
    },
    execCommand: () => true
  },
  configurable: true
});

Object.defineProperty(globalThis, 'chrome', {
  value: {
    storage: {
      sync: {
        get: async (defaults) => defaults,
        set: async () => {}
      }
    },
    tabs: {
      query: async () => activeTabs
    },
    scripting: {
      executeScript: async () => {
        if (executeScriptError) {
          throw executeScriptError;
        }

        return executeScriptResult;
      }
    }
  },
  configurable: true
});

Object.defineProperty(globalThis, 'navigator', {
  value: {
    clipboard: {
      writeText: async (text) => {
        clipboardWrites.push(text);
      }
    }
  },
  configurable: true
});

const popupModule = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(
    `${popupSource}\nexport { cleanTitle, DEFAULT_SETTINGS, copyMarkdownLink };`
  )}`
);

const { cleanTitle, DEFAULT_SETTINGS, copyMarkdownLink } = popupModule;

const resetBrowserState = () => {
  clipboardWrites.length = 0;
  activeTabs = [];
  executeScriptResult = [];
  executeScriptError = null;
};

test('keeps the article title when the site name is a short prefix', () => {
  const title = '4G Spaces — 2016 年，我做过一次 AI 写代码创业';

  assert.equal(cleanTitle(title, DEFAULT_SETTINGS), '2016 年，我做过一次 AI 写代码创业');
});

test('removes a short site suffix after the separator', () => {
  const title = 'How browsers work | MDN';

  assert.equal(cleanTitle(title, DEFAULT_SETTINGS), 'How browsers work');
});

test('does not cut titles when the separator is part of the title itself', () => {
  const title = 'A/B Testing - Why It Matters';

  assert.equal(cleanTitle(title, DEFAULT_SETTINGS), 'A/B Testing - Why It Matters');
});

test('prefers page metadata when the tab title includes extra site text', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 1,
      title: 'vol.564 喜夜群英会｜四士同堂：这四年能与列位共谋大事，人间这一遭没白来 - 无聊斋 | 小宇宙 - 听播客，上小宇宙',
      url: 'https://www.xiaoyuzhoufm.com/episode/696d0b8edfbebe2f382b3108?utm_source=share'
    }
  ];
  executeScriptResult = [
    {
      result: {
        documentTitle:
          'vol.564 喜夜群英会｜四士同堂：这四年能与列位共谋大事，人间这一遭没白来 - 无聊斋 | 小宇宙 - 听播客，上小宇宙',
        ogTitle: 'vol.564 喜夜群英会｜四士同堂：这四年能与列位共谋大事，人间这一遭没白来',
        twitterTitle: 'vol.564 喜夜群英会｜四士同堂：这四年能与列位共谋大事，人间这一遭没白来',
        h1Title: 'vol.564 喜夜群英会｜四士同堂：这四年能与列位共谋大事，人间这一遭没白来'
      }
    }
  ];

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(
    clipboardWrites.at(-1),
    '[vol.564 喜夜群英会｜四士同堂：这四年能与列位共谋大事，人间这一遭没白来](https://www.xiaoyuzhoufm.com/episode/696d0b8edfbebe2f382b3108)'
  );
});

test('falls back to the tab title when page metadata cannot be read', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 2,
      title: '4G Spaces — 2016 年，我做过一次 AI 写代码创业',
      url: 'https://blog.youxu.info/2026/01/14/ai-codes-retrospective/'
    }
  ];
  executeScriptError = new Error('Cannot access this page');

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(
    clipboardWrites.at(-1),
    '[2016 年，我做过一次 AI 写代码创业](https://blog.youxu.info/2026/01/14/ai-codes-retrospective/)'
  );
});

test('prefers the X article title over generic page metadata', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 3,
      title: 'X',
      url: 'https://x.com/trq212/article/2033949937936085378'
    }
  ];
  executeScriptResult = [
    {
      result: {
        documentTitle: 'X',
        ogTitle: 'X',
        twitterTitle: '',
        h1Title: 'Types of Skills',
        articleTitle: 'Lessons from Building Claude Code: How We Use Skills'
      }
    }
  ];

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(
    clipboardWrites.at(-1),
    '[Lessons from Building Claude Code: How We Use Skills](https://x.com/trq212/article/2033949937936085378)'
  );
});
