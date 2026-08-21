---
kind: external_dependency
name: ECharts 图表库
slug: echarts
category: external_dependency
category_hints:
    - vendor_identity
scope:
    - '**'
source_files:
    - app/js/panorama-monitor-chart.js
---

本项目在 APP 原型中使用 ECharts 作为时序/监控图表渲染引擎，通过 app/js/panorama-monitor-chart.js 初始化并管理图表实例；资源以 vendor 本地化方式随 app-shell 分发。图表实例采用懒加载并在 Tab 切换时按需销毁，避免内存泄漏。