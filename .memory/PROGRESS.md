# AMS 项目进度

> **作用**：跨会话、跨 agent 共享当前迭代状态。每次完成一段工作后追加；用户准备 git 提交时强制刷新（详见 `AGENTS.md`）。
> **格式约定**：按"已完成 / 进行中 / 待办"三段维护；条目越新越靠上；保留日期戳便于追溯。

## 里程碑

- M0 项目初始化与需求文档（**当前**）
- M1 后端骨架：`init` 云函数 + 共享类型 + auth 与 asset 基础接口
- M2 管理端 MVP：登录 + 资产 CRUD + Dashboard
- M3 教师端 MVP：登录绑定 + 借用申请 + 凭证 + 归还
- M4 借用审批闭环 + 大型资产页 + 通知公告
- M5 联调 / 上线烟雾测试

---

## 已完成

### 2026-05-11

- 项目模板就位：`admin/`（CloudBase Vue3 模板）、`app/`（unibest + wot-ui v2）。
- `data/` 业务原始资料齐备：资产字段总表、借用登记表。
- 完成 12 项关键需求决策（认证、数据模型、范围、审批、签名、编号、看板、借物车、审计、模块拆分、读写路径、初始化）。
- 产出 `docs/` 需求文档 12 份（README + 01–11 章节），覆盖架构、数据模型、API 契约、双端功能、流程、UI、开发约定、部署、开放问题。
- 建立根级 agent 入口：`AGENTS.md`、`.windsurf/rules/project.md`、`.codex/config.toml`、根 `README.md`，统一指向 `docs/` 与 `.memory/`。

## 进行中

- 暂无。

## 待办

### M1 · 后端骨架

- [ ] 新建 `cloudfunctions/init/` 实现 `initialize` / `seedAssets` 两个 action
- [ ] 设置 CloudBase 环境变量：`INIT_SECRET`、`JWT_SECRET`、`DEFAULT_SUPER_ADMIN_USERNAME`、`DEFAULT_SUPER_ADMIN_PASSWORD`
- [ ] 创建 `shared/types/` 与 `shared/enums.ts`，三端共享字段类型与枚举
- [ ] 新建 `cloudfunctions/auth/`：`adminLogin`、`teacherLoginByPassword`、`teacherBindOpenid`、`teacherLoginByOpenid`、`getProfile`
- [ ] 新建 `cloudfunctions/asset/`：`create`、`update`、`changeStatus`、`changeLocation`、`changeUser`、`getTimeline`、`getDetail`，含 `asset_no` 自动生成与 `ams_asset_log` 写入
- [ ] CloudBase 控制台建集合 + 索引 + 安全规则（按 `docs/03-data-model.md` 与 `docs/04-api-spec.md`）

### M2 · 管理端 MVP

- [ ] `admin/src/modules/auth/` 登录页 + 路由守卫 + token 存取
- [ ] `admin/src/modules/dashboard/` 看板（5 卡 + 4 图 + 通知 + 总账 + 出入仓统计）
- [ ] `admin/src/modules/asset/` 列表 + 入库表单 + 详情 + Timeline
- [ ] DaisyUI 主题扩展 `primary=#0096C2` / `primary-focus=#006B8F`

### M3 · 教师端 MVP

- [ ] `app/src/pages/login/` 账号密码 + 绑定 openid 流程
- [ ] `app/src/pages/index/` 首页（看板 / 通知 / 常用功能）
- [ ] `app/src/pages/borrow/` 上下分屏 + 点击加入 + 长按拖拽
- [ ] canvas 手写签名组件 + 凭证页
- [ ] wot-ui v2 主题色覆盖 `--wot-color-primary`

### M4 · 闭环

- [ ] `cloudfunctions/borrow/` `submit` / `approve` / `reject` / `return` / `cancel`
- [ ] 管理端 `borrow` 模块审批列表与详情
- [ ] 大型资产页 `large-asset`
- [ ] 通知公告 `notice` 管理与教师端展示

### M5 · 联调

- [ ] 端到端烟雾测试：入库 → 借用 → 审批 → 凭证 → 归还
- [ ] 管理端部署到 CloudBase 静态托管
- [ ] 小程序提审

---

## 历史会话留言

> 简短记录跨会话需要传递的口头约定 / 临时决策。

- 2026-05-11：教师端首登采用账密 + 微信组件获取手机号 → 绑定 openid → 后续免密；签名仅做 canvas + HTML 凭证（不出 PDF）。
- 2026-05-11：第一期不实现 AI 报表 / 闲置共享 / Excel 批量导入 / 扫码，但保留路由占位。
