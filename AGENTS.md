# WEB / APP 原型工作指南

本资源包为 AI 编程代理提供标准化的 **WEB 端** 与 **APP 端** 静态原型交付工作流。主 Agent 的职责是识别任务、匹配触发词并调用对应技能——而非跳过流程直接生成页面或撰写文档。技能名称与子目录一致，入口为 `.agents/skills/{name}/SKILL.md`；其中 `prd-writer` 负责将产品方向写成或迭代 **PRD**（产出 `docs/`），`prototype-list` 负责在选用 generator 前整理 **功能清单 + 完整页面结构**（产出 `doc/`）。完整链路覆盖「PRD → 信息结构 → WEB/APP 原型 → 测试/手册」，技能配置位于 `.agents/skills/` 目录。

## 预置视觉规范（.style）

`.style/` 目录预置多套 **可直接调用的视觉规范**（`*-style.md`：色板、字体、圆角、层次、组件气质与克制原则等），并配有浏览器预览（`*-preview.html`，便于选型对照）。

在使用 `vibepm-web-generator`（WEB 端）或 `vibepm-app-generator`（移动端壳内原型）产出页面时：

1. **用户已指定风格** → 先读取对应的 `*-style.md`，再在 `web/` 或 `app/` 中通过 `global.css` / 页面级 CSS 变量与样式规则 **落实该文档中的 tokens 与约束**，避免「规范写一套、实现写另一套」。
2. **用户未指定** → **先询问是否需要由助手根据场景推荐**；若用户需要，再根据场景从下表推荐一套，或列出选项请用户确认后再生成。
3. **需对齐某外部站点** → 使用 `vibepm-style-extractor` 从 URL/截图等提取；预置 `.style` 与提取结果可并存，提取产物也可后续沉淀为新的 `*-style.md`。

| 视觉规范（主文件） | 预览 |
| --- | --- |
| `.style/亮色科技蓝-style.md` | `.style/亮色科技蓝-preview.html` |
| `.style/亮色现代极简-style.md` | `.style/亮色现代极简-preview.html` |
| `.style/亮色电光蓝-style.md` | `.style/亮色电光蓝-preview.html` |
| `.style/暗色低饱和黑灰-style.md` | `.style/暗色低饱和黑灰-preview.html` |
| `.style/暗色紫色科技感-style.md` | `.style/暗色紫色科技感-preview.html` |
| `.style/暗粉霓虹潮-style.md` | `.style/暗粉霓虹潮-preview.html` |
| `.style/暗黑亮青发光-style.md` | `.style/暗黑亮青发光-preview.html` |
| `.style/暗黑荧光绿-style.md` | `.style/暗黑荧光绿-preview.html` |

## 技能与触发关键词

**规则：用户消息中任一触发词命中，即视为必须走对应技能（见下节「执行规则」）。**

> **端别判断**：原「创建页面 / 实现功能 / 开发模块」类需求，默认需区分交付物——**WEB 静态页** 用 `vibepm-web-generator`（产出在 `web/`），**带手机或小程序外框的 APP 原型** 用 `vibepm-app-generator`（产出在 `app/`）。用户未说明且语境不明时，**先询问再选技能**。

