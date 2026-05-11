# 04 云函数与 SDK 契约

> **作用**：定义云函数清单与入参出参约定。
> 一期读写均走云函数（见 02 2.2），本文 4.4 的「SDK 直连白名单」仅为后期优化事项。
> **读者**：后端 agent、前端调用方。
> **编辑边界**：新增 / 修改接口前先更新本文；具体内部实现由后端 agent 决定。

## 4.1 通用约定

### 4.1.1 云函数入口

每个云函数以 `action` 字段分发：

```jsonc
// 入参
{
  "action": "list",   // 必填，子操作名
  "data": { ... }     // 业务参数
}
```

### 4.1.2 统一返回结构

```jsonc
{
  "code": 0,          // 0 成功；其他为错误码
  "message": "ok",
  "data": { ... }     // 业务数据
}
```

错误码段位约定（建议）：

| 段位 | 含义 |
|------|------|
| 0 | 成功 |
| 1xxx | 入参 / 校验错误 |
| 2xxx | 鉴权 / 权限错误 |
| 3xxx | 业务规则错误（如状态不允许） |
| 4xxx | 资源不存在 |
| 5xxx | 数据库 / 内部错误 |

### 4.1.3 鉴权

- 云函数通过 `context.AUTH` 获取调用者身份（管理员 `_id` / 教师 `_id`）；首次进入需校验 token / openid。
- 写操作必须校验角色权限：教师只能改自己的借用申请；管理员才能审批、变动资产。

## 4.2 云函数清单

### 4.2.1 `auth`

| action | 角色 | 入参 | 说明 |
|--------|------|------|------|
| `adminLogin` | 公开 | `{ username, password }` | 管理员账密登录，返回 token & profile |
| `teacherLoginByPassword` | 公开 | `{ username, password, code }` | 教师首登：账密 + `wx.login` code |
| `teacherBindOpenid` | 教师 | `{ phone_code }` | 绑定手机号（来自 `<button open-type="getPhoneNumber">`）与 openid |
| `teacherLoginByOpenid` | 公开 | `{ code }` | 后续免密登录，通过 openid 查询 `ams_teacher` |
| `getProfile` | 已登录 | `{}` | 获取当前用户信息 |
| `changePassword` | 已登录 | `{ old, new }` | 修改密码 |

### 4.2.2 `asset`

| action | 角色 | 说明 |
|--------|------|------|
| `create` | 管理员 | 单条入库；自动生成 `asset_no`、写 `ams_asset_log(CREATE)`、计算 `is_large` |
| `update` | 管理员 | 编辑资产（不含 `business_status`，状态由专用 action 改） |
| `changeStatus` | 管理员 | 变更 `business_status`（如 IDLE↔MAINTAIN / SCRAP），写日志 |
| `changeLocation` | 管理员 | 变更存放地点，写日志 `LOCATION_CHANGE` |
| `changeUser` | 管理员 | 变更使用人，写日志 `USER_CHANGE` |
| `getTimeline` | 管理员 / 教师 | 查询 `ams_asset_log` 单资产历史 |
| `getDetail` | 管理员 / 教师 | 获取资产详情 |

> 一期列表 / 搜索也由 `asset.list`（或云函数补充 action）返回；后期可考虑走 SDK 直连（见 4.4）。

### 4.2.3 `borrow`

| action | 角色 | 说明 |
|--------|------|------|
| `submit` | 教师 | 提交借用申请：校验资产为 `IDLE`，锁定为 `PENDING`，生成 `serial_no`，存签名 fileID，写日志 |
| `approve` | 管理员 | 审批通过：资产 `PENDING→LENT`，生成凭证二维码 payload，写日志 `BORROW` |
| `reject` | 管理员 | 审批拒绝：资产 `PENDING→IDLE`，写拒绝原因 |
| `return` | 教师 / 管理员 | 归还：资产 `LENT→IDLE`，记 `RETURN` |
| `cancel` | 教师 | 取消未审批申请 |
| `listMine` | 教师 | 当前教师的申请列表 |

> 一期管理端审批列表与详情走云函数（可新增 `borrow.adminList` / `borrow.detail`）；后期可考虑走 SDK 直连。

### 4.2.4 `asset-change`（可与 asset 合并，按 agent 偏好）

