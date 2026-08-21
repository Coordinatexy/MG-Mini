---
kind: logging_system
name: 日志系统 — 无结构化日志框架，仅使用 console 调试输出
category: logging_system
scope:
    - '**'
source_files:
    - .agents/skills/pm-operation-manual/scripts/screenshot.js
---

经对仓库中所有 JS 文件（app/js/ 下的前端原型脚本、.agents/skills 下的辅助脚本）进行检索，未发现任何专门的日志框架或集中式日志模块。代码中的“日志”行为完全依赖浏览器原生 `console.log` / `console.error` 等 API，且仅出现在 `.agents/skills/pm-operation-manual/scripts/screenshot.js` 这一截图辅助脚本中，用于命令行工具的错误提示与进度输出。`app/js/` 下的业务原型脚本（index.js、common-selector.js、feedback-store.js 等）未包含任何 `console.*` 调用，也没有统一的 logger 初始化、日志级别管理、结构化字段定义或日志路由机制。

因此，该仓库不存在成体系的日志系统：没有日志框架、没有日志配置、没有统一封装，也没有跨模块的日志约定。前端原型页面通过 DOM 事件和自定义事件（如 `mg-mini:message-site-change`）进行交互，而非通过日志输出传递信息。