| 技能 | 触发关键词（任一匹配即触发） | 说明 |
| --- | --- | --- |
| `prd-writer` | 需求文档、PRD、产品需求、功能文档、写需求、整理需求、补充需求、审查需求、改进需求文档、从零写 PRD、我想做个产品、我想做个功能、我想做个 App、做个工具、AI 写的需求有没有问题 | 读取 `.agents/skills/prd-writer/SKILL.md` → 第零步判断是否适合本技能；**三视角诊断** 与 **模式 A/B/C**（从零两版交付、评估改进、增量融合）；产出 Markdown 存 **`docs/`**；**不写实现级代码细节**，与 generator 分工 |
| `prototype-list` | 功能清单、页面结构、信息结构、原型范围、MVP、分期、整理需求稿、站点地图、IA、基于 PRD 整理、feature checklist | 读取 `.agents/skills/prototype-list/SKILL.md` → 将想法或需求稿提炼为 **功能 + 信息结构**，Markdown 存 **`doc/`**；**第 2 章** 须为 **完整页面结构列表**（按屏分段、每屏五项要点；**禁止**用宽表罗列入口/结构/功能/备注/文件名）；默认简短访谈，弱化技术实现 |
| `vibepm-web-generator` | 创建页面、生成页面、添加页面、新建页面、实现WEB页面、开发WEB模块、企业官网、落地页、营销页、多页静态站、用WEB技能、/vibepm-web-generator | 读取该技能 → 按 `web/` 目录与 HTML/CSS/JS 分离、资源本地化等规范交付 |
| `vibepm-app-generator` | APP原型、手机页面、小程序原型、iOS壳、微信壳、设备框、带壳页面、移动端原型、用APP技能、/vibepm-app-generator | 读取该技能 → 选模板 → 内容落在 `app-shell`；运行时资源闭环在 `app/` |
| `vibepm-style-extractor` | 模仿网站风格、参考站、提取风格、设计tokens、风格逆向、样式提取、从URL/截图提取、/vibepm-style-extractor | 输出 tokens 与可复用提示词，供后续 `vibepm-web-generator` / `vibepm-app-generator` 对齐视觉 |
| `diagram-generator` | 流程图、架构图、时序图、泳道图、ER图、UML、组织架构图、BPMN、生成图表、画流程图、插入流程图 | 读取该技能 → Task `generalPurpose` + Read `diagram-drawer.md` 生成 XML → `render-diagram.ps1` / `.sh` / `.py` 渲染 PNG；源文件存 `docs/images/src/` |
| `pm-test-cases` | 生成测试用例、写测试用例、QA测试、测试文档、验收标准、测试计划、测试用例导出Word | 基于 `docs/` PRD 与 `doc/` 功能结构生成测试用例；产出 Markdown 存 **`docs/`**；可选 Word 导出 |
| `pm-operation-manual` | 操作手册、用户手册、使用说明、功能说明文档、快速入门、用户指南、操作手册导出Word | 基于 PRD 与 `web/`/`app/` 原型页面生成操作手册；产出 Markdown 存 **`docs/`**；可选 Word 导出 |
| `slides` | 演示文稿、PPT、幻灯片、汇报材料、路演、HTML演示 | 读取该技能 → 生成战略性 HTML 演示文稿，支持 Chart.js 数据可视化 |
| `skill-creator` | 创建技能、新建技能、更新技能、写技能、技能模板、扩展技能 | 技能编写指南；在 `.agents/skills/` 下创建或更新技能目录与 `SKILL.md` |

### 产品规划

| 技能 | 触发关键词（任一匹配即触发） | 说明 |
| --- | --- | --- |
| `pm-market-research` | 市场调研、竞品分析、分析市场、竞争对手分析、TAM、SAM、SOM | 市场规模与竞品对比；产出存 **`docs/`** |
| `pm-user-persona` | 用户画像、定义目标用户、用户分析、用户分层、Persona | 创建用户画像与用户旅程；产出存 **`docs/`** |
| `pm-user-interview` | 用户访谈、访谈提纲、用户调研、需求挖掘、分析访谈 | 设计访谈提纲或分析访谈记录；产出存 **`docs/`** |
| `pm-feature-prioritization` | 功能排优先级、需求排期、哪些功能先做、功能评估、RICE、MoSCoW | 多框架功能优先级排序；产出存 **`docs/`** |
| `pm-roadmap` | 路线图、产品规划、版本计划、roadmap、里程碑 | 季度/年度路线图；产出存 **`docs/`** |
| `pm-okr-designer` | 制定OKR、设计KPI、指标拆解、目标管理 | OKR/KPI 体系设计；产出存 **`docs/`** |
| `pm-product-metrics` | 数据分析、埋点设计、指标体系、数据看板、漏斗分析、留存分析 | 埋点方案与数据分析；产出存 **`docs/`** |
| `pm-sprint-planning` | 迭代规划、sprint计划、需求拆解、任务分解、迭代复盘 | 敏捷迭代规划与复盘；产出存 **`docs/`** |
| `pm-stakeholder-report` | 做汇报、写汇报材料、产品复盘、产品Review、向老板汇报 | 面向管理层/团队的汇报材料；产出存 **`docs/`** |
| `pm-release-notes` | 发版说明、更新日志、版本更新、changelog、上线公告 | 面向用户或团队的发版说明；产出存 **`docs/`** |
| `pm-product-pipeline` | 走完整流程、一键生成所有文档、完整产品交付、从0到1 | 编排「调研 → 画像 → 优先级 → 路线图 → PRD → 原型 → 测试 → 手册 → 发版」全流程 |

