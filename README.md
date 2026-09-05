# Markdown Link Copier

一个 Chrome 扩展：点击图标后，会把当前标签页的标题和清理后的链接复制成可配置的文本格式。默认输出 Markdown 链接。

## Chrome Web Store

已上架并通过审核，可直接安装：

<a href="https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn">
  <img
    src="https://img.shields.io/badge/Install%20from%20Chrome%20Web%20Store-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white"
    alt="Install from Chrome Web Store"
  >
</a>

[Markdown Link Copier - Chrome Web Store](https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn)

## 产品官网

仓库根目录是一套不依赖框架或第三方运行时的静态官网，通过 GitHub Pages 发布：

`https://walnut-a.github.io/markdown-link-copier/`

官网代码仍与扩展一起开源，仓库采用 [MIT License](LICENSE)。

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
- 保留可能影响页面行为的通用参数，例如 `ref`、`source`、`from`
- 支持 JSON-LD、页面元数据、文章标题和翻译前原始标题
- 优先采用同站 canonical 地址，再清理追踪参数
- 支持清理站点后缀，减少标题里的站点名和 slogan
- 支持通过设置页修改 URL 清洗规则、条件参数组和输出模板
- 内置常用输出预设，支持导入、导出和恢复设置
- 复制后显示实际结果、标题来源和链接清理摘要
- 剪贴板写入失败时保留生成结果，并提供再次复制入口
- 可通过独立快捷键复制去除查询参数和 `#` 片段的纯链接
- 提供快捷键设置入口，可分别配置链接文本与纯链接命令
- 使用不打开弹窗的纯链接快捷键时，会在当前页面短暂显示成功或失败反馈
- 默认复制结果是 Markdown 链接，适合粘贴到笔记、文档和博客里

## 开发说明

- 扩展主体在 `chrome-extension/`
- 官网入口为 `index.html`，样式和交互分别位于 `css/custom-theme.css` 与 `js/main.js`
- 商店配图及其可复现 HTML/CSS 源文件位于 `docs/store-assets/`
- 测试命令：`node --test chrome-extension/*.test.mjs`
- 精简发布包：`./scripts/package-extension.sh`

## 详细说明

更细的使用说明和配置项，见 [`chrome-extension/README.md`](chrome-extension/README.md)
