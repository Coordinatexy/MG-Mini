# drawio-generator

一个用于生成 draw.io 原生 `.drawio` XML 的 AI Skill。它适合流程图、业务架构图、状态机、泳道图、数据库关系图等需要稳定结构和可编辑源文件的场景。

## 特点

- 直接输出标准 `<mxfile>...</mxfile>`，可复制到 draw.io / diagrams.net 导入。
- 强制使用绝对坐标、节点间距和正交连线，降低元素重叠、连线穿模、布局错乱。
- 内置 B 端图表配色和常用节点样式。
- 不内置任何 API Key、Token、私有服务地址或本地工作区路径。

## 文件说明

- `SKILL.md`：Skill 主体规则，可直接放入支持 Skill 的 Agent 环境。
- `.gitignore`：默认忽略 `.env`、密钥文件、生成产物和本地依赖。
- `LICENSE`：MIT License。

本仓库不发布本地 `output/` 示例产物，也不包含任何私有生图脚本。需要将 `.drawio` 转成 PNG/SVG 时，请使用 draw.io / diagrams.net 的导出功能，或自行接入公开可用的渲染工具。

## 使用方式

1. 将 `SKILL.md` 安装到你的 Agent / Codex / Claude Code 技能目录。
2. 触发 Skill 后，向 Agent 输入要可视化的业务流程、系统架构或状态流转。
3. Agent 应只返回完整 XML 代码块。
4. 在 draw.io / diagrams.net 中选择导入 XML，继续编辑或导出图片。

## 示例请求

```text
请生成一个用户注册流程 draw.io 图：
访问注册页 -> 输入手机号 -> 判断验证码是否正确 -> 创建账号 -> 写入用户表 -> 返回注册成功。
```

期望输出是完整的：

```xml
<mxfile>
  ...
</mxfile>
```

## 安全说明

- 不要把 API Key、Token、密码、Cookie、私钥写进 `SKILL.md`、输出 XML、日志或提交记录。
- 如果你在本地接入额外脚本，请用环境变量读取凭据，并确保 `.env` 不进入 Git。
- 公开发布前建议运行一次敏感信息扫描。
