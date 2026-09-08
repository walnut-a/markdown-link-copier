# Markdown Link Copier 轻推广素材

## 推荐配图

- 演示动图：[`markdown-link-copier-demo.gif`](markdown-link-copier-demo.gif)
- 动图替代文本：一个带有 `utm_source` 和 `gclid` 参数的网址，点击 Markdown Link Copier 后，变成带准确文章标题的干净 Markdown 链接。
- 中文官网：<https://walnut-a.github.io/markdown-link-copier/zh-CN/>
- 英文官网：<https://walnut-a.github.io/markdown-link-copier/>
- 源代码：<https://github.com/walnut-a/markdown-link-copier>

## 中文短文案

做了一个很小的 Chrome 扩展：Markdown Link Copier。

点一下，就能把当前页面复制成 `[准确标题](干净链接)`。它会尽量找回真正的文章标题，移除 `utm_*`、`gclid` 等追踪参数，同时保留可能影响页面功能的正常参数。

44 KB、完全开源、无需账号，不上传浏览数据。

安装：<https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn?utm_source=cn_social&utm_medium=social&utm_campaign=light_launch>

## 中文超短版

把当前网页一键复制成干净、准确的 Markdown 链接：自动找标题、清理追踪参数，还能自定义输出格式。44 KB、开源、无账号、不上传浏览数据。

<https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn?utm_source=cn_social_short&utm_medium=social&utm_campaign=light_launch>

## English post

I made a tiny Chrome extension called Markdown Link Copier.

One click turns the current page into `[an accurate title](a clean URL)`. It finds a better article title, removes known tracking parameters such as `utm_*` and `gclid`, and preserves ordinary parameters that may affect the page.

44 KB, fully open source, no account, and no browsing data is uploaded.

Install: <https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn?utm_source=en_social&utm_medium=social&utm_campaign=light_launch>

## English short version

Turn the current page into a clean, accurate Markdown link in one click. Better titles, conservative tracking cleanup, custom output formats. 44 KB, open source, no account, no browsing-data uploads.

<https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn?utm_source=en_social_short&utm_medium=social&utm_campaign=light_launch>

## GitHub 发布说明

Markdown Link Copier is a small, local-first Chrome extension for people who save and share links in Markdown-based notes, documentation, blogs, knowledge bases, and chats.

What makes it different:

- Finds article titles through JSON-LD, Open Graph, headings, and safe fallbacks
- Removes known tracking parameters without deleting every query value
- Supports Markdown, title-and-URL, URL-only, and custom templates
- Shows the copied result, title source, and cleanup summary
- Runs locally with no account or remote service
- Ships as a roughly 44 KB compressed package under the MIT License

Chrome Web Store: <https://chromewebstore.google.com/detail/markdown-link-copier/okdollbnpaenkphpigcahcaiddfainpn?utm_source=github&utm_medium=referral&utm_campaign=light_launch>

## 发布原则

- 先展示具体的复制前后变化，再解释功能。
- 不使用“最好”“第一”或“精选”等无法核实的表述。
- 不要求朋友集中安装；邀请真正需要的人持续使用。
- 可以邀请实际用户留下真实评价，但不提供奖励，也不规定评价内容。
- 每个渠道单独替换 `utm_source`，在商店“展示次数”中比较访问来源。

## 重新生成演示动图

```sh
./scripts/render-promotion-gif.sh
```

脚本使用项目随附的 `demo.html`、本机 Google Chrome 和 Codex 工作区内置 Playwright 逐帧渲染，再通过 `ffmpeg` 生成 960×540、12 fps、4 秒循环 GIF。画面不依赖远程资源。
