# Where Is My Mind

> 像素风桌面小程序 — 记事本、音乐播放器、桌面宠物。

![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Tauri](https://img.shields.io/badge/Tauri-2.x-orange)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 功能概览

| 模块 | 功能 |
|------|------|
| 记事本 | 多标签、打开/保存文件、Ctrl+S、Ctrl+滚轮缩放字号、自动保存 |
| 音乐播放器 | 本地音乐库、完整播放控制、伪频谱可视化、Mini 模式 |
| 桌面宠物 | 像素猫咪、拖拽、随机游荡、互动对话、双击入睡 |

- 无边框透明窗口，始终置顶
- 四种像素主题（绿 / 琥珀 / 白 / 浅色）
- 轻量级，约 15MB 绿色单文件，无需安装

---

## 截图

> *(待补充)*

---

## 技术栈

- **[Tauri 2](https://tauri.app/)** — 桌面应用框架
- **React 18 + TypeScript** — 前端
- **Vite 5** — 构建工具
- **Zustand** — 状态管理
- **Howler.js** — 音频播放
- **CSS Modules** — 样式隔离

---

## 开发环境要求

- **Node.js** v18+
- **Rust** 工具链
  - Windows：下载安装 [rustup-init.exe](https://rustup.rs/)
  - macOS / Linux：`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

---

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run tauri dev

# Windows PowerShell 若提示找不到 cargo，先执行：
# $env:PATH += ";$env:USERPROFILE\.cargo\bin"

# 3. 构建生产版本
npm run tauri build
```

构建产物位于 `src-tauri/target/release/where-is-my-mind.exe`，直接分发即可。

---

## 项目结构

```
where-is-my-mind/
├── src/
│   ├── components/          # 公共 UI 组件（TitleBar、SettingsPanel）
│   ├── modules/
│   │   ├── notepad/         # 记事本模块
│   │   ├── player/          # 音乐播放器模块
│   │   └── pet/             # 桌面宠物模块
│   ├── store/               # Zustand 全局状态
│   ├── styles/              # 设计 tokens 和全局样式
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/
│   ├── src/main.rs          # Tauri 入口
│   ├── icons/               # 应用图标
│   ├── capabilities/        # Tauri 权限配置
│   └── tauri.conf.json
├── public/
│   └── fonts/               # Fusion Pixel 字体
└── icon-designs/            # 图标设计稿（SVG）
```

---

## 使用说明

### 窗口控制

| 操作 | 方式 |
|------|------|
| 移动窗口 | 拖拽标题栏 |
| 切换桌面宠物 | 标题栏 `CAT` 按钮 |
| 进入 Mini 播放器 | 标题栏 `▼` 按钮 |
| 最小化 | 标题栏 `_` 按钮 |
| 关闭 | 标题栏 `X` 按钮 |

### 记事本

- 多标签：`+` 新建，`x` 关闭
- `Ctrl+S` 保存，`Ctrl+滚轮` 缩放字号（8px–32px）
- 支持打开 `.txt` / `.md` 文件

### 音乐播放器

- 支持格式：MP3、FLAC、OGG、WAV、M4A、AAC、WMA
- 随机播放 / 单曲循环 / 列表循环
- `▼` 按钮切换 Mini 模式（320×145）

### 桌面宠物

- 单击：随机对话气泡
- 双击：入睡并淡出隐藏
- 拖拽：自由移动
- 在记事本打字时自动移动到状态栏上方

---

## 主题

在设置面板（`⚙` 按钮）中切换：

| 主题 | 主色 |
|------|------|
| Green | `#00ff41` 经典终端绿 |
| Amber | `#ffb000` 复古琥珀黄 |
| White | `#e0e0e0` 简约白 |
| Light | `#1a1a1a` 浅色模式 |

---

## License

[MIT](./LICENSE)
