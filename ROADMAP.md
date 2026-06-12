# PixelNook - 像素风格桌面挂机小程序

一款轻量级桌面常驻应用，提供记事本和音乐播放功能，采用复古像素风格设计。

---

## 技术栈

### 桌面框架
- **Tauri 2** - 轻量级桌面应用框架
  - 安装包体积 ~5MB（对比 Electron 150MB+）
  - 内存占用低，适合常驻后台
  - Rust 后端提供原生系统调用性能
  - 原生支持无边框窗口、透明度、始终置顶

### 前端技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5 | 构建工具 |
| CSS Modules | - | 样式隔离 |
| Zustand | 4.x | 轻量状态管理 |
| Howler.js | 2.x | 音频播放 |

### 设计资源
- **像素字体**: Press Start 2P / Pixel Code（Google Fonts）
- **调色板**: 经典绿色（#00FF41）/ 琥珀色（#FFB000）/ 白色主题
- **UI 风格**: 8-bit 描边、像素滚动条、扫描线效果

---

## 开发路线

### Phase 1 - 项目骨架（1-2天）
**目标**: 搭建可运行的像素风格窗口

- [x] 初始化 Tauri + React + Vite + TypeScript 项目
- [ ] 配置窗口特性
  - 无边框窗口
  - 始终置顶
  - 半透明背景
  - 自定义标题栏（可拖拽）
- [ ] 搭建像素设计系统
  - CSS 变量定义调色板
  - 引入像素字体
  - 基础像素 UI 组件（Button、Input、Scrollbar）
  - 像素边框样式（box-shadow 模拟）
- [ ] 窗口交互
  - 拖拽移动窗口
  - 右键菜单（最小化/关闭）

**验收标准**: 可显示无边框像素风格窗口，能拖拽移动

---

### Phase 2 - 记事本模块（2-3天）
**目标**: 实现多标签记事本功能

- [ ] 多标签管理
  - 新建/删除/重命名标签
  - 标签切换
- [ ] 编辑器功能
  - 纯文本编辑
  - 自动保存（防抖 500ms）
  - 本地文件持久化
- [ ] 像素风格优化
  - 像素滚动条
  - 光标闪烁动画
  - 文字输入特效

**验收标准**: 可创建多个记事本标签，内容自动保存到本地

---

### Phase 3 - 音乐播放器模块（3-4天）
**目标**: 实现本地音乐播放功能

- [ ] 音乐库管理
  - 导入本地文件夹
  - 自动扫描 mp3/flac/ogg
  - 播放列表管理（增删、拖拽排序）
- [ ] 播放控制
  - 播放/暂停/上一首/下一首
  - 进度条拖拽
  - 音量控制
- [ ] 可视化
  - 频谱分析（Web Audio API）
  - Canvas 绘制像素柱状图
- [ ] 状态持久化
  - 记住播放位置
  - 保存播放列表

**验收标准**: 可导入音乐文件夹，完整播放控制，带像素频谱显示

---

### Phase 4 - 集成与打磨（2-3天）
**目标**: 完善用户体验

- [ ] 模块导航
  - 底部像素 Tab 栏
  - 平滑切换动画
- [ ] 设置面板
  - 主题色切换（绿/琥珀/白）
  - 窗口透明度调节
  - 开机自启选项
- [ ] 系统集成
  - 最小化到系统托盘
  - 托盘菜单快捷操作
  - 全局快捷键
- [ ] 视觉打磨
  - 过渡动画优化
  - 扫描线效果
  - 闪烁/呼吸灯效果

**验收标准**: 完整功能流程，流畅动画，系统托盘集成

---

### Phase 5 - 可选扩展（按需开发）
- [ ] 番茄钟模块
- [ ] 桌面小时钟
- [ ] 天气显示（API 集成）
- [ ] 便利贴（独立小窗口）
- [ ] 快捷键自定义

---

## 项目结构

