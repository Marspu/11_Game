# 🎮 11_Game - 小游戏合集

精选网页小游戏合集，无需下载，打开即玩！

## 🎯 游戏列表

| 游戏 | 描述 | 入口 |
|------|------|------|
| 🎨 颜色魔法学院 | 探索颜色混合的奥秘，学习光的魔法和颜料的魔法 | [color_mixing/](color_mixing/index.html) |
| 🎹 键盘钢琴 | 用键盘弹奏美妙的音乐，支持自由弹奏和跟随演奏 | [piano/](piano/index.html) |
| ✨ 沙画艺术 | 小马宝莉主题沙画创作，多种沙画效果 | [sand_art/](sand_art/index.html) |
| 🌙 月球阴晴圆缺 | 探索月相变化的奥秘，认识新月、上弦月、满月、下弦月 | [moon_phases/](moon_phases/index.html) |

## 🚀 快速开始

### 本地运行

```bash
# 使用 Python 内置 HTTP 服务器
python3 -m http.server 8080

# 或使用 Node.js
npx serve .
```

然后在浏览器中访问 `http://localhost:8080`

### 部署到 Cloudflare Pages（推荐）

#### 方式一：通过 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 **Pages** → **创建项目**
3. 连接 GitHub 仓库 `marspu/11_Game`
4. 设置构建配置：
   - **框架预设**: 无（纯静态站点）
   - **构建输出目录**: `.`
   - **自定义域名**: `11.marspu.top`
5. 点击 **保存并部署**

#### 方式二：通过 Wrangler CLI

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署到 Cloudflare Pages
wrangler pages deploy 11_Game --project-name=11-game
```

### 访问地址

- **Cloudflare Pages**: https://11-game.pages.dev
- **自定义域名**: https://11.marspu.top

## 📁 项目结构

```
11_Game/
├── index.html          # 首页（游戏选择器）
├── _routes.json        # Cloudflare Pages 路由配置
├── wrangler.toml       # Cloudflare Pages 配置文件
├── color_mixing/       # 颜色魔法学院
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── piano/              # 键盘钢琴
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── sand_art/           # 沙画艺术
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── moon_phases/        # 月球阴晴圆缺
    └── index.html
```

## 🌐 访问地址

- **本地**: http://localhost:8080
- **Cloudflare Pages**: https://11-game.pages.dev
- **自定义域名**: https://11.marspu.top

## 🛠️ 技术栈

- **前端**: 纯 HTML5 + CSS3 + JavaScript
- **部署**: Cloudflare Pages（静态托管）
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

### 月球阴晴圆缺
- 互动式月相变化演示
- 太空视角和地球视角双视图
