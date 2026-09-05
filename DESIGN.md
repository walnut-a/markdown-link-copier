---
name: Markdown Link Copier
description: 一套把真实复制结果与工程证据并置的清澈、克制视觉系统
colors:
  action-blue: "#126fe8"
  action-blue-deep: "#075bc6"
  daylight-blue: "#edf5ff"
  ink-navy: "#0c1c3f"
  quiet-slate: "#60708c"
  paper-white: "#ffffff"
  canvas-blue: "#f5f9ff"
  rule-blue: "#d7e2f1"
  success-green: "#10815a"
  success-mist: "#eaf8f1"
typography:
  display:
    fontFamily: "Trebuchet MS, Avenir Next, sans-serif"
    fontSize: "clamp(54px, 5.5vw, 82px)"
    fontWeight: 830
    lineHeight: 0.98
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "Trebuchet MS, Avenir Next, sans-serif"
    fontSize: "clamp(42px, 5vw, 66px)"
    fontWeight: 760
    lineHeight: 1.04
    letterSpacing: "-0.055em"
  body:
    fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  compact: "8px"
  control: "12px"
  panel: "18px"
  window: "26px"
spacing:
  micro: "8px"
  compact: "12px"
  control: "20px"
  cluster: "28px"
  section: "132px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.action-blue-deep}"
  result-success:
    backgroundColor: "{colors.success-mist}"
    textColor: "{colors.success-green}"
    rounded: "{rounded.control}"
    padding: "11px 13px"
---

# Design System: Markdown Link Copier

## Overview

**Creative North Star: "透明工作台"**

界面像一张被日光照亮的轻量工作台：复制动作始终是视觉主角，标题来源、清理结果、权限和代码等证据紧邻结果出现。视觉气质清澈、准确、平静，不依靠装饰制造“强大感”，而是让真实界面和可核实事实形成可信度。

扩展弹窗、官网与商店素材共用蓝白底色、深墨文字、成功绿和精细分隔线。官网可以放大浏览器与弹窗的空间关系，扩展本体仍然保持高密度、短路径和不打断自动复制的原则。

**Key Characteristics:**

- 浅蓝日光背景与白色工作表面。
- 大字号深墨标题承载唯一主要叙事。
- Chrome 蓝只用于主要操作和少量确认性强调。
- 真实结果、来源和权限说明优先于抽象插画。
- 高级设置存在，但不进入默认复制路径。

## Colors

配色以冷静的浅蓝中性色为底，深墨色保持阅读力度，操作蓝与成功绿各自承担单一语义。

### Primary

- **Action Blue**：用于主要安装按钮、链接焦点和选择状态。
- **Action Blue Deep**：仅用于主要操作的悬停反馈。

### Secondary

- **Success Green**：只表示复制完成、设置保存或清理完成等已确认状态。
- **Success Mist**：作为成功信息的低对比背景，不能单独表达状态。

### Neutral

- **Ink Navy**：标题、关键结果和高优先级文字。
- **Quiet Slate**：说明、元数据和次要信息。
- **Paper White**：弹窗、表格和清晰内容表面。
- **Canvas Blue**：官网大面积背景和权限区底色。
- **Rule Blue**：分隔线、描边和输入框边界。

**The Sparse Accent Rule.** 操作蓝保持稀少；同一视口只允许一个主要蓝色操作成为第一注意点。

**The Confirmed Green Rule.** 成功绿只用于已经发生并可验证的状态，不能用作普通装饰。

## Typography

**Display Font:** Trebuchet MS 与 Avenir Next 回退
**Body Font:** 系统无衬线字体栈
**Label/Mono Font:** SFMono-Regular、Menlo 与等宽回退

**Character:** 展示字重宽、紧凑、有明确编辑感；正文中性舒展。等宽字体只用于 URL、Markdown 结果、清单标识和代码证据。

### Hierarchy

- **Display**：接近满幅的首屏价值主张，最多两到四行，移动端缩小到 48px。
- **Headline**：章节结论，保持紧凑行距并优先使用短句。
- **Title**：功能名称和弹窗标题，通常为 17–22px 的半粗或粗体。
- **Body**：主要解释文字为 16–18px，单段保持约 55–68 个英文字符的阅读宽度。
- **Label**：仅用于技术证据、权限名称和小型元数据，不承担页面装饰。

