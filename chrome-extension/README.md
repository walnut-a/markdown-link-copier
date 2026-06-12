# Markdown Link Copier Chrome Extension

点击插件图标后，即可自动复制当前标签页的标题与清理后的链接。默认复制格式为 Markdown，如 `[标题](https://example.com)`；也可以在弹窗里改成自己的输出模板。

## 商店安装

已通过审核，推荐直接从 Chrome Web Store 安装：

<a href="https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn">
  <img
    src="https://img.shields.io/badge/Install%20from%20Chrome%20Web%20Store-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white"
    alt="Install from Chrome Web Store"
  >
</a>

[Markdown Link Copier - Chrome Web Store](https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn)

## 功能

- 自动去除链接中的常见追踪参数（例如 `utm_*`、`gclid`、`fbclid` 等）。
- 使用页面标题和清理后的链接生成输出文本，并写入剪贴板。
- 优先读取页面里的 `twitter-article-title`、`og:title`、`twitter:title`、`h1`，拿不到时再回退到标签页标题。
- 弹出层会提示复制结果或错误信息。
- 支持在设置页配置标题后缀清理规则，去掉站点 slogan。
- 支持在设置页配置 URL 清洗规则，包括删除参数、删除参数前缀和条件参数组。
- 支持在设置页配置输出模板；默认模板为 `[{{markdownTitle}}]({{markdownUrl}})`。
- 已移除 PDF 导出功能，保持纯粹的链接文本复制。

## 使用方式

1. 推荐直接点击上面的商店链接安装。
2. 如果需要本地加载，打开 Chrome，访问 `chrome://extensions/`。
3. 右上角开启“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择本项目中的 `chrome-extension` 目录。
5. 将扩展图标固定到工具栏后，点击图标即可自动复制链接文本。
6. 无需点击按钮，打开弹窗会自动复制（若剪贴板受限可再次点击图标重试）。
7. 如需调整清洗规则或复制格式，可在弹窗中点击“设置”打开设置页。

## 规则配置

设置页中的规则会保存到 `chrome.storage.sync`，修改后立即影响下一次复制，不需要重新发版。

- 删除参数：每行一个完整参数名，例如 `utm_source`、`fbclid`。
- 删除参数前缀：每行一个前缀，例如 `utm_`、`ga_`。
- 条件参数组：JSON 数组。`markers` 命中任意一个参数时，删除同组 `remove` 里的参数。

条件参数组示例：

```json
[
  {
    "markers": ["publication_id", "isFreemail", "triedRedirect"],
    "remove": ["publication_id", "post_id", "isFreemail", "r", "triedRedirect"]
  }
]
```

输出模板可使用这些变量：

- `{{title}}`：处理后的标题
- `{{url}}`：清理后的链接
- `{{rawTitle}}`：原始标签页标题
- `{{rawUrl}}`：原始链接
- `{{hostname}}`：清理后链接的域名
- `{{markdownTitle}}`：适合放进 Markdown 链接标题位置的转义标题
- `{{markdownUrl}}`：适合放进 Markdown 链接 URL 位置的转义链接

## 备注

- 如果页面禁止访问剪贴板，需要再点击一次或允许相关权限。
- 绝大多数追踪参数和输出格式调整都可以直接在设置页完成。
