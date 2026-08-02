import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const popupPath = path.resolve('chrome-extension/popup.js');
const popupSource = await fs.readFile(popupPath, 'utf8');
const popupHtml = await fs.readFile(path.resolve('chrome-extension/popup.html'), 'utf8');
const optionsHtml = await fs.readFile(path.resolve('chrome-extension/options.html'), 'utf8');
const manifest = JSON.parse(await fs.readFile(path.resolve('chrome-extension/manifest.json'), 'utf8'));
const clipboardWrites = [];
const consoleWarnings = [];
const createdTabs = [];
const statusElement = { textContent: '', dataset: {} };
const titleSourceElement = { textContent: '', hidden: true };
const resultPreviewElement = { value: '', hidden: true };
const resultPanelElement = { hidden: true };
const uiElements = new Map([
  ['status', statusElement],
  ['title-source', titleSourceElement],
  ['result-preview', resultPreviewElement],
  ['result-panel', resultPanelElement]
]);
let activeTabs = [];
let executeScriptResult = [];
let executeScriptError = null;
let executeScriptImplementation = null;
let pageDocumentTitle = '';
const pageSelectorMatches = new Map();
const pageSelectorLists = new Map();
let sourceDocumentTitle = '';
const sourceSelectorMatches = new Map();
const sourceSelectorLists = new Map();
let pageSourceResponse = null;

console.warn = (...args) => {
  consoleWarnings.push(args);
};

Object.defineProperty(globalThis, 'document', {
  value: {
    getElementById: (id) => uiElements.get(id) || null,
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
    execCommand: () => true,
    querySelector: (selector) => pageSelectorMatches.get(selector) || null,
    querySelectorAll: (selector) => pageSelectorLists.get(selector) || [],
    get title() {
      return pageDocumentTitle;
    }
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
      query: async () => activeTabs,
      create: async (options) => {
        createdTabs.push(options);
      }
    },
    scripting: {
      executeScript: async (options) => {
        if (executeScriptError) {
          throw executeScriptError;
        }

        if (executeScriptImplementation) {
          return [{ result: await executeScriptImplementation(options) }];
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

Object.defineProperty(globalThis, 'location', {
  value: {
    get href() {
      return activeTabs[0]?.url || '';
    }
  },
  configurable: true
});

Object.defineProperty(globalThis, 'fetch', {
  value: async () => {
    if (!pageSourceResponse) {
      throw new Error('Page source is unavailable');
    }

    return pageSourceResponse;
  },
  configurable: true
});

Object.defineProperty(globalThis, 'DOMParser', {
  value: class {
    parseFromString() {
      return {
        querySelector: (selector) => sourceSelectorMatches.get(selector) || null,
        querySelectorAll: (selector) => sourceSelectorLists.get(selector) || [],
        get title() {
          return sourceDocumentTitle;
        }
      };
    }
  },
  configurable: true
});

const popupModule = await import(
  `data:text/javascript;charset=utf-8,${encodeURIComponent(
    `${popupSource}\nexport { cleanTitle, cleanUrl, DEFAULT_SETTINGS, copyMarkdownLink, migrateSettings, getOutputPresetId, parseImportedSettings, serializeSettings };`
  )}`
);

const {
  cleanTitle,
  cleanUrl,
  DEFAULT_SETTINGS,
  copyMarkdownLink,
  migrateSettings,
  getOutputPresetId,
  parseImportedSettings,
  serializeSettings
} = popupModule;

const resetBrowserState = () => {
  clipboardWrites.length = 0;
  consoleWarnings.length = 0;
  createdTabs.length = 0;
  statusElement.textContent = '';
  statusElement.dataset.state = '';
  titleSourceElement.textContent = '';
  titleSourceElement.hidden = true;
  resultPreviewElement.value = '';
  resultPreviewElement.hidden = true;
  resultPanelElement.hidden = true;
  activeTabs = [];
  executeScriptResult = [];
  executeScriptError = null;
  executeScriptImplementation = null;
  pageDocumentTitle = '';
  pageSelectorMatches.clear();
  pageSelectorLists.clear();
  sourceDocumentTitle = '';
  sourceSelectorMatches.clear();
  sourceSelectorLists.clear();
  pageSourceResponse = null;
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
  assert.equal(resultPreviewElement.value, clipboardWrites.at(-1));
  assert.equal(resultPreviewElement.hidden, false);
  assert.equal(titleSourceElement.textContent, '标题来源：Open Graph');
  assert.equal(titleSourceElement.hidden, false);
  assert.equal(resultPanelElement.hidden, false);
  assert.equal(statusElement.dataset.state, 'success');
  assert.equal(statusElement.textContent, '已复制链接文本');
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

test('prefers an article h2 over a site-wide h1 when metadata is missing', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 7,
      title: 'Control the ideas, not the code - <antirez>',
      url: 'https://antirez.com/news/169'
    }
  ];
  pageDocumentTitle = 'Control the ideas, not the code - <antirez>';
  pageSelectorMatches.set('article h1, article h2, main h1, main h2', {
    textContent: 'Control the ideas, not the code'
  });
  pageSelectorLists.set('h1', [{ textContent: '<antirez>' }]);
  executeScriptImplementation = ({ func }) => func();

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(
    clipboardWrites.at(-1),
    '[Control the ideas, not the code](https://antirez.com/news/169)'
  );
});

test('prefers the original source heading when the visible page has been translated', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 8,
      title: '控制思想，而不是代码 - <antirez>',
      url: 'https://antirez.com/news/169'
    }
  ];
  pageDocumentTitle = '控制思想，而不是代码 - <antirez>';
  pageSelectorMatches.set('article h1, article h2, main h1, main h2', {
    textContent: '控制思想，而不是代码'
  });
  pageSelectorLists.set('h1', [{ textContent: '<antirez>' }]);
  sourceDocumentTitle = 'Control the ideas, not the code - <antirez>';
  sourceSelectorMatches.set('article h1, article h2, main h1, main h2', {
    textContent: 'Control the ideas, not the code'
  });
  sourceSelectorLists.set('h1', [{ textContent: '<antirez>' }]);
  pageSourceResponse = {
    ok: true,
    headers: { get: () => 'text/html; charset=utf-8' },
    text: async () => '<html></html>'
  };
  executeScriptImplementation = ({ func }) => func();

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(
    clipboardWrites.at(-1),
    '[Control the ideas, not the code](https://antirez.com/news/169)'
  );
});

