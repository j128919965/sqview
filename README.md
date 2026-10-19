# SQView - 图集加密查看工具

一款基于 Electron + React + TypeScript 开发的图集加密、查看工具。

## 主要功能

- 图集加密：将图片集合加密打包成专有格式文件
- 图集查看：支持查看加密后的图集文件
- 进度显示：实时展示图片加载进度
- 跨平台支持：支持 Windows、macOS 和 Linux 系统
- 图集管理：支持按作者分组、隐藏/显示过滤等功能
- 图片导入：支持从本地目录或压缩包导入图片
- 图片预览：支持缩略图预览和详细查看
- 快捷操作：支持键盘快捷键和鼠标操作
- 自定义配置：支持自定义查看器配置

## 技术栈

- Electron
- React 
- TypeScript
- Material UI
- Webpack

## 功能说明

### 图集查看
- 支持按作者分组显示
- 支持隐藏/显示过滤
- 支持缩略图预览
- 支持键盘方向键翻页
- 支持鼠标滚轮翻页
- 支持页码/缩略图导航

### 图片导入
- 支持从本地目录导入
- 支持从压缩包导入
- 支持批量导入
- 实时显示导入进度
- 自动生成缩略图

### 图集管理
- 支持修改图集名称
- 支持设置作者信息
- 支持隐藏/显示图集
- 支持删除图集

## 开发

1. 克隆项目
```bash
git clone https://github.com/j128919965/sqview.git
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

4. 打包应用
```bash
npm run package
```

## 系统要求

- Windows 7 及以上
- macOS 10.13 及以上 
- Linux (Ubuntu, Debian, Fedora)

## 许可证

MIT License
