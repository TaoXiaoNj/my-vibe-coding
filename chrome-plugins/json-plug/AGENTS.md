# JSON 格式化工具插件

## 项目背景

这是一个 Chrome 浏览器插件，用于格式化 JSON 字符串。用户安装后在插件弹窗中输入 JSON，即可看到格式化后的结果。

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
├── manifest.json  # Chrome 插件配置
├── popup.html     # 插件弹窗界面
└── popup.js       # 交互逻辑
```

## 使用方式

1. Chrome 地址栏输入 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目目录
5. 点击插件图标即可使用
