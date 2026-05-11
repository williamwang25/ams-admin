# AMS 项目上下文（管理端）

> **本文件是 AMS 项目在 `admin/` 工作区的精简入口**。
> 当你单独打开 `admin/` 文件夹时，**先读本文，再读 `AGENTS.md` / `.windsurf/rules/`**。
> 完整规则与文档以根仓库 `d:\Code\AMS\` 为准；本目录通过 junction 已挂载 `docs/`、`.memory/`、`data/`。
>
> **⚠️ 新会话第一步：读 `.memory/HANDOFF.md`**（接力上下文：当前里程碑、用户最新决策、下一步动作、避坑提示）。

## 项目身份

- **AMS** = 资产管理系统（学校资产入库 / 借还 / 看板）。
- 本工作区 (`admin/`) = **管理员 Web 端**，Vue3 + Vite + Tailwind + DaisyUI + CloudBase JS SDK。
- 兄弟工作区 (`app/`) = 教师端微信小程序（unibest + wot-ui v2），三端共用同一份 CloudBase 数据库与云函数。
- 主题色：主 `#0096C2`（BJUT 蓝），辅 `#006B8F`。**禁止 emoji**。

## 必读文档（任何动作前先读）

> 通过 junction 挂载，路径直接以 `admin/` 为基准。

1. `docs/README.md` — 文档导航
2. `docs/01-overview.md` — 项目目标、范围
3. `docs/02-architecture.md` — 三端架构、读写路径（**读 SDK / 写云函数**）
4. `docs/03-data-model.md` — 数据库字段事实唯一源
5. `docs/04-api-spec.md` — 云函数契约 + SDK 直连白名单
6. `docs/05-admin-features.md` — **管理端功能拆解（本工作区主战场）**
7. `docs/07-workflows.md` — 业务流程与状态机
8. `docs/09-dev-conventions.md` — 命名、目录、协作守则
9. `.memory/PROGRESS.md` — 当前进度
10. `.memory/CHANGELOG.md` — 重要变更

## 工程铁律（与根仓库 `AGENTS.md` 同源）

1. **字段事实唯一源** = `docs/03-data-model.md`。**改字段先改文档再改代码**。
2. **三端字段一致**：管理端 / 教师端 / 云函数同名字段必须一致。
3. **写操作走云函数，读操作走 SDK**（详见 `docs/02-architecture.md` 2.2）。
4. **集合命名前缀** `ams_xxx`。
5. **业务状态枚举** `IDLE` / `IN_USE` / `LENT` / `PENDING` / `MAINTAIN` / `SCRAPPED`，不可随意新增。
6. **借用申请状态** `PENDING` / `APPROVED` / `REJECTED` / `CANCELLED` / `RETURNED`。
7. **模块边界即 agent 边界**：`admin/src/modules/<module>/` 由该模块独占编辑；详见 `docs/02-architecture.md` 2.3 与 `docs/09-dev-conventions.md`。
8. **TypeScript 严格**：禁止 `any` / `as any` / `@ts-ignore` / `@ts-nocheck`（详见 `admin/AGENTS.md` 的 Engineering constitution）。
9. **UI 不含 emoji**：图标用 `lucide-vue-next`；DaisyUI 主题需扩展 `primary=#0096C2` / `primary-focus=#006B8F`。
10. **完成前自验证**：`tsc --noEmit` / lint / build；触及路由 / 表单 / 异步流时手动跑通。

## 文件来源说明

`admin/` 下这些文件夹通过 Windows 目录联接（junction）挂载自父仓库：

| 路径 | 真实位置 | 用途 |
|------|----------|------|
| `admin/docs/` | `d:\Code\AMS\docs\` | 项目需求与设计文档 |
| `admin/.memory/` | `d:\Code\AMS\.memory\` | 进度与变更日志 |
| `admin/data/` | `d:\Code\AMS\data\` | 业务原始资料（资产字段总表、借用登记表） |

**写入这些路径相当于写入根仓库**，请直接编辑（无需复制粘贴）。

## CloudBase 模板规则

`admin/AGENTS.md`（4 万字）是 CloudBase AI ToolKit 自带的通用开发规则，权威性高于一般约定，但**遇与 `docs/` 锁定的业务决策冲突时，优先以 `docs/` 为准，实现细节遵循 CloudBase 规则**。

子目录附加规则（按需读）：

- 写云函数：`rules/cloud-functions/`
- 写 UI：`rules/ui-design/`
- 接 AI 模型：`rules/ai-model-cloudbase/`、`rules/ai-model-web/`
- 数据库 SDK：`rules/no-sql-web-sdk/`
- 鉴权：`rules/auth-tool/`、`rules/auth-web/`

## 用户准备 git 提交时的强制动作

当用户表达 **"提交 / commit / 推送 / push / 提到 GitHub / 提一下代码"** 等意图时，**生成 commit 之前**必须：

1. 更新 `.memory/PROGRESS.md`：本会话已完成的工作追加到"已完成"段。
2. 评估改动是否触发 `.memory/CHANGELOG.md` 追加（任一即触发）：
   - 数据库字段 / 集合 / 枚举增删改
   - 云函数接口变化
   - 路由 / 页面增删
   - 业务流程或状态机变更
   - 重要依赖 / 配置变更
3. 把 `.memory/` 下的更新一并纳入本次 commit。
4. Commit message 用 Conventional Commits（`feat(asset): xxx` / `fix(borrow): xxx` / `docs: xxx` / `chore(memory): update progress`）。

> Agent 不主动执行 `git commit` / `git push`；只准备好待提交内容。
