---
kind: frontend_style
name: 移动端原型前端样式体系（CSS + 多主题设计令牌）
category: frontend_style
scope:
    - '**'
source_files:
    - app/css/global.css
    - app/css/index.css
    - app/css/function-report.css
    - app/css/function-strategy.css
    - app/fonts/inter.css
    - .style/亮色现代极简-style.md
    - .style/暗黑荧光绿-style.md
    - .style/亮色科技蓝-style.md
---

## 1. 系统/方法概述
本项目采用「原生 HTML + CSS + JS」构建的移动端 H5 原型，通过全局 CSS 变量（CSS Custom Properties）集中管理设计令牌（颜色、字体、圆角、阴影等），并以 `app/css/global.css` 作为所有页面的基础样式入口。样式组织遵循「全局框架 → 页面级样式 → 组件级样式」的分层策略，同时通过 `.style` 目录维护多套视觉主题的规范文档与预览页，形成可切换的主题体系。

## 2. 核心文件与包
- **全局样式**：`app/css/global.css` — 定义 `:root` 中的 CSS 变量（`--brand`、`--font-family-base`、`--van-*` 等）、iOS 设备外壳（`.ios-frame-wrapper`、`.ios-screen`、状态栏、动态岛、底部 Tab 栏）、响应式适配（`@media (max-width: 768px)` 和 `prefers-color-scheme: dark`）
- **页面样式**：`app/css/index.css`（首页/能量全景看板，约 2886 行，含微电网能流可视化、图表图例、卡片网格等）、`app/css/function-report.css`（报告页）、`app/css/function-strategy.css`（策略页）等按功能模块拆分
- **字体资源**：`app/fonts/inter.css` + `app/fonts/inter-variable.woff2`，使用 Inter Variable 字体，支持 100–900 字重
- **主题规范**：`.style/` 目录下每套主题包含一对文件：`*-style.md`（设计令牌与风格原则）+ `*-preview.html`（视觉预览），当前包含 10 套主题（亮色现代极简、亮色科技蓝、暗黑荧光绿、暗色低饱和黑灰、暗粉霓虹潮等）
- **图标与图像**：`app/images/` 存放 SVG 图标（mini-capsule、status-bar）与背景图（report-hero.jpg）

## 3. 架构与约定
- **设计令牌驱动**：所有颜色、字号、圆角、阴影均通过 CSS 变量在 `:root` 中声明，页面样式直接引用变量而非硬编码值，确保主题一致性
- **Vant 组件主题覆盖**：通过 `--van-*` 变量覆盖 Vant 移动端组件库默认样式（如 `--van-primary-color`、`--van-button-primary-background`、`--van-font-size-md` 等），实现品牌化定制
- **iOS 设备仿真框架**：全局提供 `.ios-frame-wrapper` 模拟 iPhone 外壳（圆角边框、阴影、状态栏、动态岛、Home Indicator），在桌面端展示时增强真实感；移动端则自动移除外壳（`@media (max-width: 768px)`）
- **深色模式支持**：通过 `@media (prefers-color-scheme: dark)` 自动切换状态栏图片、背景色、胶囊容器等，无需 JS 干预
- **模块化 CSS 组织**：每个功能页面独立 CSS 文件，命名遵循 `function-{page}.css`，避免样式冲突，便于按需加载
- **渐变与玻璃态**：大量使用 `backdrop-filter: blur()` 与半透明背景营造现代感，配合径向/线性渐变创建层次丰富的背景
- **动画与交互**：统一的 `transition` 时长（0.16s–0.38s cubic-bezier）与缩放反馈（`:active { transform: scale(0.99) }`），保持交互一致性

## 4. 约定与约束
- **色彩体系**：主品牌色 `#4C75F2`（蓝色系），语义色包括成功（`#10B981`）、警告（`#F5A623`）、错误（`#dc2626`），中性灰阶从 `#f4f4f5` 到 `#18181b` 分层
- **字体规范**：主字体为 Inter，回退栈包含 PingFang SC、Microsoft YaHei、Noto Serif SC，正文 14px/1.4 行高，标题使用 700–900 字重
- **圆角尺度**：统一使用大圆角（卡片 20–24px、按钮 18–20px、胶囊 9999px），传递友好、现代的 App 气质
- **间距系统**：遵循 8px 基线（8/12/16/20/24），区块内使用 `gap` 或 `margin` 保持一致节奏
- **阴影层级**：内容卡使用极轻投影（`rgba(76,117,242,0.08)` 级别），主 CTA/FAB 使用带品牌色的彩色投影，避免过度阴影
- **响应式断点**：以 768px 为分界，桌面端显示 iOS 设备外壳，移动端全屏适配并隐藏状态栏/动态岛/Home Indicator
- **主题切换机制**：通过 `.style` 目录下的多套主题文档定义不同配色方案，实际运行时可通过替换 CSS 变量实现主题切换（当前以静态预览为主）
- **无障碍要求**：部分主题文档明确指出需补充 `focus-visible` 焦点环样式，确保键盘导航可用性
- **性能约束**：字体使用 `font-display: swap` 避免阻塞渲染，滚动区域隐藏默认滚动条（`scrollbar-width: none`）提升视觉整洁度