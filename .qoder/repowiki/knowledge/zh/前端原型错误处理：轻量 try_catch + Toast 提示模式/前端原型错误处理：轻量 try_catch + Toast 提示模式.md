---
kind: error_handling
name: 前端原型错误处理：轻量 try/catch + Toast 提示模式
category: error_handling
scope:
    - '**'
source_files:
    - app/js/function-feedback.js
    - app/js/feedback-store.js
    - app/js/common-selector.js
    - .agents/skills/pm-operation-manual/scripts/screenshot.js
---

该仓库为纯前端静态原型（HTML/CSS/JS），未引入任何后端服务或框架，因此不存在统一的错误类型定义、中间件或全局异常捕获机制。错误处理以「局部 try/catch 兜底 + 用户态 Toast/alert 提示」的轻量模式实现，覆盖范围有限且风格不统一。

**1. 主要处理方式**
- **try/catch 包裹易错操作**：`feedback-store.js` 中的 `safeGetItem` / `safeSetItem` 对 `localStorage` 读写进行 try/catch 保护；`common-selector.js` 的 `restoreSiteContext` 在解析 `sessionStorage` 时同样使用 try/catch 并回退到空值；`function-feedback.js` 在读取站点上下文时也做了同样的保护。
- **Toast 提示为主，alert 降级**：`function-feedback.js` 定义了 `showToast(message)`，优先通过 `#appToast` 元素展示非阻塞提示；若 toast 元素不存在则降级为 `window.alert(message)`。这是唯一一处集中封装的用户提示逻辑。
- **表单输入校验即时反馈**：描述文本长度超限、图片数量/类型限制等通过 `showToast` 直接告知用户，而非抛出异常。

**2. 关键文件与位置**
- `app/js/function-feedback.js`：包含 `showToast` 定义及表单提交 try/catch 块（第 26-42 行、第 206-229 行）
- `app/js/feedback-store.js`：`safeGetItem` / `safeSetItem` 存储安全封装（第 213-228 行），以及 `ensureRecords` 的数据初始化保护（第 262-286 行）
- `app/js/common-selector.js`：`restoreSiteContext` 的 sessionStorage 解析保护（第 388-405 行）
- `.agents/skills/pm-operation-manual/scripts/screenshot.js`：脚本工具中大量使用 `console.error` 输出错误信息（如浏览器检测失败、配置缺失等）

**3. 架构与约定**
- **无全局错误处理器**：未发现 `window.onerror`、`unhandledrejection` 监听器或全局 catch 包装。
- **无统一错误码/错误对象**：错误信息以字符串形式直接传递给 `showToast` 或 `console.error`。
- **无 panic/recover 模式**：JavaScript 环境中未使用类似 Go 的错误恢复机制。
- **无中间件层**：作为静态原型，没有请求拦截、API 错误处理等中间件概念。

**4. 观察到的约束与不足**
- Toast 提示样式依赖 HTML 中必须存在 `#appToast` 元素，否则回退到 alert，这可能导致不同页面行为不一致。
- 错误处理分散在各功能模块中，缺乏统一的错误上报或日志记录机制。
- 仅覆盖了本地存储、用户输入等前端可预见的错误场景，未涉及网络请求错误（原型中无真实 API 调用）。
- 脚本工具（screenshot.js）使用 `console.error` 输出错误，但未被任何监控收集。

总体而言，该仓库的错误处理是原型阶段的临时方案，以最小成本保证基本可用性，尚未形成系统化的错误管理体系。