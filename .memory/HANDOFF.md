# AMS 交接文档（2026-05-12 接力）

> **新会话先读这份。** 读完再按 `AMS.md` / `AGENTS.md` 走必读链。
> 这份文档只覆盖"接续工作所需的活上下文"。完整历史看 `.memory/PROGRESS.md` 与 `.memory/CHANGELOG.md`。

## 1. 当前里程碑位置

- **M1 后端骨架** 已完成（`auth` + `asset` 两个云函数都已部署到 `ams-d8grnwwy6d8da557f`）。
- **M2 管理端 MVP** 主链路完成：登录 / 资产入库 / 列表 / 详情 / Timeline / 4 个变更弹窗 / Dashboard 看板。
- **M3 教师端 MVP** 未启动。
- 当前任务：**开发 `borrow` 模块**（管理端 + 教师端共用 8 个 action）。

## 2. 用户最新决策（我已经执行完）

> 这个 junction 一旦做好，教师端工作区的 agent 就能直接 `read_file d:\Code\AMS\app\cloudfunctions\borrow\index.js` 读到所有 action 实现，**完全消除"小程序端不知道云函数契约"的问题**。

### 2.2 开发顺序铁律（用户在上一轮反复强调）

**先文档后实现**：

1. 先扩 `docs/04-api-spec.md` 4.2.3：把 `borrow.*` 每个 action 的入参 / 出参 / 错误码 / 状态变迁 / 鉴权角色补齐（目前只有 6 个 action 名 + 一行简述，见 `docs/04-api-spec.md:75-86`）。
2. 顺手写 `docs/07-workflows.md`：借用全流程状态机 `PENDING → APPROVED → RETURNED` / `→ REJECTED` / `→ CANCELLED`，每条边由哪个 action 触发。
3. **顺手在 `docs/04` 同一节加教师端调用样板**（`wx.cloud.callFunction` 示例代码），这样 app 端 agent 看 docs 时就能拷代码。
4. 上面文档锁好后再动 `cloudfunctions/borrow/` 代码。
5. **若实施中发现字段需要调整：先回去改 `docs/03-data-model.md` 再改代码**，禁止反过来。

### 2.3 待联调项（用户会自己跑）

- 资产 4 个变更弹窗（编辑 / 状态 / 位置 / 使用人）→ 验证 `update` / `changeStatus` / `changeLocation` / `changeUser` 写入 Timeline。
- Dashboard 看板 → `tcb fn deploy asset` 已上线，但用户还没看过页面表现。

## 3. 工作偏好（强制遵守）

- **不要跑 `pnpm build`、`pnpm dev`、`tcb fn deploy`**。用户自己控制构建 / 开发服务器 / 部署。
- **agent 自检只跑** `pnpm typecheck`（必要时 `node --check <file>`）。
- 不擅自 `git commit` / `git push`。
- 用户说"提交 / commit / 推送"时才更新 `.memory/PROGRESS.md` + `.memory/CHANGELOG.md` 并准备 Conventional Commits 信息。

## 4. 关键架构决策快查

| 主题 | 决策 | 关键文件 |
|------|------|---------|
| 鉴权 | **零环境变量**，账号密码硬编码在 `cloudfunctions/<func>/utils/credentials.js`，token = ADMIN_PASSWORD | `cloudfunctions/auth/utils/credentials.js`、`cloudfunctions/asset/utils/credentials.js`（**必须同步**） |
| 集合创建 | **不自动建**，首次新环境去控制台手动建 `ams_asset` / `ams_asset_log` / `ams_seq` | `docs/10-init-and-deploy.md` 10.6 |
| 资产编号 | 入库自动生成 `YQJJ + 4位年 + 6位顺序号`，依赖 `ams_seq` 集合原子 `_.inc(1)` | `cloudfunctions/asset/actions/create.js` |
| 状态枚举 | 资产：`IDLE` / `IN_USE` / `LENT` / `PENDING` / `MAINTAIN` / `SCRAPPED`；借用：`PENDING` / `APPROVED` / `REJECTED` / `CANCELLED` / `RETURNED` | `docs/03-data-model.md` 3.4.1 + 3.6 |
| 写日志 | 所有资产写操作进 `ams_asset_log`（CREATE / UPDATE / STATUS_CHANGE / LOCATION_CHANGE / USER_CHANGE / SCRAP），借用应同理进 `ams_borrow_log` 或复用 `ams_asset_log` 加 BORROW / RETURN op_type（**待文档确认**） | `cloudfunctions/asset/utils/log.js` |
| 业务状态闸门 | 管理员不可直接设 `LENT` / `PENDING`（由借还驱动）；借用流程才能改 | `cloudfunctions/asset/actions/changeStatus.js` |
| 字段事实唯一源 | `docs/03-data-model.md` | — |
| 主题色 | DaisyUI `ams` 主题，主色 `#0096C2`，辅色 `#006B8F`。**严禁 emoji**。 | `tailwind.config.js` |