**The One Voice Rule.** 同一层级只使用一种字族和一种强调方式；不用渐变字、描边字或装饰字体制造层级。

## Layout

官网使用最大 1180px 的内容边界。首屏、功能解释、权限清单与开源证据在桌面端使用不对称双栏，主要信息与真实界面互相对应；证据栏横跨整幅。章节垂直节奏以 132px 为大步进，内部使用 8、12、20、28px 的紧凑尺度。

980px 以下切换为单栏；680px 以下隐藏次要导航与页头安装链接，保留首屏唯一主要操作。移动端文本必须先完整可读，产品演示可以作为有意裁切的横向局部，但页面本身不得产生横向滚动。

## Elevation & Depth

系统以平面分隔和色调层级为主，阴影只负责说明“浏览器上方的弹窗”和“页面上方的反馈”这类真实层级。普通内容区、证据栏和权限清单不使用阴影。

### Shadow Vocabulary

- **Browser Ambient** (`0 28px 70px rgba(34, 74, 132, .16), 0 4px 16px rgba(32, 52, 84, .08)`): 仅用于大型浏览器演示窗口。
- **Popover Lift** (`0 20px 50px rgba(21, 40, 72, .18), 0 3px 8px rgba(21, 40, 72, .08)`): 仅用于真实弹窗和浮层。
- **Action Glow** (`0 10px 25px rgba(18, 111, 232, .22)`): 仅用于当前主要操作。

**The Evidence Before Elevation Rule.** 能用边框、分隔线和色调说明关系时，不增加阴影。

## Shapes

控件使用 8–12px 的紧凑圆角；独立面板为 18px；浏览器演示窗口为 26px。圆角表达浏览器原生与轻量工具感，不使用胶囊作为默认容器，不给普通文本区增加卡片外壳。扩展图标保持正方形透明画布和约画布 9.4% 的真实圆角。

## Components

### Buttons

- **Shape:** 主要操作为 12px 圆角、至少 50px 高，并保证清晰的点击目标。
- **Primary:** Action Blue 背景、白色粗体文字；同一区域只设置一个主要操作。
- **Hover / Focus:** 悬停上移 2px 并加深背景；键盘焦点使用 3px 半透明蓝色外圈和 4px 偏移。
- **Secondary:** 使用正文色文字与底部细线，不与主要按钮争夺视觉权重。

### Cards / Containers

- **Corner Style:** 结果块 12px、浮层 18px、浏览器窗口 26px。
- **Background:** 普通内容保持无外壳；只有真实浏览器、弹窗和结果区使用白色或浅灰表面。
- **Shadow Strategy:** 只对真实叠放关系使用环境阴影。
- **Border:** 使用 Rule Blue 的 1px 细线界定结构。

### Inputs / Fields

- **Style:** 白色或极浅灰背景、1px 冷蓝灰描边、8–9px 圆角。
- **Focus:** 边框转为 Action Blue，并保留可见焦点环。
- **Error / Disabled:** 必须同时用文字说明，不只依靠颜色。

### Navigation

导航为 14px 半粗体中性色文字，悬停转为 Action Blue。移动端省略非关键导航，确保品牌与主要内容完整显示。

### Result Evidence

复制结果由状态行、标题来源、链接处理摘要和等宽输出组成。成功色只出现在状态行；结果正文保持高对比中性色，长标题和 URL 必须自然换行。

## Do's and Don'ts

### Do:

- **Do** 用真实扩展界面、真实权限和测试结果支持宣传主张。
- **Do** 保持自动复制为默认主路径，把规则和模板留在设置页。
- **Do** 在桌面和移动端都检查长标题、长 URL、本地化与键盘焦点。
- **Do** 使用一条清晰主叙事和一个主要操作维持首屏焦点。

### Don't:

- **Don't** 为了视觉丰富增加无证据的评分、用户数、奖项或性能比较。
- **Don't** 使用渐变文字、硬偏移阴影、装饰性图标字符或仿物材质。
- **Don't** 把每项能力包装成独立圆角卡片，或让胶囊标签成为主要布局语言。
- **Don't** 用常驻后台、外部服务或更大的权限范围换取低频功能。
