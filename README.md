# Markdown Link Copier

一个 Chrome 扩展：点击图标后，会把当前标签页的标题和清理后的链接复制成 Markdown 格式。

## 安装

这个仓库不需要构建，直接加载扩展目录就行。

1. 打开 Chrome，进入 `chrome://extensions/`
2. 右上角打开“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择仓库里的 `chrome-extension/` 目录
5. 可选：把扩展图标固定到工具栏，方便随时使用

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
