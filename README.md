# Markdown Link Copier

一个 Chrome 扩展：点击图标后，会把当前标签页的标题和清理后的链接复制成 Markdown 格式。

## Chrome Web Store

已上架并通过审核，可直接安装：

<a href="https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn">
  <img
    src="https://img.shields.io/badge/Install%20from%20Chrome%20Web%20Store-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white"
    alt="Install from Chrome Web Store"
  >
</a>

[Markdown Link Copier - Chrome Web Store](https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn)

## 安装

优先建议直接从 Chrome Web Store 安装；如果你想本地加载或调试，也可以直接加载扩展目录。

1. 打开商店链接并点击“添加至 Chrome”
2. 或者打开 Chrome，进入 `chrome://extensions/`
3. 右上角打开“开发者模式”
4. 点击“加载已解压的扩展程序”
5. 选择仓库里的 `chrome-extension/` 目录
6. 可选：把扩展图标固定到工具栏，方便随时使用

## 功能

- 自动去掉常见追踪参数，例如 `utm_*`、`gclid`、`fbclid`
- 优先读取页面里的标题信息，再回退到标签页标题
- 支持清理站点后缀，减少标题里的站点名和 slogan
- 复制结果直接是 Markdown 链接，适合粘贴到笔记、文档和博客里

## 开发说明

- 扩展主体在 `chrome-extension/`
- 测试命令：`node --test chrome-extension/popup.test.mjs`

## 详细说明

更细的使用说明和配置项，见 [`chrome-extension/README.md`](chrome-extension/README.md)
