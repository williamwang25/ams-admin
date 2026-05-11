# 10 初始化与部署

> **作用**：说明系统首次启动的初始化、本地开发、部署上线步骤。
> **读者**：DevOps / 上线负责人 / 新加入开发者。
> **编辑边界**：实际命令行步骤可由 agent 优化；一期鉴权以 `auth` 云函数环境变量为准，后期重启 `init` 设计时以 `04-api-spec.md` 4.2.7 为准。

## 10.1 环境准备

- Node.js ≥ 18
- pnpm ≥ 7.30（教师端要求）
- 微信开发者工具（教师端调试）
- 腾讯云 CloudBase CLI（部署）
- 已开通的 CloudBase 环境，环境 ID 见根目录 `.env`：`ams-d8grnwwy6d8da557f`

## 10.2 部署鉴权云函数 `auth`

一期鉴权采用精简方案：固定账号 + 固定 token，不依赖数据库与 JWT。原设计中的 `init` 云函数（创集合 + 超管 hash + 字典种子）一期不实施，后期补多管理员 / 教师端时再恢复（可从 git 历史取回）。

### 10.2.1 部署 `auth` 函数

```bash
# 在 admin/cloudfunctions/auth 目录
tcb fn deploy auth
```

或通过 CloudBase 控制台上传。该函数无外部依赖（`package.json` 的 `dependencies` 为空）。

### 10.2.2 （可选）配置环境变量

云函数未设置环境变量时会回落到开发默认值（`admin` / `admin123` / `ams-dev-token-change-me`）并在日志里打 warn；产品环境请覆盖：

| 变量 | 说明 |
|------|------|
| `ADMIN_USERNAME` | 管理员账号 |
| `ADMIN_PASSWORD` | 管理员密码 |
| `ADMIN_TOKEN` | 登录成功后返给前端的 token 字符串，后续云函数校验鉴权亦比对此值 |

### 10.2.3 初始化集合（后期）

一期仅需要 `auth` 云函数，暂不需要创建任何集合。开始实现 `cloudfunctions/asset/` 等业务云函数时，再在 CloudBase 控制台手动创建对应集合（见 10.6）。

> 后期重新启用 `init` 云函数时可参考 `04-api-spec.md` 4.2.7 原设计。

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

## 10.6 数据库初次配置（按需手动创建）

一期遵循「需要哪个集合就手动建哪个」原则，不提前建全部，也不初始化安全规则：

- **集合**：在 CloudBase 控制台 → 数据库，随业务模块上线逐个创建。全集合列表：`ams_admin`、`ams_teacher`、`ams_asset`、`ams_asset_log`、`ams_borrow_request`、`ams_notice`、`ams_dict`、`ams_seq`。
- **安全规则**：一期不作重点。云函数是唯一读写入口，全部走服务端身份，默认权限即可工作。**后期**若启用 SDK 直连（见 `04-api-spec.md` 4.4）再针对需要的集合配置。
- **索引**：仅为实际高频查询字段创建，不提前一次性齐全：
  - `ams_admin.username` 唯一（多管理员阶段启用）
  - `ams_teacher.username` 唯一、`openid` 唯一（sparse，教师端阶段启用）
  - `ams_asset.asset_no` 唯一（`asset` 云函数上线后启用）
  - `ams_borrow_request.serial_no` 唯一（`borrow` 云函数上线后启用）

## 10.7 云存储配置

- 一期创建目录：需要上传时再手动建 `asset/`、`signature/`。
- **一期存储权限保持默认**，不额外配置安全规则；上传 `fileID` 由云函数落库，读取走云函数包装后返回临时 URL。
- **后期收口**参考原设计：
  - `asset/*`：所有登录用户可读，仅管理员可写。
  - `signature/{teacher_id}/*`：仅本人 + 管理员可读，仅本人可写。

## 10.8 上线检查清单

- [ ] `auth` 云函数已部署，`ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_TOKEN` 环境变量在产品环境已覆盖默认值
- [ ] 业务云函数（`asset` / `borrow` / `notice` / …）已部署
- [ ] 该阶段需要的数据库集合已手动创建，高频字段已加索引
- [ ] 上传场景出现后，云存储目录已手动创建
- [ ] 管理端已部署到静态托管，访问域名可用
- [ ] 教师端小程序版本已上传并提审（及后期阶段）
- [ ] `.env` / 秘钥未泄露到代码仓库
- [ ] 烟雾测试：管理员登录 → 入库一条资产 → 教师提交借用 → 管理员审批 → 教师查看凭证 → 教师归还
- [ ] **安全规则不作为上线阻塞项**，后期需要时再专项补齐