## 5. `borrow` 模块要点（用户已锁的设计）

来自 `docs/04-api-spec.md:75-86` 和 `docs/03-data-model.md:135-157`：

### Action 清单（6 个）

| action | 角色 | 副作用 |
|--------|------|------|
| `submit` | 教师 | 校验资产 `IDLE`，锁为 `PENDING`，生成 `serial_no`，存签名 fileID，写日志 |
| `approve` | 管理员 | `PENDING → LENT`，生成凭证二维码 payload，写 `BORROW` 日志 |
| `reject` | 管理员 | `PENDING → IDLE`，写拒绝原因 |
| `return` | 教师 / 管理员 | `LENT → IDLE`，写 `RETURN` 日志 |
| `cancel` | 教师 | 未审批申请的撤回（PENDING → IDLE，资产解锁） |
| `listMine` | 教师 | 当前教师的申请列表 |

**还差**（写 docs 时补 + 实现）：

- `adminList`（管理端审批列表，按 status / tab 筛选）
- `detail`（双端通用详情）
- `summary`（看板用，类似 `asset.summary`，让 Dashboard 第 5 张卡「待审批」 + 出入仓曲线接入）

### 字段已锁

`ams_borrow_request`：`serial_no` / `teacher_id` + 冗余姓名手机 / `items[]`（含 asset_id + 资产快照）/ `purpose` / `expected_return_date` / `signature_file_id` / `status` / `reject_reason` / `approved_by` + 名 + 时 / `returned_at` / `voucher_qr_payload` / 审计字段。

### 鉴权挑战（教师端 vs 管理端）

教师端 ≠ 管理端：教师端有 `openid`（来自 `wx.cloud` 上下文），管理端 token = `ADMIN_PASSWORD`。

`borrow` 云函数需要识别两种身份：

- 教师调用（submit / cancel / listMine / return-自己的）：从 `event.userInfo.openId` 或 `cloud.getWXContext().OPENID` 取 openid → 查 `ams_teacher` 表反查 `teacher_id`。
- 管理员调用（approve / reject / adminList）：复用现有 `event.auth.token === ADMIN_PASSWORD`。

**注意**：M3 教师端登录流程（`docs/06-teacher-features.md` 提到的"账号密码 + 绑定 openid"）也还没做，可能需要先做最小化的教师身份绑定才能跑通 submit。**这个权衡建议先和用户沟通**：要不要 borrow 一期只允许管理员代提交（adminSubmit），把教师端登录推到下一阶段？

## 6. 重要文件快查

```
admin/
├── AMS.md                          ← 工作区入口
├── docs/                            ← junction（双端共享）
│   ├── 03-data-model.md            ← 字段事实唯一源
│   ├── 04-api-spec.md              ← API 契约（borrow 待扩 4.2.3）
│   ├── 06-teacher-features.md      ← 教师端功能描述
│   ├── 07-workflows.md             ← 流程状态机（borrow 待扩）
│   └── 10-init-and-deploy.md       ← 部署 / 集合 / 鉴权配置
├── .memory/                         ← junction
│   ├── PROGRESS.md                 ← 完整进度（历史 + 待办）
│   ├── CHANGELOG.md                ← 重要变更
│   └── HANDOFF.md                  ← 本文件
├── cloudfunctions/                  ← 即将 junction 到 app/cloudfunctions/
│   ├── auth/                       ← adminLogin 一个 action（已部署）
│   └── asset/                      ← 9 个 action 含 summary（已部署）
└── src/modules/
    ├── auth/                       ← 登录页 + Pinia store + 路由守卫
    ├── asset/                      ← 列表 / 入库 / 详情 / 4 个变更 modal
    └── dashboard/                  ← 实数据看板
```

## 7. 新会话开场建议清单

```
1. 读 .memory/HANDOFF.md（本文件）
2. 读 AMS.md（管理端工作区入口）
3. 读 docs/03-data-model.md 3.6（ams_borrow_request 字段）
4. 读 docs/04-api-spec.md 4.2.3（borrow 现有骨架）
5. 读 docs/06-teacher-features.md（教师端调用 borrow 的页面场景）
6. 跟用户确认：
   a. 是否先建 cloudfunctions junction？
   b. 是否先扩 docs（4.2.3 完整契约 + 07 状态机 + 调用样板）？
   c. M3 教师端登录方案：M2 阶段是否做最小化教师身份绑定，还是 borrow 一期只允许 adminSubmit？
7. 待用户确认后再动代码。
```

## 8. 给用户的一句话状态

> M2 管理端核心闭环开发完，asset / auth 已部署。**下一步开发 borrow 模块**，请先（a）建 cloudfunctions junction、（b）确认教师身份方案，然后我会先扩 docs 再写云函数。
