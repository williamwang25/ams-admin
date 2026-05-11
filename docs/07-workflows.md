# 07 业务流程与状态机

> **作用**：用文字与伪流程图描述关键业务的执行路径与状态流转。
> **读者**：所有需要理解业务全貌的成员。
> **编辑边界**：流程可优化但状态枚举值需与 `03-data-model.md` 保持一致。

## 7.1 资产业务状态机

```
                ┌──── changeStatus → MAINTAIN ────┐
                │                                  │
   CREATE → IDLE ←──────── borrow.return ──────── LENT
              │                                    ▲
              │  borrow.submit                     │
              ▼                                    │
            PENDING ──── borrow.approve ───────────┘
              │
              └──── borrow.reject ──→ IDLE
              
   任意状态 ── changeStatus → SCRAPPED（终态，不可逆）
```

- `IDLE` 闲置（默认入库状态，可借）
- `IN_USE` 使用中（管理员可手动设置；不参与借用流程）
- `PENDING` 待审批（借用申请已提交）
- `LENT` 借出中
- `MAINTAIN` 维修（不可借）
- `SCRAPPED` 报废（终态）

## 7.2 借用申请状态机

```
   submit → PENDING ── approve ──→ APPROVED ── return ──→ RETURNED
              │
              ├── reject ──→ REJECTED
              └── cancel ──→ CANCELLED
```

| 状态 | 说明 |
|------|------|
| `PENDING` | 已提交，等待管理员审批 |
| `APPROVED` | 已通过，凭证生效，资产已 LENT |
| `REJECTED` | 已拒绝，资产回到 IDLE |
| `CANCELLED` | 教师主动取消（仅 PENDING 可取消） |
| `RETURNED` | 已归还 |

## 7.3 入库流程

```
管理员 → 资产/新建 → 填写表单（含图片上传）
       → 提交 → asset.create
            ├── 生成 asset_no（按分类前缀 + 年份 + 顺序号）
            ├── 写入 ams_asset (business_status=IDLE, is_large=计算)
            └── 写 ams_asset_log (op_type=CREATE)
       → 列表显示新资产
```

## 7.4 变动流程（位置 / 使用人 / 状态）

```
管理员 → 资产详情 → 选择变动类型
       → 提交 → asset.changeLocation / changeUser / changeStatus
            ├── 校验：LENT / PENDING 状态不允许使用人变动
            ├── 更新 ams_asset
            └── 写 ams_asset_log (op_type=LOCATION_CHANGE / USER_CHANGE / STATUS_CHANGE)
       → Timeline 出现新条目
```

## 7.5 借用全流程

```
教师 → 借用主页 → 搜索/选择资产 → 加入借物车
     → 填写申请表（用途/归还日期/签名）
     → 上传签名图片 → 拿到 fileID
     → borrow.submit
          ├── 校验资产 business_status=IDLE
          ├── 资产 IDLE→PENDING，current_borrow_id 写入
          ├── 创建 ams_borrow_request (status=PENDING, serial_no)
          └── 写 ams_asset_log (op_type=BORROW, related_id=borrow_id, 备注=申请待审批)

管理员 → 审批列表 → 详情
       → 通过：borrow.approve
            ├── ams_borrow_request: status=APPROVED, approved_by/at
            ├── 生成 voucher_qr_payload
            ├── 资产 PENDING→LENT
            └── 写 ams_asset_log (op_type=BORROW)
       → 拒绝：borrow.reject
            ├── ams_borrow_request: status=REJECTED, reject_reason
            ├── 资产 PENDING→IDLE, current_borrow_id=null
            └── 写 ams_asset_log

教师 → 凭证页 → 出示给管理员 / 自查

到归还时：
教师 → 归还页 → 选择借用单 → 确认归还
     → borrow.return
          ├── ams_borrow_request: status=RETURNED, returned_at
          ├── 资产 LENT→IDLE, current_borrow_id=null
          └── 写 ams_asset_log (op_type=RETURN)
```

## 7.6 通知公告流程

```
管理员 → 通知管理 → 新建 → 保存草稿（published=false）
       → 编辑 → 发布（published=true, published_at=now）
教师端首页 → 拉取 published=true 最近 N 条
```

## 7.7 初始化流程

```
开发者 → 部署云函数 → 设置 INIT_SECRET 环境变量
       → 调用 init.initialize { secret }
            ├── 创建超管账号（环境变量配置默认账号密码）
            ├── 写入字典：部门 / 国标分类 / 资产用途 / 业务状态 / 配置阈值
            └── （可选）创建示例教师账号
       → 调用 init.seedAssets { secret }（可选）
            └── 导入 data/资产字段总表.md 示例行
       → 控制台关闭 init 触发器或改密
```

## 7.8 错误恢复

- **借用提交后管理员长期不审批**：教师可在凭证页发起"催办"（一期不实现，仅状态显示提交时间）。
- **资产 PENDING 卡住**：管理员可在审批列表手动拒绝，使资产回 IDLE。
- **签名上传失败**：前端保留本地草稿，重试上传。
