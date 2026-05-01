# 🎮 11_Game - 小游戏合集

精选网页小游戏合集，无需下载，打开即玩！

## 🎯 游戏列表

| 游戏 | 描述 | 入口 |
|------|------|------|
| 🎨 颜色魔法学院 | 探索颜色混合的奥秘，学习光的魔法和颜料的魔法 | [color_mixing/](color_mixing/index.html) |
| 🎹 键盘钢琴 | 用键盘弹奏美妙的音乐，支持自由弹奏和跟随演奏 | [piano/](piano/index.html) |
| ✨ 沙画艺术 | 小马宝莉主题沙画创作，多种沙画效果 | [sand_art/](sand_art/index.html) |

## 🚀 快速开始

### 本地运行

```bash
# 使用 Python 内置 HTTP 服务器
python3 -m http.server 8080

# 或使用 Node.js
npx serve .
```

然后在浏览器中访问 `http://localhost:8080`

### 部署到 Cloudflare Tunnel

```bash
# 启动 Tunnel
cloudflared tunnel --config config.yml run

# 访问地址
# https://11.marspu.top
```

## 📁 项目结构

```
11_Game/
├── index.html          # 首页（游戏选择器）
├── color_mixing/       # 颜色魔法学院
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── piano/              # 键盘钢琴
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── sand_art/           # 沙画艺术
    ├── index.html
    ├── styles.css
    └── script.js
```

## 🌐 访问地址

- **本地**: http://localhost:8080
- **公网**: https://11.marspu.top

## 🛠️ 技术栈

- **前端**: 纯 HTML5 + CSS3 + JavaScript
- **部署**: Cloudflare Tunnel
- **域名**: marspu.top

## 📝 开发说明

每个游戏都是独立的 HTML 页面，可以直接在浏览器中打开运行。

### 颜色魔法学院
- 支持加色混合（光的魔法）和减色混合（颜料的魔法）
- 自由混合实验室，支持多种颜色混合
- 颜色轮和小测验功能

### 键盘钢琴
- 键盘映射：白键 A S D F G H J K L，黑键 W E T Y U O P
- 内置多首经典曲目
- 支持自由弹奏和跟随演奏模式

### 沙画艺术
- 小马宝莉主题
- 多种沙画效果（普通、闪亮、彩虹、发光、像素、水彩）
- 预设图案和自定义颜色

## 📄 License

MIT License