---
kind: dependency_management
name: 前端依赖本地化与 vendor 管理策略
category: dependency_management
scope:
    - '**'
source_files:
    - .agents/skills/vibepm-app-generator/SKILL.md
    - app/index.html
    - app/function-feedback.html
    - app/css/global.css
    - app/vendor/
---

本仓库采用**纯静态原型 + 第三方库本地化（vendor）策略**，不使用任何包管理器（无 package.json、go.mod、requirements.txt 等），所有外部依赖以文件形式直接拷贝到 `app/vendor/` 或 `.agents/skills/*/assets/vendor/` 目录中，通过 HTML `<link>` / `<script>` 相对路径引入，确保原型可离线预览且不依赖外网 CDN。

### 1. 使用的系统与工具
- **无包管理器**：仓库未使用 npm/yarn/pnpm、Go modules、pip、Maven、Gradle 等任何依赖声明与锁定机制。
- **手动 vendor 化**：第三方库（Vant 4、AntV F2、Font Awesome、Inter 字体等）由技能生成器在创建页面时从 `./assets/vendor/` 复制到 `/app/vendor/`，并改写引用路径为 `/app` 内相对路径。
- **模板驱动复制**：`.agents/skills/vibepm-app-generator/SKILL.md` 与 `vibepm-web-generator` 技能中明确定义了资源落盘规则，要求运行时资源必须随页面一起复制到 `/app` 对应子目录（`css/`、`js/`、`images/`、`fonts/`、`vendor/`）。

### 2. 关键文件与位置
- `.agents/skills/vibepm-app-generator/SKILL.md`：定义 APP 原型的默认技术栈、vendor 本地化策略、CSS/JS 引入顺序、禁止 CDN 的强制规则。
- `.agents/skills/vibepm-web-generator/`：WEB 端技能的 vendor 本地化约定（如 Element Plus、Vue UMD 包）。
- `app/vendor/`：运行时依赖目录（当前为空，需按页面实际依赖填充）。
- `app/css/global.css`：全局样式入口，统一引入 Inter 字体与 Vant/F2 变量覆盖。
- `app/index.html` 及各功能页：通过 `<link rel="stylesheet" href="./vendor/fontawesome/css/all.min.css" />` 等方式引用本地化依赖。

### 3. 架构与约定
- **资源闭环原则**：所有 `link/script/img/font/vendor` 引用必须使用相对于当前 html/css/js 文件的本地相对路径，且目标资源必须位于 `/app` 目录内；禁止保留指向 `./assets/...` 或其他 `/app` 外目录的运行时引用。
- **vendor 目录结构**：按第三方库名称分目录存放，如 `vendor/fontawesome/`、`vendor/vant/`、`vendor/f2/`，每个库包含其 CSS、JS、字体等资源。
- **引入顺序约束**：
  - 使用 Vant 4 时：先 `./vendor/vant/index.css`，再 `css/global.css`，最后 `css/xxx.css`（确保全局样式优先级高于 Vant 官方样式）。
  - F2 图表脚本建议在页面业务脚本之前加载一次即可。
- **禁止 CDN**：技能核心规则明确禁止使用 CDN 或外网依赖，所有第三方库必须本地化到 `/app/vendor/`。

### 4. 约定与约束
- **强制约束（来自 SKILL.md 核心规则）**：
  - 图标必须使用 Font Awesome 字体图标，且必须引用本地化资源（复制到 `/app/vendor/fontawesome/`），禁止 CDN。
  - Vant JS 必须优先使用本地化资源，禁止通过 CDN 引入。
  - 生成页面中的所有运行时引用必须使用 `/app` 内相对路径，禁止跨目录引用 `./assets`。
  - 模板配套 CSS（如 `ios-frame-*.css`、`wechat-frame-*.css`）不复制到 `/app`，相关样式必须已拆分并归并到 `css/xxx.css` 或 `css/global.css`。
- **推荐实践**：
  - 新增第三方库时，先在 `./assets/vendor/` 中准备源文件，再由技能生成器复制到 `/app/vendor/`。
  - 保持 `css/global.css` 作为全局变量与通用样式的单一来源，页面级覆盖放在 `css/xxx.css`。
  - 字体资源统一通过 `css/global.css` 内部 `@import url("../fonts/inter.css")` 引入，避免重复声明。
- **版本管理**：由于无锁文件机制，依赖版本由人工维护 vendor 目录中的具体文件版本，技能文档中指定了默认版本（如 Vant 4、Font Awesome v7、AntV F2 UMD）。

### 5. 适用性与限制
- 该策略适用于**静态原型快速交付**场景，强调离线可用与零构建依赖。
- 不适用于需要动态依赖更新、版本锁定、私有仓库或复杂构建流程的生产环境项目。
- 若后续迁移到工程化项目（Vue/React 构建），需将 vendor 目录内容迁移至构建工具的依赖管理（如 npm packages），并调整引入方式为模块导入。