```
PixelNook/
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── main.rs         # 入口
│   │   ├── window.rs       # 窗口控制
│   │   └── fs.rs           # 文件操作
│   ├── Cargo.toml
│   └── tauri.conf.json     # Tauri 配置
│
├── src/                    # React 前端
│   ├── components/         # 像素 UI 组件
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Scrollbar/
│   │   └── TitleBar/       # 自定义标题栏
│   │
│   ├── modules/            # 功能模块
│   │   ├── notepad/
│   │   │   ├── Notepad.tsx
│   │   │   ├── TabList.tsx
│   │   │   └── Editor.tsx
│   │   └── player/
│   │       ├── Player.tsx
│   │       ├── Playlist.tsx
│   │       ├── Controls.tsx
│   │       └── Visualizer.tsx
│   │
│   ├── store/              # Zustand 状态
│   │   ├── notepadStore.ts
│   │   ├── playerStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── styles/             # 全局样式
│   │   ├── tokens.css      # CSS 变量（颜色、字体）
│   │   ├── global.css      # 全局重置和基础样式
│   │   └── pixel.css       # 像素风格工具类
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── public/                 # 静态资源
│   └── fonts/              # 像素字体文件
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 关键技术点

### 窗口无边框 + 可拖拽
```json
// tauri.conf.json
{
  "tauri": {
    "windows": [{
      "decorations": false,
      "transparent": true,
      "alwaysOnTop": true
    }]
  }
}
```

```tsx
// TitleBar.tsx
<div data-tauri-drag-region className="titlebar">
  <span>PixelNook</span>
  <button onClick={minimizeWindow}>_</button>
  <button onClick={closeWindow}>X</button>
</div>
```

### 像素边框效果
```css
/* 使用 box-shadow 模拟像素描边 */
.pixel-border {
  box-shadow: 
    0 -2px 0 0 var(--border-color),
    2px 0 0 0 var(--border-color),
    0 2px 0 0 var(--border-color),
    -2px 0 0 0 var(--border-color);
}
```

### 本地数据持久化
```typescript
// 使用 Tauri 的文件系统 API
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';

await writeTextFile('notes/note1.txt', content, {
  dir: BaseDirectory.AppData
});
```

### 音频频谱可视化
```typescript
const analyser = audioContext.createAnalyser();
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(dataArray);

// 绘制像素柱状图到 Canvas
```

---

## 性能目标
- 安装包大小: < 10MB
- 内存占用: < 100MB
- 冷启动时间: < 2s
- 音频延迟: < 50ms

## 浏览器兼容
基于 WebView（不需要考虑跨浏览器兼容性）
- Windows: WebView2（Chromium）
- macOS: WKWebView（Safari）
- Linux: WebKitGTK

---

## 开始开发
1. 安装 Rust 和 Node.js
2. 安装 Tauri CLI: `cargo install tauri-cli`
3. 克隆项目并安装依赖: `npm install`
4. 启动开发服务器: `npm run tauri dev`
5. 构建生产版本: `npm run tauri build`




项目：PixelNook — d:\acanhome\PixelNook

Tauri 2 + React18 + TypeScript + Vite 5 桌面挂机小程序。

技术栈

前端：React + Zustand + Howler.js + CSS Modules
后端：Tauri 2（Rust），插件：tauri-plugin-dialog、`tauri-plugin-fs
字体：Press Start 2P（英文 UI）、Fusion Pixel12（中日文内容）
已完成功能

无边框透明窗口，可拖拽，始终置顶
标题栏：▼ mini模式、_ 最小化、X 关闭
记事本：多标签，OPEN/SAVE按钮，Ctrl+S，支持 .txt/.md
播放器：+ FILES 多选音频、+ FOLDER 文件夹导入，播放控制（随机/循环/进度拖拽/音量），Canvas 频谱可视化，LIST 切换播放列表
Mini模式：320×120 迷你窗口，显示歌曲名滚动、进度条、播放控制、音量面板、播放列表弹出，▲ 按钮恢复
关键文件

src/App.tsx — 主布局，mini模式切换，窗口 LogicalSize 调整
src/store/settingsStore.ts — theme / miniMode
src/store/playerStore.ts — 播放列表状态
src/store/notepadStore.ts — 笔记状态，含 filePath/isDirty
src/modules/player/Player.tsx — 完整播放器（html5: true）
src/modules/player/MiniPlayer.tsx — Mini模式播放器
src/modules/notepad/Notepad.tsx — 记事本
src-tauri/capabilities/default.json — 权限配置
public/fonts/ — 缝合怪字体 TTF 文件