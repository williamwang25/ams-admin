# AMS 管理端（基于 CloudBase Vue 模板）

> 这是 **AMS 资产管理系统** 的管理员 Web 端工作区。
> 完整项目说明在父仓库 `d:\Code\AMS\README.md`；本工作区精简手册见 [`AMS.md`](./AMS.md)。
>
> **新成员 / 新 agent 第一步**：读 [`AMS.md`](./AMS.md) → `docs/README.md` → `.memory/PROGRESS.md`
>
> `docs/`、`.memory/` 是AMS系统的文档和上下文管理文件，及时阅读、及时更新，确保一致性

---

## 模板说明（CloudBase Vue 模板）

基于 Vue 3、Vite 和腾讯云开发（CloudBase）的现代化 Web 应用模板，为开发者提供了快速构建全栈应用的能力。

[![Powered by CloudBase](https://7463-tcb-advanced-a656fc-1257967285.tcb.qcloud.la/mcp/powered-by-cloudbase-badge.svg)](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)  

> 本项目基于 [**CloudBase AI ToolKit**](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit) 开发，通过AI提示词和 MCP 协议+云开发，让开发更智能、更高效，支持AI生成全栈代码、一键部署至腾讯云开发（免服务器）、智能日志修复。

## 项目特点

- 🚀 基于 Vite 构建，提供极速的开发体验
- ⚡ 使用 Vue 3 Composition API 构建现代化 UI
- 🛣️ 集成 Vue Router 4 实现前端路由
- 🎨 集成 Tailwind CSS 和 DaisyUI 组件库，快速构建漂亮的界面
- 🎁 深度集成腾讯云开发 CloudBase，提供一站式后端云服务

## 项目架构

### 前端架构

- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **路由**：Vue Router 4（使用 Hash Router）
- **样式**：Tailwind CSS + DaisyUI
- **状态管理**：Vue 3 Reactivity API

### 云开发资源

本项目使用了以下腾讯云开发（CloudBase）资源：

- **身份认证**：用于用户登录和身份验证
- **云数据库**：可用于存储应用数据
- **云函数**：可用于实现业务逻辑
- **云存储**：可用于存储文件
- **静态网站托管**：用于部署前端应用

## 开始使用

### 前提条件

- 安装 Node.js (版本 16 或更高)
- 腾讯云开发账号 (可在[腾讯云开发官网](https://tcb.cloud.tencent.com/)注册)

### 安装依赖

```bash
npm install
```

### 配置云开发环境

1. 打开 `src/utils/cloudbase.js` 文件
2. 将 `ENV_ID` 变量的值修改为您的云开发环境 ID
3. 将 `vite.config.js` 中的`https://envId-appid.tcloudbaseapp.com/` 替换为你的云开发环境静态托管默认域名，可以使用 MCP 来查询云开发环境静态托管默认域名

### 本地开发

```bash
npm run dev
```

### VS Code 预览功能

本项目已配置 VS Code 预览功能，支持自动打开浏览器预览：

1. 在 VS Code 中打开项目
2. 项目会自动加载 `.vscode/preview.yml` 配置
3. 启动开发服务器后会自动打开浏览器预览页面
4. 默认端口：5173

配置文件位置：`.vscode/preview.yml`

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 部署指南

### 部署到云开发静态网站托管

1. 构建项目：`npm run build`
2. 登录腾讯云开发控制台
3. 进入您的环境 -> 静态网站托管
4. 上传 `dist` 目录中的文件

### 使用 CloudBase CLI 部署

```bash
# 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 设置环境变量
export ENV_ID=your-env-id

# 部署
tcb framework deploy
```

## 目录结构

```
├── public/               # 静态资源
│   └── vite.svg         # Vite logo
├── src/
│   ├── components/       # 可复用组件
│   │   └── Footer.vue   # 页脚组件
│   ├── pages/            # 页面组件
│   │   └── HomePage.vue # 首页
│   ├── utils/            # 工具函数和云开发初始化
│   │   └── cloudbase.js # 云开发配置
│   ├── App.vue           # 应用入口组件
│   ├── main.js           # 应用入口文件
│   └── style.css         # 全局样式
├── index.html            # HTML 模板
├── tailwind.config.js    # Tailwind 配置
├── postcss.config.js     # PostCSS 配置
├── vite.config.js        # Vite 配置
├── cloudbaserc.json      # CloudBase CLI 配置
└── package.json          # 项目依赖
```

## 路由系统说明

本项目使用 Vue Router 4 作为路由系统，并采用 Hash Router 实现路由管理，这样可以更好地兼容静态网站托管服务，避免刷新页面时出现 404 错误。

### 当前路由结构

```javascript
const routes = [
  { path: '/', component: HomePage },
  { path: '/:pathMatch(.*)*', redirect: '/' } // 404重定向到首页
]
```

### 如何添加新页面和路由

1. 在 `src/pages` 目录下创建新页面组件
2. 在 `src/main.js` 中导入新页面并添加到路由配置
3. 使用 `<router-link>` 或 `$router.push()` 进行页面导航

## Vue 3 特性使用

### Composition API

本项目使用 Vue 3 的 Composition API，提供更好的逻辑复用和类型推导：

```vue
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)
const increment = () => count.value++

onMounted(() => {
  console.log('组件已挂载')
})
</script>
```

### 响应式系统

使用 Vue 3 的响应式 API 管理状态：

```javascript
import { ref, reactive, computed } from 'vue'

const state = reactive({
  user: null,
  isLoggedIn: false
})

const userDisplayName = computed(() => 
  state.user ? state.user.name : '游客'
)
```

## 云开发使用示例

通过 `src/utils/cloudbase.js` 访问云开发服务：

```javascript
import { app, checkLogin } from './utils/cloudbase.js'

// 数据库操作
await checkLogin();
const db = app.database();
const result = await db.collection('users').get(); // 查询数据
await db.collection('users').add({ name: 'test' }); // 添加数据

// 调用云函数
const funcResult = await app.callFunction({ name: 'hello' });

// 文件上传
const uploadResult = await app.uploadFile({ cloudPath: 'test.jpg', filePath: file });
```

## 开发指南

### 组件开发

创建新组件时，建议使用 `<script setup>` 语法：

```vue
<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <button @click="handleClick">点击我</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps(['title'])
const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', '按钮被点击了')
}
</script>
```

### 样式开发

本项目使用 Tailwind CSS，推荐使用原子化的 class：

```vue
<template>
  <div class="bg-white shadow-lg rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">标题</h2>
    <p class="text-gray-600">内容文本</p>
  </div>
</template>
```

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router 4** - Vue.js 官方路由管理器
- **Tailwind CSS** - 原子化 CSS 框架
- **DaisyUI** - Tailwind CSS 组件库
- **CloudBase JS SDK** - 腾讯云开发 JavaScript SDK

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个模板！

## 许可证

MIT License