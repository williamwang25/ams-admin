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
- 管理端骨架完成：DaisyUI `ams` 主题（主色 `#0096C2`、辅色 `#006B8F`）；9 个模块目录（auth / dashboard / asset / borrow / large-asset / notice / user / report / share），每模块 `routes.ts` + 占位页面；全局布局 `AppLayout` / `AppSidebar` / `AppTopbar`；Pinia auth store；hash 路由 + 守卫（未登录跳 `/login`、`/admins` 仅超管）；`@` 路径别名；`pnpm typecheck` + `pnpm build` 双绿。
- 前端工具就绪：`utils/cloudbase.ts`（SDK 单例 + `db()`）、`utils/http.ts`（`callFunction` 统一封装，自动注入 token，非 0 code 抛 `CloudFunctionError`）、`utils/token.ts`（localStorage 存取 + `AdminRole` 小写枚举对齐 docs/03 3.2）、`utils/status.ts`（资产 / 借用状态 label + badge 映射）、`utils/format.ts`（金额 / 日期）。
- 云函数 M1 鉴权骨架（**精简版**）：`cloudfunctions/auth` 只剩 `adminLogin` 一个 action，比对 3 个环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_TOKEN`，命中即返回常量 token + 固定 profile（`_id=env-admin`、`role=super_admin`）。**不查数据库 / 不哈希 / 不签 JWT / 无外部依赖**，整个函数 ~50 行。已删除：`cloudfunctions/init/` 整个目录、`cloudfunctions/auth/utils/{password,jwt,authenticate}.js`、`cloudfunctions/auth/actions/{getProfile,changePassword}.js`，模板 `cloudfunctions/hello/` 也已清理。`cloudbaserc.json` 修正 `functionRoot` 到 `./cloudfunctions`，仅登记 `auth`（`installDependency: false`）。前端 `src/modules/auth/api.ts` 同步只保留 `adminLogin`。`pnpm typecheck` + `node --check` 双绿。

## 进行中

- M1 后端骨架剩余项（asset 云函数 + 集合索引 + 安全规则）。

## 待办

### M1 · 后端骨架

- [ ] **运维**：部署 `auth` 云函数（`tcb fn deploy auth`）
- [ ] **运维**：可选给 `auth` 配置 3 个环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_TOKEN`（不配会回落到开发默认值并打 warn）
- [ ] 接入多管理员 / 教师端时，重新引入 DB 查询 + JWT（恢复 `cloudfunctions/init/` 用于建集合 + 超管，参见已删的版本可从 git 历史恢复）
- [ ] 新建 `cloudfunctions/asset/`：`create` / `update` / `changeStatus` / `changeLocation` / `changeUser` / `getTimeline` / `getDetail` / `list` / `detail`，含 `asset_no` 自动生成（用 `ams_seq` 顺序号）与 `ams_asset_log` 写入；列表 / 详情读取也走云函数（一期不放 SDK 直连）
- [ ] **运维**：随 asset 模块上线，在 CloudBase 控制台按需手动建集合 `ams_asset` / `ams_asset_log` / `ams_seq`（不提前一次性建全部）。**安全规则一期不配置**——云函数是唯一读写入口，默认权限即可工作；后期若启用 SDK 直连再按 docs/04-api-spec.md 4.4 收口
- [ ] （可选）创建 `shared/types/` 与 `shared/enums.ts`，三端共享字段类型与枚举

### M2 · 管理端 MVP

- [x] DaisyUI 主题扩展 `primary=#0096C2` / `primary-focus=#006B8F`
- [x] `admin/src/modules/auth/` 登录页 + 路由守卫 + token 存取（待对接真实云函数）
- [ ] `admin/src/modules/dashboard/` 看板真实数据接入（5 卡 + 4 图 + 通知 + 总账 + 出入仓统计）
- [ ] `admin/src/modules/asset/` 列表 + 入库表单 + 详情 + Timeline 真实数据接入

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
