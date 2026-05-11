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
- 云函数 M1 鉴权骨架（**零环境变量**）：`cloudfunctions/auth` 只剩 `adminLogin` 一个 action，账号 / 密码完全由 `cloudfunctions/auth/utils/credentials.js` 提供（默认 `admin` / `admin123`），不读任何 env。登录成功返回 `token = ADMIN_PASSWORD` + 固定 profile（`_id=env-admin`、`role=super_admin`）。**不查数据库 / 不哈希 / 不签 JWT / 不读 env / 无外部依赖**。已删除：`cloudfunctions/init/` 整个目录、`cloudfunctions/auth/utils/{password,jwt,authenticate}.js`、`cloudfunctions/auth/actions/{getProfile,changePassword}.js`，模板 `cloudfunctions/hello/` 也已清理。`cloudbaserc.json` 修正 `functionRoot` 到 `./cloudfunctions`，仅登记 `auth`（`installDependency: false`）。前端 `src/modules/auth/api.ts` 同步只保留 `adminLogin`。`pnpm typecheck` + `node --check` 双绿。
- 云函数 M1 资产模块落地（**零环境变量 + 自动建集合**）：`cloudfunctions/asset` 含 8 个 action（写：`create` / `update` / `changeStatus` / `changeLocation` / `changeUser`；读：`getDetail` / `getTimeline` / `list`）。**所有 action 都需要有效 token**（`event.auth.token === ADMIN_PASSWORD`，与 auth 云函数共享同源 `utils/credentials.js`）。**主入口 `await ensureCollections()`** 冷启动幂等创建 `ams_asset` / `ams_asset_log` / `ams_seq` 三个集合（`db.createCollection` + "already exists" 捕获），热实例进程级缓存零开销。入库自动生成 `asset_no = YQJJ + 4位年 + 6位顺序号`（依赖 `ams_seq`原子 +1）；`is_large` 按 `LARGE_ASSET_THRESHOLD` 环境变量（默认 50000）自动打标。所有写操作写入 `ams_asset_log`（CREATE / UPDATE / STATUS_CHANGE / LOCATION_CHANGE / USER_CHANGE / SCRAP），`changes` 数组由通用 `diffFields` 生成。`changeStatus` 拒绝管理员直接设置 `LENT` / `PENDING`（留给借还流程）。`update` 的字段白名单与 `docs/03` 3.4.2 对齐，过滤了 `business_status` / `asset_no` / `current_borrow_id` / `is_large` 等系统字段。`list` 支持 `business_status` / `dept_code` / `is_large` / `category_national` / `location_code` 筛选与 `name` 正则模糊 + 多字段排序 + 分页（上限 200）。`cloudbaserc.json` 已登记 `asset`（`installDependency: true`）。全 15 个 `.js` 过 `node --check`，`utils/validate.js` 本地 smoke 测试通过（白名单过滤 / 数字转型 / 1002 拒绝非法值 / `pageSize` 装断到 200）。

- 前端资产模块完成：`src/modules/asset/types.ts`（Asset / AssetLog / Filter / Sort / List 与 Create/Update Input 等 TS 完整类型，与 `cloudfunctions/asset/utils/validate.js` 白名单同步）；`src/modules/asset/api.ts` 封装 8 个云函数调用。三个页面全部重写：`AssetList.vue`（表格 + 关键字 / 部门 / 状态 / 大型筛选 + 服务端分页 + 状态标签）、`AssetCreate.vue`（入库表单，5 个分组 × ~30 字段 + 必填校验 + 提交后跳详情）、`AssetDetail.vue`（详细字段 5 分组 tab + Timeline tab，后者含 op_type 颜色点 + before/after diff 高亮，按需加载）。`pnpm typecheck` + `pnpm build` 双绿。
- 前端资产变更弹窗 4 件套完成：`src/modules/asset/components/` 下新增 `EditAssetModal.vue`（27 字段轻量编辑，只提交「与原值不同」的字段以减少噪音日志）、`ChangeStatusModal.vue`（状态变更，只允许选 IDLE / IN_USE / MAINTAIN / SCRAPPED，LENT / PENDING 由借还流程驱动）、`ChangeLocationModal.vue`（位置变更，预填当前值）、`ChangeUserModal.vue`（使用人 + 部门变更）。`AssetDetail.vue` 头部新增 4 个操作按钮区，`v-if` 控制弹窗挂载，成功后通过 `onMutationSuccess` 统一关弹窗 + 重拉详情 + 失效 Timeline 缓存（若停留在 Timeline tab 立即重载）。所有变更都会自动写入 `ams_asset_log` 并在 Timeline 中可见。`pnpm typecheck` 通过。

## 进行中

- M1 + M2 资产主闭环已联调走通（登录 → 入库 → 列表 → 详情 → Timeline）；4 个变更弹窗开发完成，待联调：点「编辑 / 变更状态 / 变更位置 / 变更使用人」验证 update / changeStatus / changeLocation / changeUser 四个云函数 action 均能写入 `ams_asset_log` 并在 Timeline 刷出。

## 待办

### M1 · 后端骨架

- [ ] **运维**：重新部署两个云函数：`tcb fn deploy auth && tcb fn deploy asset`（本轮改了 auth.adminLogin / asset/utils/db.js / asset/utils/auth.js / asset/utils/credentials.js / asset/index.js）
- [ ] **运维**：当资产查询压力变大后，为 `ams_asset.asset_no` 唯一 / `business_status` / `dept_code` / `created_at` / `ams_asset_log.asset_id+created_at` 补索引（一期不阻塞）
- [ ] 产品上线前把 `cloudfunctions/auth/utils/credentials.js` 与 `cloudfunctions/asset/utils/credentials.js` 里的默认 `admin` / `admin123` 同步改成产品账密，重新部署
- [ ] 接入多管理员 / 教师端时，重新引入 DB 查询 + JWT（以及恢复 `cloudfunctions/init/`，参见已删的版本可从 git 历史恢复）
- [ ] （可选）创建 `shared/types/` 与 `shared/enums.ts`，三端共享字段类型与枚举

### M2 · 管理端 MVP

- [x] DaisyUI 主题扩展 `primary=#0096C2` / `primary-focus=#006B8F`
- [x] `admin/src/modules/auth/` 登录页 + 路由守卫 + token 存取（待联调真实云函数）
- [x] `admin/src/modules/asset/api.ts`：封装 8 个 `asset.*` 云函数调用
- [x] `admin/src/modules/asset/pages/AssetList.vue`：表格 + 筛选 + 服务端分页
- [x] `admin/src/modules/asset/pages/AssetCreate.vue`：入库表单（5 分组），提交跳详情
- [x] `admin/src/modules/asset/pages/AssetDetail.vue`：详情字段 tab + Timeline tab
- [x] `admin/src/modules/asset/pages/AssetDetail.vue` 增补：编辑 / 状态变更 / 位置变更 / 使用人变更 4 个 modal（接入 `update` / `changeStatus` / `changeLocation` / `changeUser`）
- [ ] `admin/src/modules/dashboard/` 看板真实数据接入（5 卡 + 4 图 + 通知 + 总账 + 出入仓统计）——复用 `asset.list`

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
