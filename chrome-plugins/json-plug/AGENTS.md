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
└── index.js       # 页面交互逻辑（JSON 解析、格式化）
```

## 使用方式

1. Chrome 地址栏输入 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目目录
5. 点击插件图标 → 在新标签页中打开格式化工具

## 功能增强计划

### 功能增强
- [x] JSON 语法高亮（highlight.js）
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

## 当前进度

- [x] JSON 语法高亮（highlight.js）
- [x] 折叠/展开 JSON 节点