**本仓库 `.agents/skills` 中未包含的技能**（下表勿当作本包内置能力；若需可自行扩展目录）：`page-generator`、`annotation`。其中「做页面 / 做功能」由上表 `vibepm-web-generator` / `vibepm-app-generator` 覆盖；**产品需求结构化与 PRD** 由 `prd-writer`（及可选 `prototype-list`）覆盖。

## 执行规则

**检查清单（每次收到用户请求时建议执行）：**

1. **触发检测**：扫描用户消息是否命中上表「触发关键词」列（含同义口语变体）。
2. **强制调用**：若命中，须先通过 `Skill`** 工具** 加载对应技能名称（与上表第一列一致），**不得**在未加载技能的情况下直接大段写代码、生成文档或改文件。
3. **禁止跳步**：不允许跳过技能直接实现、直接杜撰需求结构或自行「简化」技能规定的输出格式。
4. **工作流遵守**：加载技能后，须阅读并执行该目录下的 `SKILL.md`（如 `prd-writer`、`prototype-list`），严格按文档内步骤与门禁（如 `prd-writer` 的第零步、三视角诊断与分阶段交付）执行。
5. **完整性检查**：不省略步骤、不擅自合并技能规定的多阶段输出；若技能要求任务清单，须按清单逐项更新状态。

**示例判断：**

✅ 正确：
```
用户："做一个 SaaS 落地页，要有价格和 FAQ"
→ 命中「落地页」等 → Skill: vibepm-web-generator
→ 阅读 .agents/skills/vibepm-web-generator/SKILL.md → 按 web/ 与 html/css/js 分离规范交付
```

✅ 正确：
```
用户："帮我从零写一份健身 App 的 PRD，想法是记录训练与饮食"
→ 命中「PRD」「App」→ Skill: prd-writer
→ 阅读 .agents/skills/prd-writer/SKILL.md → 第零步与三视角诊断 → 按模式 A 分两版写入 docs/*.md；不写实现代码
```

✅ 正确：
```
用户："把这个 PRD 整理成功能清单和全站页面结构，再定 MVP"
→ 命中「功能清单」「页面结构」「MVP」→ Skill: prototype-list
→ 阅读 .agents/skills/prototype-list/SKILL.md → 写入 doc/*.md；第 2 章为完整页面结构列表（按屏 + 五项要点），再接 generator 落原型
```

✅ 正确：
```
用户："根据这份 PRD 生成测试用例"
→ 命中「测试用例」→ Skill: pm-test-cases
→ 阅读 .agents/skills/pm-test-cases/SKILL.md → 扫描 docs/ 与 doc/ → 按任务清单逐项写入 docs/*-测试用例-*.md
```

✅ 正确：
```
用户："给 PRD 里的用户注册流程画一张流程图"
→ 命中「流程图」→ Skill: diagram-generator
→ 阅读 .agents/skills/diagram-generator/SKILL.md → diagram-drawer 生成 XML → render-diagram 脚本渲染 PNG 并插入文档
```

