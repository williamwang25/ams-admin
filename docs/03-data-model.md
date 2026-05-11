# 03 数据模型

> **作用**：定义所有数据库集合的字段与索引建议，确保三端字段一致。
> **读者**：建表负责人、所有读写数据的 agent。
> **编辑边界**：**字段增删改必须先修改本文，再同步到代码**。具体字段类型、长度限制可由 agent 自行决定，但字段名与枚举值锁定。

## 3.1 集合一览

| 集合 | 用途 | 主要写入方 |
|------|------|-----------|
| `ams_admin` | 管理员账号 | `init` / 超管 |
| `ams_teacher` | 教师账号 + openid 绑定 | `init` / 教师端登录绑定 |
| `ams_asset` | 资产主表 | 管理端入库 / 变动 / 借还 |
| `ams_asset_log` | 资产生命周期日志 | 所有写操作云函数 |
| `ams_borrow_request` | 借用申请单 | 教师端提交、管理端审批 |
| `ams_notice` | 通知公告 | 管理端 |
| `ams_dict` | 字典（部门、分类、状态等） | `init` / 超管 |

## 3.2 `ams_admin`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | string | √ | CloudBase 默认主键 |
| `username` | string | √ | 登录账号，唯一 |
| `password_hash` | string | √ | 加盐 hash（云函数侧 bcrypt / scrypt） |
| `name` | string | √ | 显示名 |
| `role` | enum | √ | `admin` / `super_admin` |
| `phone` | string |   | 联系电话 |
| `created_at` | timestamp | √ | |
| `updated_at` | timestamp | √ | |
| `last_login_at` | timestamp |   | |

**索引**：`username` 唯一。

## 3.3 `ams_teacher`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `_id` | string | √ | |
| `username` | string | √ | 教师登录账号，唯一 |
| `password_hash` | string | √ | 首登核验密码 |
| `name` | string | √ | 姓名 |
| `phone` | string |   | 手机号（绑定时由微信组件回填） |
| `department` | string |   | 所属部门 |
| `openid` | string |   | 微信 openid，绑定后免密登录的依据 |
| `unionid` | string |   | （可选） |
| `bound_at` | timestamp |   | openid 绑定时间 |
| `created_at` | timestamp | √ | |
| `updated_at` | timestamp | √ | |

**索引**：`username` 唯一；`openid` 唯一（允许 null）。

## 3.4 `ams_asset`

字段对齐 `data/资产字段总表.md` 全量保留，附加运行态字段。**注意**：原表中"业务状态"字段含义被独立扩展为枚举（见 3.4.1）。

### 3.4.1 业务状态枚举 `business_status`（已锁）

| 值 | 含义 |
|----|------|
| `IDLE` | 闲置（已入库，无人使用、未借出） |
| `IN_USE` | 使用中（有指定使用人，正常在用） |
| `LENT` | 借出中（被某次借用申请占用） |
| `PENDING` | 待审批（已被某借用申请锁定但管理员未审批） |
| `MAINTAIN` | 维修 / 维护中 |
| `SCRAPPED` | 报废 |

> 原表"在用"字段（`status_raw` 或 `legacy_status`）保留原值用于报表导出，不参与业务流。

### 3.4.2 字段表

| 分组 | 字段 | 类型 | 说明 |
|------|------|------|------|
| 基础 | `asset_no` | string | 资产编号，唯一（如 `YQJJ2026000431`） |
|      | `voucher_no` | string | 建账单号（如 `ZCJZ2026000388`） |
|      | `name` | string | 资产名称 |
|      | `brand` | string | 品牌 |
|      | `spec` | string | 规格型号 |
|      | `category_national` | string | 国标分类 |
|      | `category_industry` | string | 行业分类 |
| 数量 | `unit_price` | number | 单价 |
|      | `quantity` | number | 数量 / 面积 |
|      | `unit` | string | 计量单位 |
| 财务 | `book_date` | string | 记账日期 |
|      | `original_value` | number | 资产原值 |
|      | `accumulated_depreciation` | number | 累计折旧 |
|      | `net_value` | number | 净值 |
|      | `depreciation_years` | number | 折旧年限 |
|      | `depreciated_months` | number | 已提折旧月数 |
| 归属 | `dept_code` | string | 部门代码 |
|      | `dept_name` | string | 使用部门 |
|      | `user_name` | string | 使用人 |
|      | `location_code` | string | 存放地点代码 |
|      | `location_name` | string | 存放地点 |
| 取得 | `purchase_mode` | string | 取得方式 |
|      | `acquire_date` | string | 取得日期 |
|      | `book_in_date` | string | 财务入账日期 |
|      | `supplier` | string | 供货商 |
|      | `manufacturer` | string | 厂家 |
|      | `invoice_no` | string | 发票号 |
|      | `contract_no` | string | 合同号 |
| 业务 | `usage` | string | 资产用途（专用/通用/...） |
|      | `edu_direction` | string | 教育使用方向 |
|      | `vehicle_no` | string | 车牌号 |
|      | `project_name` | string | 项目名称 |
|      | `claim_status` | string | 领用状态（原表保留） |
|      | `status_raw` | string | 原"业务状态"原文（如"在用"） |
|      | `business_status` | enum | **新增**，见 3.4.1 |
|      | `remark` | string | 备注 |
| 媒体 | `image_urls` | string[] | 云存储 fileID 数组 |
| 元数据 | `current_borrow_id` | string | 当前进行中的借用申请 ID（LENT/PENDING 时有值） |
|        | `is_large` | boolean | 是否为大型资产（按金额阈值打标，由 `init` 或定时任务计算） |
|        | `created_at` / `updated_at` / `created_by` / `updated_by` | timestamp / string | 审计字段 |

