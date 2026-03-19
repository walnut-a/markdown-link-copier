# Markdown Link Copier Chrome Extension

点击插件图标后，即可自动复制当前标签页的标题与清理后的链接，复制格式为 Markdown，如 `[标题](https://example.com)`。

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
- 直接使用页面标题生成 Markdown 链接，并写入剪贴板。
- 优先读取页面里的 `twitter-article-title`、`og:title`、`twitter:title`、`h1`，拿不到时再回退到标签页标题。
- 弹出层会提示复制结果或错误信息。
- 支持在弹窗中配置标题后缀清理规则，去掉站点 slogan。
- 已移除 PDF 导出功能，保持纯粹的 Markdown 链接复制。

## 使用方式

1. 推荐直接点击上面的商店链接安装。
2. 如果需要本地加载，打开 Chrome，访问 `chrome://extensions/`。
3. 右上角开启“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择本项目中的 `chrome-extension` 目录。
5. 将扩展图标固定到工具栏后，点击图标即可自动复制 Markdown 链接。
6. 无需点击按钮，打开弹窗会自动复制（若剪贴板受限可再次点击图标重试）。
7. 如需去掉标题后缀，可在弹窗中配置分隔符或关键词。

## 备注

- 如果页面禁止访问剪贴板，需要再点击一次或允许相关权限。
- 可以在 `popup.js` 中按需补充、调整需要剔除的追踪参数列表。