❌ 错误：
```
用户："实现用户管理 WEB 页面"
→ 未选技能直接改 web/*.html ← 错误！应先 Skill: vibepm-web-generator（需求边界不清时可先简短澄清或接 prd-writer / prototype-list）
```

❌ 错误：
```
用户："帮我写 PRD"
→ 跳过第零步与三视角诊断，直接输出一版长文档 ← 错误！应先 Skill: prd-writer，并执行 .agents/skills/prd-writer/SKILL.md 中的阶段与门禁
```

## 推荐工作流

### 单技能路径

1. **有基本产品/功能方向，要写或迭代 PRD** → `prd-writer`（产出 `docs/YYYY-MM-DD-<主题>PRD.md` 等；无方向时技能内第零步会引导用户先想清楚再进入）
2. **要先对齐功能与页面/屏结构、分期与 MVP 边界**（再画原型或对照 PRD）→ `prototype-list`（产出 `doc/YYYY-MM-DD-<主题>.md`；可与 `prd-writer` 前后衔接）
3. **PRD 中需要流程图/架构图** → `diagram-generator`（可在写 PRD 过程中插入，或 PRD 完成后补图）
4. **WEB 静态原型** → 选定 `.style`** 中某 **`*-style.md`（或 `vibepm-style-extractor`）→ `vibepm-web-generator`
5. **APP 壳内原型** → 同上选定视觉规范 → `vibepm-app-generator`
6. **原型完成后写测试用例或操作手册** → `pm-test-cases` / `pm-operation-manual`（依赖 `docs/`、`doc/` 与 `web/`/`app/` 页面）
7. **对外汇报或路演** → `slides` 或 `pm-stakeholder-report`

### 产品规划路径（方案 B）

1. **只有想法，要先验证市场** → `pm-market-research` → `pm-user-persona` → `pm-feature-prioritization` → `pm-roadmap`
2. **定目标与度量** → `pm-okr-designer` / `pm-product-metrics`
3. **研发排期与复盘** → `pm-sprint-planning`
4. **版本上线对外说明** → `pm-release-notes`
5. **一次性走完从 0 到 1** → `pm-product-pipeline`（内部串联上述技能与 `prd-writer`、`prototype-list`、generator 等）

✅ 正确：
```
用户："帮我做竞品分析，再排一下功能优先级"
→ 命中「竞品分析」→ Skill: pm-market-research → 产出 docs/market-research.md
→ 再命中「功能优先级」→ Skill: pm-feature-prioritization
```

✅ 正确：
```
用户："我想从想法到原型一次性走完"
→ 命中「完整产品交付」→ Skill: pm-product-pipeline
→ 按流水线阶段依次调用 pm-market-research、prd-writer、vibepm-web-generator 等
```

## 扩展技能依赖说明

方案 A/B 同步的技能除目录本身外，还包含以下支撑资源（位于 `.agents/`）：

| 路径 | 用途 |
| --- | --- |
| `.agents/skills/common/export-word.ps1` / `.py` / `.sh` | `pm-test-cases`、`pm-operation-manual` 等的 Word 导出 |
| `.agents/skills/config.json` | 导出与图表渲染 API 配置 |
| `.agents/agents/diagram-drawer.md` | `diagram-generator` 的子 Agent 定义 |
| `.agents/knowledge/diagram/` | `diagram-generator` 绘图规范 |
| `.agents/skills/vibepm-web-generator/assets/` | WEB 原型本地化 vendor（Font Awesome webfonts、Inter 字体等） |
| `.agents/skills/vibepm-app-generator/assets/` | APP 原型本地化 vendor（同上，含 Vant/F2 壳模板） |

## 通用原则

### 克制

只做被明确要求的事；未提到的样式、动效、额外组件不要自行追加。若认为有必要扩展，先征得同意再动手。

### 注释与可维护性

以当前所用技能中的约定为准（例如 `web/`、`app/` 下的文件组织、样式作用域、禁止 CDN 等）。在技能未单独规定处：对非显而易见的逻辑保留简短注释，便于后续把原型迁入工程化项目时对照。
