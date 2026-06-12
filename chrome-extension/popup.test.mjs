import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const popupPath = path.resolve('chrome-extension/popup.js');
const popupSource = await fs.readFile(popupPath, 'utf8');
const clipboardWrites = [];
const consoleWarnings = [];
let activeTabs = [];
let executeScriptResult = [];
let executeScriptError = null;

console.warn = (...args) => {
  consoleWarnings.push(args);
};

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
    `${popupSource}\nexport { cleanTitle, cleanUrl, DEFAULT_SETTINGS, copyMarkdownLink };`
  )}`
);

const { cleanTitle, cleanUrl, DEFAULT_SETTINGS, copyMarkdownLink } = popupModule;

const resetBrowserState = () => {
  clipboardWrites.length = 0;
  consoleWarnings.length = 0;
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

test('collapses whitespace in copied titles', () => {
  assert.equal(cleanTitle('  Shipping\nMarkdown\tlinks  ', DEFAULT_SETTINGS), 'Shipping Markdown links');
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

  assert.equal(consoleWarnings.length, 1);
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

test('removes Substack email tracking parameters from copied links', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 4,
      title: 'The First Hour of Work - Proof of Concept',
      url: 'https://www.proofofconcept.pub/p/the-first-hour-of-work?utm_source=post-email-title&publication_id=22603&post_id=201013502&utm_campaign=email-post-title&isFreemail=true&r=21nom&triedRedirect=true&utm_medium=email'
    }
  ];
  executeScriptResult = [
    {
      result: {
        documentTitle: 'The First Hour of Work - Proof of Concept',
        ogTitle: 'The First Hour of Work',
        twitterTitle: 'The First Hour of Work',
        h1Title: 'The First Hour of Work'
      }
    }
  ];

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(
    clipboardWrites.at(-1),
    '[The First Hour of Work](https://www.proofofconcept.pub/p/the-first-hour-of-work)'
  );
});

test('keeps short r parameters when there are no Substack tracking markers', () => {
  assert.equal(cleanUrl('https://example.com/path?r=release-2026'), 'https://example.com/path?r=release-2026');
});

test('keeps post_id parameters when there are no Substack tracking markers', () => {
  assert.equal(cleanUrl('https://example.com/read?post_id=201013502'), 'https://example.com/read?post_id=201013502');
});

test('uses configurable URL cleaning rules', () => {
  const settings = {
    ...DEFAULT_SETTINGS,
    trackingParams: ['session_id'],
    trackingPrefixes: ['track_'],
    conditionalTrackingParamGroups: [
      {
        markers: ['mail_id'],
        remove: ['mail_id', 'post_id', 'r']
      }
    ]
  };

  assert.equal(
    cleanUrl(
      'https://example.com/read?session_id=abc&track_source=email&mail_id=42&post_id=201013502&r=reader&keep=true',
      settings
    ),
    'https://example.com/read?keep=true'
  );
});

test('escapes markdown syntax in copied titles and URLs', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 5,
      title: 'Fallback [Title]',
      url: 'https://example.com/docs/markdown-(v2)?utm_source=newsletter'
    }
  ];
  executeScriptResult = [
    {
      result: {
        documentTitle: 'Fallback [Title]',
        ogTitle: 'Ship [Markdown] safely',
        twitterTitle: '',
        h1Title: ''
      }
    }
  ];

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(
    clipboardWrites.at(-1),
    '[Ship \\[Markdown\\] safely](https://example.com/docs/markdown-(v2\\))'
  );
});

test('renders copied text with a configurable output template', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 6,
      title: 'Fallback [Title] - Example',
      url: 'https://example.com/docs/markdown-(v2)?utm_source=newsletter'
    }
  ];
  executeScriptResult = [
    {
      result: {
        documentTitle: 'Fallback [Title] - Example',
        ogTitle: 'Ship [Markdown] safely',
        twitterTitle: '',
        h1Title: ''
      }
    }
  ];

  await copyMarkdownLink({
    ...DEFAULT_SETTINGS,
    outputTemplate: '{{hostname}} :: {{title}}\n{{url}}\nraw={{rawUrl}}'
  });

  assert.equal(
    clipboardWrites.at(-1),
    'example.com :: Ship [Markdown] safely\nhttps://example.com/docs/markdown-(v2)\nraw=https://example.com/docs/markdown-(v2)?utm_source=newsletter'
  );
});
