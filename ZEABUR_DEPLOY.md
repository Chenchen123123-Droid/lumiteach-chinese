# HanClass 部署到 Zeabur

项目已经改成一个完整的 Node.js 服务：

- Vite 构建 React 前端
- Express 托管 `dist` 并提供 API
- Socket.IO 提供联机通信基础
- DeepSeek API Key 只保存在服务端
- React 深层路由会自动回退到 `index.html`

## 部署前确认

本地执行：

```bash
npm install
npm run build
npm start
```

浏览器检查：

- `http://127.0.0.1:8080/`
- `http://127.0.0.1:8080/tools/pinyinwheel`
- `http://127.0.0.1:8080/api/health`

## Zeabur 控制台操作

1. 使用 GitHub 登录 Zeabur。
2. 创建一个 Project。
3. 点击 Add Service，选择 GitHub。
4. 选择 `Chenchen123123-Droid/lumiteach-chinese` 仓库。
5. 等待 Zeabur 识别为 Node.js 服务。
6. 在服务的 Variables 中添加：

```text
DEEPSEEK_API_KEY=你的密钥
AI_RATE_LIMIT_MAX=8
AI_RATE_LIMIT_WINDOW_MS=600000
```

7. 如果 Zeabur 没有自动识别命令，在 Variables 中添加：

```text
ZBPACK_BUILD_COMMAND=npm run build
ZBPACK_START_COMMAND=npm start
```

8. 在 Domains 中生成 `zeabur.app` 域名。
9. 打开 `https://你的域名/api/health`，确认返回 `"ok": true`。

## 重要：不要配置成纯静态服务

不要设置：

```text
ZBPACK_OUTPUT_DIR=dist
```

设置该变量后，Zeabur 会只用静态服务器托管前端，Express、DeepSeek API 和 Socket.IO 都不会启动。

## 数据库和真实联机

当前这次改造提供了 Socket.IO 连接、加入房间和房间人数同步基础，但“爬山竞赛”仍使用本地演示逻辑，尚未冒充真实联机。

下一阶段建议：

1. 在同一个 Zeabur Project 中添加 PostgreSQL。
2. 建立用户、会员、订单、课堂和题库表。
3. 把爬山竞赛接入 Socket.IO 房间事件。
4. 用户量增加或服务扩容时添加 Redis，用于跨实例同步房间状态和API限流。

## Zeabur 运行要求

服务必须执行 `npm start`，并监听 Zeabur 自动注入的 `PORT`。当前服务器已监听 `0.0.0.0` 和 `process.env.PORT`，无需手动写死端口。
