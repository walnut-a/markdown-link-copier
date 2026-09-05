# Chrome Web Store 商店文案

## 简短说明

一键复制干净、准确的网页标题与链接，支持 Markdown、自定义模板、追踪参数清理和原始标题识别。

## 详细说明

复制网页链接，不该还要手动删除追踪参数、修正标题。

Markdown Link Copier 会在你点击扩展图标或使用 Chrome 快捷键时，识别当前页面的准确标题，清理常见追踪参数，并把结果按 Markdown 或自定义格式复制到剪贴板。

适合这些场景：

- 把网页收进笔记和知识库
- 在文档、博客或聊天中分享整洁链接
- 保留原始文章标题，减少站点名称和 slogan 的干扰

核心功能：

- 自动清理 `utm_*`、`gclid`、`fbclid` 等常见追踪参数
- 保留可能影响页面功能的普通查询参数
- 综合 JSON-LD、Open Graph、文章标题和页面元数据识别准确标题
- 网页开启翻译时，尽量恢复翻译前的原始标题
- 优先使用同站点 canonical 地址
- 支持 Markdown、标题与链接分行、仅链接及自定义模板
- 支持独立快捷键复制去除查询参数和 `#` 片段的纯链接
- 弹窗内显示复制状态与结果，纯链接快捷键提供页面提示
- 支持设置同步、导入、导出和恢复默认
- 复制后显示实际结果、标题来源和链接清理摘要，便于核对
- 剪贴板写入失败时保留结果，并提供再次复制入口

隐私说明：

扩展只在你主动点击或触发快捷键时读取当前页面，不收集、不上传、不出售任何浏览数据。

## English detailed description

Copying a web link should not require manually removing tracking parameters or fixing the title.

Markdown Link Copier identifies an accurate title for the current page, removes common tracking parameters, and copies the result to your clipboard in Markdown or a custom format whenever you click the extension icon or use a Chrome shortcut.

Great for:

- Saving web pages to notes and knowledge bases
- Sharing clean links in documents, blogs, and chats
- Preserving original article titles without unnecessary site names and slogans

Key features:

- Removes common tracking parameters such as `utm_*`, `gclid`, and `fbclid`
- Preserves ordinary query parameters that may affect page behavior
- Uses JSON-LD, Open Graph, article headings, and page metadata to identify accurate titles
- Attempts to recover original titles when Chrome page translation is active
- Prefers same-site canonical URLs
- Supports Markdown, title-and-URL, URL-only, and custom templates
- Includes a separate shortcut for copying a clean URL without query parameters or hash fragments
- Shows copy status and results in the popup, with on-page feedback for the clean-URL shortcut
- Supports synced settings, import, export, and restore defaults
- Shows the copied result, title source, and link-cleaning summary for verification
- Keeps the result and offers retry when clipboard access fails
- Supports English and Chinese UI with an optional language override

Privacy:

The extension reads the current page only when you click it or trigger a shortcut. It does not collect, upload, or sell browsing data.

## 商店链接

- 首页网址（当前）：https://github.com/walnut-a/markdown-link-copier
- 独立产品页（发布后）：https://walnut-a.github.io/markdown-link-copier/
- 支持信息页面：https://github.com/walnut-a/markdown-link-copier/issues

## 当前更新边界

- 详细说明、首页网址和支持信息页面已随 1.5.3 发布。
- 简短说明来自 `manifest.json`，需要随下一个扩展版本上传，不能只在商品详情页修改。
- 2026-09-05 已用新版 1280×800 全球通用截图替换旧图并提请审核；后台状态为“待审核”，通过后自动发布。
- 新版截图源文件位于 `docs/store-assets/store-screenshot-01.html`，上传文件为 `docs/store-assets/markdown-link-copier-1280x800.png`。
- MIT License 已补充到仓库根目录。
- 独立产品官网已纳入仓库并通过 GitHub Pages 发布：<https://walnut-a.github.io/markdown-link-copier/>。在通过 Search Console 验证前，商店“官方网址”仍保持“无”。
- 已完成 3 张补充截图、440×280 小型宣传图块和 1400×560 顶部宣传图块；这些新增素材尚未上传商店，避免与当前待审核版本混在同一次不可回滚的外部操作中。

## 截图建议

1. 已完成：在普通文章页展示复制成功、结果预览、标题来源及追踪参数清理。
2. 已完成：展示开启网页翻译后仍复制原始标题的例子，文件为 `markdown-link-copier-original-title-1280x800.png`。
3. 已完成：展示输出预设和自定义模板设置，文件为 `markdown-link-copier-output-presets-1280x800.png`。
4. 已完成：展示纯链接快捷键及 URL 清理结果，文件为 `markdown-link-copier-shortcut-1280x800.png`。
5. 已完成：小型宣传图块 `markdown-link-copier-small-promo-440x280.png` 与顶部宣传图块 `markdown-link-copier-marquee-1400x560.png`。

## 精选与商店发现策略（2026-09-05）

- Chrome 已于 2026-08-20 关闭 Featured badge 自荐，并计划在年内下线该徽章；当前没有可提交的精选徽章申请。
- 首页推荐、编辑精选和策展集合仍由 Chrome 编辑团队主动选择，官方不接受付费或主动申请，也没有保证入选的检查表。
- 官方公开信号包括：产品用途与用户需求是否清晰、体验与设计、性能、相关性、适用人群广度，以及评分、下载和卸载趋势。
- 参考：[Chrome Web Store updates (2026)](https://developer.chrome.com/blog/cws-review-updates-2026)、[Discovery on the Chrome Web Store](https://developer.chrome.com/docs/webstore/discovery/)、[Creating a great listing page](https://developer.chrome.com/docs/webstore/best-listing)。

当前最值得补强的项目：

1. 当前商店只有 10 位用户且尚无评分。先通过真实用户传播积累安装、留存与自然评价，不能做激励评价或虚假安装。
2. 已完成：仓库根目录已经补充 MIT License。
3. 素材已在本地完成：当前待审核截图之外，已有 3 张补充截图、440×280 小型宣传图块和 1400×560 顶部宣传图块；下一步是在当前审核结束后上传并重新提交。
4. 官网已部署：下一步通过 Search Console 验证，并把商店“官方网址”切换为产品页；GitHub 继续作为源码与支持入口。
5. 继续保持 Manifest V3、最小权限、不收集数据、清晰的单一用途、自动化测试和稳定更新记录。

## 发布检查

- 使用 `./scripts/package-extension.sh` 生成上传包。
- 确认上传包版本与 `manifest.json` 一致。
- 重新核对权限声明、隐私说明和截图中的版本界面。
- 商店发布完成后，回读公开页面的版本号、说明和更新时间。
