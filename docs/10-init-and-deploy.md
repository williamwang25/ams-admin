# 10 初始化与部署

> **作用**：说明系统首次启动的初始化、本地开发、部署上线步骤。
> **读者**：DevOps / 上线负责人 / 新加入开发者。
> **编辑边界**：实际命令行步骤可由 agent 优化；初始化数据范围与 `init` 云函数行为以 `04-api-spec.md` 为准。

## 10.1 环境准备

- Node.js ≥ 18
- pnpm ≥ 7.30（教师端要求）
- 微信开发者工具（教师端调试）
- 腾讯云 CloudBase CLI（部署）
- 已开通的 CloudBase 环境，环境 ID 见根目录 `.env`：`ams-d8grnwwy6d8da557f`

## 10.2 初始化云函数 `init`

### 10.2.1 部署 `init` 函数

```bash
# 在 cloudfunctions/init 目录
tcb fn deploy init
```

或通过 CloudBase 控制台上传压缩包。

### 10.2.2 配置环境变量

| 变量 | 说明 |
|------|------|
| `INIT_SECRET` | 调用初始化所需的秘钥，部署后随机生成一串 |
| `DEFAULT_SUPER_ADMIN_USERNAME` | 超管默认账号，如 `admin` |
| `DEFAULT_SUPER_ADMIN_PASSWORD` | 超管默认密码（首次登录后强制改密） |
| `JWT_SECRET` | 签发 token 的秘钥 |

### 10.2.3 调用初始化

控制台或命令行调用：

```bash
tcb fn invoke init --params '{"action":"initialize","data":{"secret":"<INIT_SECRET>"}}'
```

初始化内容：

1. 创建超级管理员账号（`ams_admin`）。
2. 写入字典 `ams_dict`：
   - `department`：常见学院 / 部门
   - `category_national`：国标分类
   - `usage`：资产用途（专用 / 通用 / 教学 / 科研 / 后勤）
   - `business_status`：业务状态映射（IDLE 等）
   - `config`：`large_asset_threshold = 50000`
3. （可选）创建一名示例教师账号，便于调试。

### 10.2.4 导入示例资产（可选）

```bash
tcb fn invoke init --params '{"action":"seedAssets","data":{"secret":"<INIT_SECRET>"}}'
```

导入 `data/资产字段总表.md` 中的示例资产用于演示。

> 初始化完成后，建议在 CloudBase 控制台移除 `INIT_SECRET` 或重新生成，防止被误调用。

## 10.3 管理端本地开发

```bash
# 在 admin/
npm install
# 配置 src/utils/cloudbase.ts 中的 ENV_ID（若未自动从根 .env 读取）
npm run dev
# 默认 http://localhost:5173
```

构建与部署：

```bash
npm run build           # 产物在 admin/dist/
tcb hosting deploy admin/dist -e <env-id>
```

或通过 CloudBase 控制台手动上传 `dist/`。

## 10.4 教师端本地开发

```bash
# 在 app/
pnpm install
pnpm dev:mp             # 编译微信小程序到 dist/dev/mp-weixin
```

随后用微信开发者工具导入 `app/dist/dev/mp-weixin`：

- 选择"导入项目"，AppID 可使用测试号或公司小程序 AppID。
- 工具内可调试、预览。

构建：

```bash
pnpm build:mp           # 产物在 app/dist/build/mp-weixin
# 在微信开发者工具中点击"上传"提交审核
```

## 10.5 云函数部署

```bash
# 在 cloudfunctions/<func> 目录
tcb fn deploy <func>
```

建议写一个根级脚本 `scripts/deploy-functions.sh` 批量部署所有函数。

## 10.6 数据库初次配置

- 在 CloudBase 控制台 → 数据库，新建以下集合（或由 `init` 自动创建）：
  - `ams_admin`、`ams_teacher`、`ams_asset`、`ams_asset_log`、`ams_borrow_request`、`ams_notice`、`ams_dict`、`ams_seq`（编号顺序号）
- 配置安全规则（详见 `04-api-spec.md` 4.4）。
- 设置索引：
  - `ams_admin.username` 唯一
  - `ams_teacher.username` 唯一、`openid` 唯一（sparse）
  - `ams_asset.asset_no` 唯一
  - `ams_borrow_request.serial_no` 唯一
  - 其余按 03 章建议建立普通索引

## 10.7 云存储配置

- 创建目录：`asset/`、`signature/`
- 安全规则：
  - `asset/*`：所有登录用户可读，仅管理员可写。
  - `signature/{teacher_id}/*`：仅本人 + 管理员可读，仅本人可写。

## 10.8 上线检查清单

- [ ] `init` 已调用，超管可登录
- [ ] 所有云函数部署完毕
- [ ] 数据库索引与安全规则就绪
- [ ] 云存储目录与权限就绪
- [ ] 管理端已部署到静态托管，访问域名可用
- [ ] 教师端小程序版本已上传并提审
- [ ] `.env` / 秘钥未泄露到代码仓库
- [ ] 烟雾测试：管理员登录 → 入库一条资产 → 教师提交借用 → 管理员审批 → 教师查看凭证 → 教师归还
