# 🚀 多标签网页自动截图归档工具 (Tab Snap Archiver)
> **基于 Chrome Extension Manifest V3 的多标签页自动遍历与分类截图归档引擎**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Platform](https://img.shields.io/badge/Platform-Chrome_Browser-lightgrey.svg)](https://www.google.com/chrome/)

---

## 📖 项目简介

**多标签网页自动截图归档工具 (Tab Snap Archiver)** 是一款专为网页数据留档和日常办公提效设计的谷歌浏览器开源插件（基于最新的 **Chrome Extension Manifest V3** 标准）。

在处理包含大量子选项卡（Tab）的复杂业务系统网页时，传统的人工依次点击、手动截图、重命名并保存分类极其耗时。本插件利用浏览器底层 API，能**自动顺序遍历页面上的指定 DOM 选项卡，在视图渲染完成后进行网页捕获，并根据预设规则，自动在系统本地建立层级归档文件夹进行重命名保存**。

### ✨ 核心特性

- **⚡ 自动标签页遍历**：自动向当前活动网页注入脚本，提取所有子单号 Tab 元素，并进行顺序模拟点击切换。
- **📸 视图无损捕获**：依靠 `chrome.tabs.captureVisibleTab` API，在页面加载完成后，捕获无边框的纯净网页业务数据截图。
- **📂 动态多级文件夹分流**：利用 Chrome 下载管道路径处理，支持在文件名中包含 `/`。无需任何后台服务器，即可直接在系统“下载(Downloads)”目录中自动建立多级分类文件夹结构。
- **🎨 极简操作界面**：扁平化前台控制面板，操作直观，支持一键自适应运行、批量导出与实时状态看板。
- **🔒 100% 纯本地运行**：不向任何外网服务器传输数据，不记录任何网页隐私，所有数据直接安全地保存在用户本地。

---

## 🛠️ 项目目录结构

```text
📂 Tab-Snap-Archiver/
├── 📄 manifest.json          # 插件配置文件及权限声明 (MV3)
├── 📄 popup.html             # 插件控制台弹窗交互界面
└── 📄 popup.js               # 核心事件控制、DOM 遍历、视图捕获与下载流控制脚本