test('uses a JSON-LD headline before a generic document title', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 9,
      title: 'Example News',
      url: 'https://example.com/news/launch'
    }
  ];
  pageDocumentTitle = 'Example News';
  pageSelectorLists.set('script[type="application/ld+json"]', [
    {
      textContent: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: 'A better original headline'
      })
    }
  ]);
  executeScriptImplementation = ({ func }) => func();

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(
    clipboardWrites.at(-1),
    '[A better original headline](https://example.com/news/launch)'
  );
  assert.equal(titleSourceElement.textContent, '标题来源：JSON-LD');
});

test('uses meta name title when social metadata is missing', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 10,
      title: 'Example',
      url: 'https://example.com/read'
    }
  ];
  pageDocumentTitle = 'Example';
  pageSelectorMatches.set('meta[name="title"]', {
    getAttribute: () => 'The article meta title'
  });
  executeScriptImplementation = ({ func }) => func();

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(clipboardWrites.at(-1), '[The article meta title](https://example.com/read)');
  assert.equal(titleSourceElement.textContent, '标题来源：页面元数据');
});

test('uses the canonical URL before cleaning tracking parameters', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 11,
      title: 'Canonical article',
      url: 'https://www.example.com/article?utm_source=newsletter'
    }
  ];
  executeScriptResult = [
    {
      result: {
        ogTitle: 'Canonical article',
        canonicalUrl: 'https://example.com/article'
      }
    }
  ];

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(clipboardWrites.at(-1), '[Canonical article](https://example.com/article)');
});

