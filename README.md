# 中文课堂互动游戏生成器

一个专为对外汉语老师、中文老师设计的课堂工作台，包含课堂互动游戏、备课生成和课堂管理工具。

当前项目使用 Vite + React 构建前端，并通过 Express 提供生产静态托管、DeepSeek API 和 Socket.IO 联机基础，可直接作为 Node.js 服务部署到 Zeabur。

## 功能特色

### 🎯 三大游戏模式

1. **课文消失挑战**
   - 逐轮隐藏文字（20% → 40% → 60% → 80%）
   - 锻炼学生记忆和复述能力
   - 适合朗读练习

2. **句子排序游戏**
   - 自动拆分句子为卡片
   - 拖拽排序，检查答案
   - 锻炼语法和逻辑思维

3. **词语配对游戏**
   - 自动提取课文词语
   - 中文与拼音/解释配对
   - 趣味互动，记忆词汇

### 💡 设计亮点

- 🖥️ **投屏友好**：大字体、高对比度，适合课堂展示
- 📱 **响应式设计**：电脑、平板、手机均可使用
- 🎨 **简洁现代**：SaaS 风格界面，老师一看就会
- ⚡ **纯前端实现**：无需后端，打开即用

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

浏览器访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm run build
npm start
```

默认访问 http://localhost:8080。Zeabur 部署步骤见 [ZEABUR_DEPLOY.md](./ZEABUR_DEPLOY.md)。

## 项目结构

```
src/
├── main.jsx              # 入口文件
├── App.jsx               # 主应用组件
├── App.css               # 主样式
├── index.css             # 全局样式
├── components/
│   ├── Navbar.jsx        # 顶部导航
│   ├── TextInput.jsx     # 课文输入区
│   ├── GameSelector.jsx  # 游戏选择卡片
│   ├── DisappearingTextGame.jsx  # 课文消失挑战
│   ├── SentenceOrderGame.jsx     # 句子排序游戏
│   └── WordMatchGame.jsx         # 词语配对游戏
└── utils/
    └── textUtils.js      # 文本处理工具
```

## 使用说明

1. 在首页输入一段中文课文
2. 选择想要生成的游戏类型
3. 点击"开始生成游戏"
4. 在课堂上演示互动
5. 可使用全屏模式投屏

## 后续扩展计划

- [ ] 看图说话游戏
- [ ] 边读边动游戏
- [ ] 拼音自动标注
- [ ] 练习题生成
- [ ] 单词卡生成
- [ ] 音频朗读
- [ ] PDF 导出
- [ ] 会员系统

## 技术栈

- React 18
- Vite 5
- 纯 CSS（无框架）

## 适合场景

- 对外汉语教学
- 儿童中文课
- HSK 备考课堂
- 线上中文教学

## 许可证

MIT License

---

为中文老师打造的互动教学工具 ❤️