**索引建议**：`asset_no` 唯一；`business_status`、`dept_code`、`is_large`、`created_at` 普通索引；`name` 可建模糊搜索辅助字段。

## 3.5 `ams_asset_log`（变动审计）

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | |
| `asset_id` | string | 关联 `ams_asset._id` |
| `asset_no` | string | 冗余，便于 Timeline 直接展示 |
| `op_type` | enum | `CREATE` / `UPDATE` / `BORROW` / `RETURN` / `STATUS_CHANGE` / `LOCATION_CHANGE` / `USER_CHANGE` / `SCRAP` |
| `changes` | object[] | `[{ field, before, after }, ...]` |
| `operator_id` | string | 管理员 / 教师 `_id` |
| `operator_role` | enum | `admin` / `teacher` / `system` |
| `operator_name` | string | 操作人姓名（冗余） |
| `related_id` | string | 关联单据（如借用申请 ID） |
| `remark` | string | 备注 |
| `created_at` | timestamp | |

**索引**：`asset_id` + `created_at`；`op_type`。

## 3.6 `ams_borrow_request`

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | |
| `serial_no` | string | 流水号（如 `OU-YYYYMMDD-HHMMSS-XXX`） |
| `teacher_id` | string | `ams_teacher._id` |
| `teacher_name` | string | 冗余 |
| `teacher_phone` | string | 冗余 |
| `items` | object[] | 借用资产明细：`{ asset_id, asset_no, name, brand, spec, unit_price, quantity, location_name, usage }` |
| `purpose` | string | 用途 |
| `expected_return_date` | string | 拟归还日期 |
| `signature_file_id` | string | 教师手写签名图片 fileID |
| `status` | enum | `PENDING` / `APPROVED` / `REJECTED` / `RETURNED` / `CANCELLED` |
| `reject_reason` | string | 拒绝原因 |
| `approved_by` | string | 审批管理员 `_id` |
| `approved_by_name` | string | 审批人姓名 |
| `approved_at` | timestamp | |
| `returned_at` | timestamp | 归还时间 |
| `voucher_qr_payload` | string | 凭证二维码内容（如申请 ID + 校验串） |
| `created_at` / `updated_at` | timestamp | |

**索引**：`serial_no` 唯一；`teacher_id` + `created_at`；`status`。

## 3.7 `ams_notice`

| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | string | |
| `title` | string | |
| `content` | string | 富文本或 Markdown |
| `level` | enum | `INFO` / `IMPORTANT` |
| `published` | boolean | 是否发布 |
| `published_at` | timestamp | |
| `created_by` | string | 管理员 `_id` |
| `created_at` / `updated_at` | timestamp | |

## 3.8 `ams_dict`

存放枚举字典（部门、国标分类、存放地点、资产用途等），结构示例：

| 字段 | 说明 |
|------|------|
| `category` | 字典类别，如 `department` / `location` / `category_national` |
| `code` | 编码 |
| `name` | 显示名 |
| `parent_code` | 上级编码（可选） |
| `order` | 排序 |
| `enabled` | 是否启用 |

**索引**：`category` + `code` 唯一。

## 3.9 编号生成规则（已锁：参考现有格式自动生成）

参考 `data/资产字段总表.md` 中的现有编号：

- **仪器机具类**：`YQJJ` + 年份(4 位) + 顺序号(6 位)，如 `YQJJ2026000431`
- **无形资产类**：`WXZC` + 年份 + 顺序号
- **通用资产**：`TY` + 年份 + 顺序号
- **建账单号**：`ZCJZ` + 年份 + 顺序号
- **借用流水号**：`OU-YYYYMMDD-HHMMSS-XXX`（3 位随机或顺序号）

生成由云函数完成：根据资产分类决定前缀，年份取当前年，顺序号取当年最大值 +1（建议使用单独的 `ams_seq` 集合或事务保证唯一）。

## 3.10 大型资产判定（建议）

- 默认阈值：`unit_price >= 50000`（5 万元）→ `is_large = true`
- 阈值存于 `ams_dict`（category=`config`, code=`large_asset_threshold`），管理员可调整。
- 录入或变动时由云函数自动打标。