test('ignores canonical URLs that point to another site', async () => {
  resetBrowserState();
  activeTabs = [
    {
      id: 12,
      title: 'Canonical article',
      url: 'https://example.com/article?utm_source=newsletter'
    }
  ];
  executeScriptResult = [
    {
      result: {
        ogTitle: 'Canonical article',
        canonicalUrl: 'https://unrelated.example/article'
      }
    }
  ];

  await copyMarkdownLink(DEFAULT_SETTINGS);

  assert.equal(clipboardWrites.at(-1), '[Canonical article](https://example.com/article)');
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

test('keeps generic parameters that may control page behavior', () => {
  assert.equal(
    cleanUrl(
      'https://example.com/report?from=2026-01-01&source=archive&ref=section&campaign=spring&ref_type=article&share_mode=compact'
    ),
    'https://example.com/report?from=2026-01-01&source=archive&ref=section&campaign=spring&ref_type=article&share_mode=compact'
  );
});

test('migrates untouched legacy cleaning defaults without changing custom rules', () => {
  const legacyDefaults = {
    ...DEFAULT_SETTINGS,
    settingsVersion: 1,
    trackingParams: [
      ...DEFAULT_SETTINGS.trackingParams,
      'ref',
      'ref_url',
      'referrer',
      'referrer_id',
      'referral',
      'refid',
      'source',
      'from',
      'share',
      'campaign'
    ],
    trackingPrefixes: [...DEFAULT_SETTINGS.trackingPrefixes, 'ref_', 'share_']
  };
  const migratedDefaults = migrateSettings(legacyDefaults);
  const customized = migrateSettings({
    ...legacyDefaults,
    trackingParams: ['utm_source', 'ref']
  });

  assert.equal(migratedDefaults.settingsVersion, DEFAULT_SETTINGS.settingsVersion);
  assert.deepEqual(migratedDefaults.trackingParams, DEFAULT_SETTINGS.trackingParams);
  assert.deepEqual(migratedDefaults.trackingPrefixes, DEFAULT_SETTINGS.trackingPrefixes);
  assert.deepEqual(customized.trackingParams, ['utm_source', 'ref']);
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

test('declares a discoverable action shortcut without the broad tabs permission', () => {
  assert.equal(manifest.permissions.includes('tabs'), false);
  assert.equal(manifest.commands._execute_action.description, '复制当前页面链接文本');
});

test('includes result preview, title source, and shortcut settings controls in the popup', () => {
  assert.match(popupHtml, /id="result-panel"/);
  assert.match(popupHtml, /id="result-preview"/);
  assert.match(popupHtml, /id="title-source"/);
  assert.match(popupHtml, /id="open-shortcuts"/);
});

test('maps built-in output templates to presets and keeps custom templates', () => {
  assert.equal(getOutputPresetId('[{{markdownTitle}}]({{markdownUrl}})'), 'markdown');
  assert.equal(getOutputPresetId('{{title}}\n{{url}}'), 'title-url');
  assert.equal(getOutputPresetId('{{url}}'), 'url');
  assert.equal(getOutputPresetId('{{hostname}} :: {{title}}'), 'custom');
});

test('serializes and validates imported settings', () => {
  const exported = serializeSettings({
    ...DEFAULT_SETTINGS,
    stripTitleSuffix: false,
    outputTemplate: '{{url}}'
  });
  const imported = parseImportedSettings(exported);

  assert.equal(imported.stripTitleSuffix, false);
  assert.equal(imported.outputTemplate, '{{url}}');
  assert.throws(() => parseImportedSettings('[]'), /设置文件必须是 JSON 对象/);
  assert.throws(() => parseImportedSettings('{broken'), /设置文件不是有效的 JSON/);
});

test('includes output presets and settings backup controls in the options page', () => {
  assert.match(optionsHtml, /id="output-preset"/);
  assert.match(optionsHtml, /id="export-settings"/);
  assert.match(optionsHtml, /id="import-settings"/);
  assert.match(optionsHtml, /id="reset-settings"/);
});