如独立维护，与 `asset.changeLocation` / `changeUser` 同义；本目录建议合并到 `asset`。

### 4.2.5 `dashboard`

| action | 角色 | 说明 |
|--------|------|------|
| `summary` | 管理员 | 返回指标卡数据：资产总数、总值、使用中、出借中、待审批 |
| `byDepartment` | 管理员 | 按部门资产分布（柱状图数据） |
| `byStatus` | 管理员 | 按业务状态占比（饼状图数据） |
| `borrowTrend` | 管理员 | 入参 `{ days|month }`，返回出入仓数量曲线 |
| `borrowAmountTrend` | 管理员 | 出入仓金额曲线 |
| `ledger` | 管理员 | 总账信息：按学院 / 部门聚合数量、总金额、借出数量 |
| `inoutStats` | 管理员 | 出入仓今日 / 本月 / 总计（数量 + 金额） |

> 全部为只读聚合；可由 SDK 直接做也可云函数缓存。一期建议云函数返回。

### 4.2.6 `notice`

| action | 角色 | 说明 |
|--------|------|------|
| `create` | 管理员 | 发布通知 |
| `update` | 管理员 | 修改通知 |
| `publish` | 管理员 | 上下架 |
| `delete` | 管理员 | 删除 |

> 一期列表读取走云函数；后期可考虑走 SDK 直连。

### 4.2.7 `init`（一期已下线）

为减少项目启动复杂度，当前不实现 `init` 云函数；超管账号、根密钥由 `auth` 云函数的环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_TOKEN` 提供，需要的集合 / 字典可在 CloudBase 控制台手动创建。引入多管理员 / 教师端后再考虑恢复本节设计。

原设计作为后期参考保留：

| action | 角色 | 说明 |
|--------|------|------|
| `initialize` | 公开（带秘钥） | 一次性：创建超级管理员、字典数据、示例教师账号；重复调用幂等 |
| `seedAssets` | 公开（带秘钥） | （可选）导入 `data/资产字段总表.md` 示例数据 |

### 4.2.8 预留

- `report`：AI 语义报表（一期不实现）
- `share`：闲置共享（一期不实现）

## 4.3 输入参数与返回结构（指导级）

每个 action 的字段不在此一一锁死，由后端 agent 实现时附 JSDoc / 类型定义，但应遵守：

- **教师端可访问字段**：必须过滤 `password_hash` 等敏感字段。
- **分页**：统一 `{ page = 1, pageSize = 20 }`，返回 `{ total, list }`。
- **筛选**：列表查询通过 `filter: { field: value | { op, value } }` 传递，避免拼字符串。
- **时间区间**：用 ISO 字符串或时间戳对，由前端传入。

## 4.4 SDK 直连白名单（后期优化）

> **一期不实施**：为避免安全规则配置的复杂度卡住功能进度，一期所有读 / 写均走云函数（上表“读”的表达意图转为 `xxx.list` / `xxx.detail` 类云函数 action 的过滤逻辑）。
>
> **后期启用时机**：仅当特定列表 / 看板查询出现明显性能瓶颈、或需要绕开云函数冷启动时才考虑针对个别集合启用。

以下为后期可考虑的只读白名单（意图表，启用时再依据实际场景裁决）：

| 集合 | 管理端 | 教师端 |
|------|--------|--------|
| `ams_asset` | 读全部 | 读 `business_status != SCRAPPED` 的精简字段 |
| `ams_asset_log` | 读全部 | 不允许 |
| `ams_borrow_request` | 读全部 | 仅读 `teacher_id == 自己` |
| `ams_notice` | 读 published / 未发布 | 仅读 `published == true` |
| `ams_dict` | 读 enabled | 读 enabled |
| `ams_admin` / `ams_teacher` | 仅超管读 | 不允许 |

## 4.5 图片 / 签名上传

- 前端使用 `app.uploadFile({ cloudPath, filePath })` 直传云存储，路径建议：
  - 资产图片：`asset/{asset_no}/{timestamp}-{random}.jpg`
  - 签名图片：`signature/{teacher_id}/{borrow_serial_no}.png`
- 上传成功得到 `fileID`，再调用对应云函数（`asset.create` / `borrow.submit`）落库。
- 渲染时通过 `app.getTempFileURL({ fileList })` 转 https 链接。
