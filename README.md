# Where Is My Mind

像素风格桌面挂机小程序，提供记事本、音乐播放和桌面宠物功能。

## 预览

- 🎨 复古像素风格界面（黑绿终端配色）
- 📝 多标签记事本（Ctrl+滚轮缩放字号，自动保存）
- 🎵 本地音乐播放器（带伪频谱可视化）
- 🐱 桌面宠物猫（可拖拽、互动、自动游荡）
- 🪟 无边框透明窗口，始终置顶
- 💾 轻量级（~15MB 绿色单文件）

## 技术栈

- **Tauri 2** - 桌面应用框架
- **React 18 + TypeScript** - 前端框架
- **Vite 5** - 构建工具
- **Zustand** - 状态管理
- **Howler.js** - 音频播放
- **CSS Modules** - 样式隔离

## 开发环境要求

1. **Node.js** (推荐 v18+)
2. **Rust** (需要安装 Rust 工具链)
   - Windows: 下载并安装 [rustup-init.exe](https://rustup.rs/)
   - macOS/Linux: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
# Windows PowerShell
$env:PATH += ";$env:USERPROFILE\.cargo\bin"
npm run tauri dev

# macOS/Linux
npm run tauri dev
```

### 3. 构建生产版本

```bash
npm run tauri build
```

构建产物位于 `src-tauri/target/release/where-is-my-mind.exe`（绿色单文件，无需安装）

## 项目结构

```
where-is-my-mind/
├── src/                        # React 前端
│   ├── components/             # UI 组件
│   │   └── TitleBar/           # 自定义标题栏
│   ├── modules/                # 功能模块
│   │   ├── notepad/            # 记事本模块
│   │   ├── player/             # 音乐播放器模块
│   │   └── pet/                # 桌面宠物模块
│   ├── store/                  # Zustand 状态管理
│   ├── styles/                 # 全局样式和设计系统
│   ├── App.tsx                 # 主应用
│   └── main.tsx                # React 入口
├── src-tauri/                  # Rust 后端
│   ├── src/main.rs             # Tauri 入口
│   ├── tauri.conf.json         # Tauri 配置
│   ├── icons/                  # 应用图标（像素猫）
│   └── Cargo.toml              # Rust 依赖
├── icon-designs/               # 图标设计稿（SVG）
└── ROADMAP.md                  # 详细开发路线图
```

## 功能说明

### 记事本模块
- 多标签管理（新建/删除/切换）
- 打开/保存 .txt 和 .md 文件
- Ctrl+S 快速保存
- Ctrl+滚轮 缩放字号（8px ~ 32px）
- 自动保存到 localStorage
- 像素字体和光标动画
- 实时字符计数

### 音乐播放器模块
- 导入本地音乐文件/文件夹
- 支持格式：MP3, FLAC, OGG, WAV, M4A, AAC, WMA
- 完整播放控制（播放/暂停/上一首/下一首）
- 进度条拖拽、音量控制
- 伪像素柱状频谱可视化（基于时间动画）
- 随机播放、循环模式（单曲/列表）
- 播放列表管理（删除单曲、清空）
- Mini 模式（320×145 迷你播放器）

### 桌面宠物模块
- 像素猫咪，带完整动画（眨眼、摇尾、抖耳、抽胡须）
- 鼠标拖拽移动位置
- 点击随机对话（MEOW/PURR/NYA 等）
- 双击切换睡眠/唤醒状态
- 自动游荡（6~14 秒随机走向新位置）
- 走路时身体弹跳动画
- 朝向自动翻转（面向移动方向）

## 窗口控制

- **拖拽移动**：点击标题栏拖动
- **桌面宠物**：点击标题栏 `CAT` 按钮切换显示/隐藏
- **Mini 模式**：点击标题栏 `▼` 按钮进入迷你播放器
- **最小化**：点击标题栏 `_` 按钮
- **关闭**：点击标题栏 `X` 按钮
- **始终置顶**：默认启用

## 主题切换

默认提供三种像素主题（可在代码中切换）：
- **绿色**（经典终端绿 `#00ff41`）
- **琥珀色**（复古琥珀黄 `#ffb000`）
- **白色**（简约白 `#e0e0e0`）

## 开发说明

详细的开发路线图和技术细节请查看 [ROADMAP.md](./ROADMAP.md)

## 发版流程

1. 修改 `tauri.conf.json` 和 `package.json` 的版本号
2. 执行构建：`npm run tauri build`
3. 产物位于 `src-tauri/target/release/where-is-my-mind.exe`
4. 直接分发 .exe 文件即可（绿色单文件，15MB）

## 许可证

MIT
