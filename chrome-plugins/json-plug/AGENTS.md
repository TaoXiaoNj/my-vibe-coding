# JSON 格式化工具插件

## 项目背景

这是一个 Chrome 浏览器插件，用于格式化 JSON 字符串。用户点击插件图标后，在新标签页中打开格式化工具，输入 JSON 即可看到格式化后的结果。

## 技术栈

- Chrome Extension (Manifest V3)
- 纯前端实现：HTML + CSS + JavaScript

## 功能

- 输入 JSON 字符串并解析
- 格式化输出（2 空格缩进）
- 错误提示
- 清空重置

## 文件结构

```
├── manifest.json  # Chrome 插件配置（Manifest V3）
├── background.js  # Service Worker，处理插件图标点击事件
├── index.html     # 插件主页面（点击图标后打开的标签页）
├── index.js       # 页面交互逻辑（JSON 解析、格式化）
└── docs/
    └── DESIGN.md  # 页面布局与设计说明（供 AI 编码工具阅读）
```

## 使用方式

1. Chrome 地址栏输入 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目目录
5. 点击插件图标 → 在新标签页中打开格式化工具

## 功能增强计划

### 功能增强
- [x] JSON 语法高亮（自定义 CSS 类）
- [x] 折叠/展开 JSON 节点
- [ ] 复制格式化结果按钮
- [ ] 一键压缩 JSON（去掉缩进）

### 用户体验
- [ ] 键盘快捷键（Ctrl+Enter 格式化、Ctrl+L 清空）
- [ ] 错误时精准定位到错误位置

### 界面优化
- [ ] 输入/输出区域添加标题标签（"输入" / "输出"）
- [ ] 支持拖拽调整左右栏宽度
- [ ] 暗色/亮色主题切换
- [ ] 格式化耗时统计

### 高级功能
- [ ] JSON 路径查询（类 jq）
- [ ] JSON 验证（检查是否符合 schema）
- [ ] 多格式互转（JSON ↔ YAML、JSON ↔ XML）
- [ ] 大文件处理（分片渲染）

## 测试与调试经验

### 截图不可靠
多模态 LLM 看代码渲染图不准确，可能遗漏细节或"脑补"内容。
**做法**：用 `page.evaluate()` 直接检查 DOM 结构，验证 span class（jkey、jstr、jnum 等）是否存在。

### 视觉渲染 vs 复制结果是两码事
- 视觉：`innerHTML`（由 `buildLines()` 生成）
- 剪贴板：`_formattedJson`（来自 `JSON.stringify`）
之前 `buildLines()` 的 bug 只影响视觉，不影响剪贴板。
**做法**：验证时两都要单独检查。

### Playwright 子进程需要沙盒跳过
子进程运行在隔离环境，没有沙盒绕过权限。Chromium headless shell 会报 `bootstrap_check_in Mach port permission denied`。
**做法**：在 Bash 命令中加入 `dangerouslyDisableSandbox: true`。

### 剪贴板 API 权限问题
`navigator.clipboard.readText()` 会报 "Read permission denied"。
**做法**：通过 `page.evaluate()` 直接访问 `_formattedJson` 变量。

### Bug 模式：buildLines() 忽略 keyName
`buildLines(value, indent, isRoot, parentId, keyName)` 接收了 `keyName`，但对 null、boolean、number、string 这些基础类型直接忽略了。
**做法**：处理基础类型时，要在值前面加上 keyHtml。

## 当前进度

- [x] JSON 语法高亮（自定义 CSS 类）
- [x] 折叠/展开 JSON 节点
