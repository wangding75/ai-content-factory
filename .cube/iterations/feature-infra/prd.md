# PRD：Iteration 0 — 项目脚手架与基础工程

> 原始需求来源：`docs/iteration-0-scaffold-requirements.md`  
> 产品蓝图约束：`docs/00-product-blueprint.md`  
> 迭代目标：建立 AI Content Factory 的工程底座，确保后续所有功能以通用内容工厂架构展开。

---

## 1. 功能概述

本迭代核心交付是**可运行、可扩展、可评审的工程骨架**，不包含任何业务功能。具体包含以下功能点：

1. **Monorepo 工程初始化**：基于 pnpm workspace 建立规范目录结构
2. **前端应用骨架**（apps/web-admin）：Next.js + TypeScript，提供默认首页或健康检查页
3. **后端应用骨架**（apps/api-server）：NestJS + TypeScript，提供 `/health` 接口
4. **核心包目录边界**：建立 core / content-packs / platform-adapters / shared 的代码边界
5. **配置与环境变量规范**：`.env.example` + 结构化日志
6. **数据库迁移工具初始化**：能够连接 PostgreSQL 并执行空迁移或状态检查
7. **CI 检查脚本**：install、lint、typecheck、test placeholder、db check

---

## 2. Functional Requirements

### 2.1 Monorepo 工程结构

| # | 需求 | 优先级 |
|---|------|--------|
| FR-001 | 项目根目录命名为 `ai-content-factory`，不得使用 `novel-factory` 作为系统根命名 | P0 |
| FR-002 | 使用 pnpm workspace 管理 monorepo，根目录有 `pnpm-workspace.yaml` | P0 |
| FR-003 | 必须存在以下顶层目录：`apps/`、`packages/`、`docs/`、`scripts/` | P0 |
| FR-004 | `packages/` 下必须包含：`core/`、`content-packs/novel-pack/`、`platform-adapters/`、`shared/` | P0 |
| FR-005 | `packages/core/` 中禁止出现 `book`、`chapter`、`novel` 等小说专属领域命名 | P0 |
| FR-006 | `packages/content-packs/novel-pack/` 可以出现 Novel 专属命名，但不得被 Core 反向依赖 | P0 |
| FR-007 | `packages/platform-adapters/` 仅保留适配器接口和目录占位，不实现平台自动化 | P0 |

**输入：** 无（工程初始化操作）  
**输出：** 符合上述规范的目录结构  
**异常：** 若目录命名违规，CI 检查必须报错并阻断

---

### 2.2 前端应用骨架（apps/web-admin）

| # | 需求 | 优先级 |
|---|------|--------|
| FR-010 | `apps/web-admin` 使用 Next.js + TypeScript 初始化 | P0 |
| FR-011 | 应用可以在本地正常启动（`pnpm dev` 或等效命令） | P0 |
| FR-012 | 启动后提供默认首页或项目信息页，内容可以是占位内容 | P0 |

**输入：** 用户执行启动命令  
**输出：** 浏览器可访问的默认页面，显示项目名称或占位内容  
**异常：** 启动失败时控制台应有明确错误信息

---

### 2.3 后端应用骨架（apps/api-server）

| # | 需求 | 优先级 |
|---|------|--------|
| FR-020 | `apps/api-server` 使用 NestJS + TypeScript 初始化 | P0 |
| FR-021 | 应用可以在本地正常启动（`pnpm start:dev` 或等效命令） | P0 |
| FR-022 | 提供 `GET /health` 接口，返回服务状态信息 | P0 |
| FR-023 | `/health` 接口响应格式为 JSON，至少包含 `status` 字段，值为 `"ok"` | P0 |

**输入：** `GET /health`（无需请求体）  
**输出：** `{ "status": "ok" }`（HTTP 200）  
**异常：** 服务未启动时连接被拒绝，不在应用层处理

---

### 2.4 配置与环境变量

| # | 需求 | 优先级 |
|---|------|--------|
| FR-030 | 根目录存在 `.env.example`，包含以下占位配置项：应用端口、数据库连接、日志级别、LLM Provider 占位 | P0 |
| FR-031 | `.env` 不提交到 git（`.gitignore` 中忽略） | P0 |
| FR-032 | `apps/api-server` 在启动时从环境变量加载配置，缺少必要配置时输出明确错误提示 | P0 |
| FR-033 | 日志采用结构化格式，每条日志至少包含字段：`timestamp`、`level`、`module`、`message` | P1 |

**输入：** `.env` 文件（基于 `.env.example` 创建）  
**输出：** 应用以配置值运行，日志以结构化格式输出  
**异常：** 缺少 `DATABASE_URL` 等必要配置时，启动阶段抛出明确错误，不能静默启动

---

### 2.5 数据库迁移工具

| # | 需求 | 优先级 |
|---|------|--------|
| FR-040 | 集成数据库迁移工具（如 TypeORM migration 或 Prisma migrate），能连接 PostgreSQL | P0 |
| FR-041 | 能够执行空迁移（无业务表）或迁移状态检查命令 | P0 |
| FR-042 | 本迭代不创建任何业务表（不含 content_project、content_item 等） | P0 |

**输入：** 迁移命令（如 `pnpm db:migrate` 或等效命令）  
**输出：** 命令执行成功，返回迁移状态（无待执行迁移）  
**异常：** 数据库连接失败时输出明确错误信息，不能静默失败

---

### 2.6 CI 检查脚本

| # | 需求 | 优先级 |
|---|------|--------|
| FR-050 | CI 脚本包含 `install` 步骤：安装所有依赖 | P0 |
| FR-051 | CI 脚本包含 `lint` 步骤：对所有包执行 ESLint 检查 | P0 |
| FR-052 | CI 脚本包含 `typecheck` 步骤：对所有包执行 TypeScript 类型检查 | P0 |
| FR-053 | CI 脚本包含 `test` 或 `test:placeholder` 步骤：本迭代无业务测试，占位通过即可 | P0 |
| FR-054 | CI 脚本包含 `db:check` 或 `migration:check` 步骤：验证数据库连接或迁移状态 | P0 |
| FR-055 | 所有 CI 步骤可通过单一入口脚本触发（如 `scripts/ci.sh` 或 `package.json` scripts） | P1 |

**输入：** CI 系统或开发者本地触发  
**输出：** 各步骤通过，整体退出码为 0  
**异常：** 任意步骤失败时，退出码非 0，并输出步骤名和失败原因

---

### 2.7 文档目录结构

| # | 需求 | 优先级 |
|---|------|--------|
| FR-060 | `docs/` 目录下必须包含：`docs/product/`、`docs/architecture/`、`docs/iterations/`、`docs/content-packs/` | P1 |
| FR-061 | `docs/` 根目录中存在 `00-product-blueprint.md`、`00-product-blueprint-README.md`、`iteration-README.md`、`iteration-0-scaffold-requirements.md` | P0 |
| FR-062 | Phase 0 历史资料（如有）仅归档在 `docs/content-packs/novel-pack/` 或等效目录，不进入 `packages/core/` | P1 |

---

## 3. Non-Functional Requirements

| 维度 | 要求 |
|------|------|
| 命名规范 | `packages/core/` 中所有文件名、类名、函数名、变量名禁止包含 `book`、`chapter`、`novel`（大小写不敏感）；违规由 CI 扫描脚本检测 |
| 可重复构建 | `pnpm install` + `pnpm build`（或等效命令）在全新环境中可成功执行，不依赖本地全局安装 |
| 环境隔离 | 敏感配置（DB 密码、API Key）只通过 `.env` 传入，`.env` 不提交 git |
| 日志结构化 | 结构化日志格式（JSON 或等效），便于后续接入日志聚合系统 |

---

## 4. 验收标准

| # | 验收项 | 验证方式 |
|---|--------|---------|
| AC-001 | 项目根目录名为 `ai-content-factory` | `ls` 或 `git remote -v` 路径检查 |
| AC-002 | `apps/web-admin` 可本地启动，浏览器可访问默认页 | 本地 `pnpm dev` 启动后访问 localhost |
| AC-003 | `apps/api-server` 可本地启动，`GET /health` 返回 `{ "status": "ok" }` | `curl localhost:{port}/health` |
| AC-004 | `packages/core/`、`packages/content-packs/novel-pack/`、`packages/platform-adapters/`、`packages/shared/` 目录存在 | `ls packages/` |
| AC-005 | Core 目录扫描不含 `book`、`chapter`、`novel` 命名 | CI 脚本 grep 检查或人工扫描 |
| AC-006 | `.env.example` 存在，本地应用可从 `.env` 加载基础配置 | 对比 `.env.example` 字段，启动验证 |
| AC-007 | PostgreSQL 连接检查或空迁移命令可成功执行 | `pnpm db:check` 或等效命令退出码 0 |
| AC-008 | `pnpm lint`、`pnpm typecheck`、`pnpm test`（或占位）退出码为 0 | 命令行直接运行 |
| AC-009 | 不存在任何业务表（content_projects、content_items 等） | 数据库表列表检查 |
| AC-010 | `docs/` 目录中存在规定的蓝图和迭代文档 | `ls docs/` |

---

## 5. Out of Scope

本迭代**明确不做**：

- 业务页面开发（不含登录、内容管理、数据看板等任何业务功能）
- Agent 执行能力
- 内容生成能力
- 发布队列和数据看板
- ContentProject / ContentType / ContentItem 业务模型和数据表
- WorkflowTemplate / WorkflowRun / AgentTask / LLMCallLog 业务模型和数据表
- Novel Pack 的世界观、人物、大纲、章节等具体业务能力
- 平台适配器的实际平台对接（仅目录和接口占位）
- 全自动 CI/CD 流水线（仅本地可执行的脚本）
- 用户认证和权限管理

---

## 6. 依赖说明

| 依赖 | 说明 |
|------|------|
| PostgreSQL | 本地开发环境需要有可连接的 PostgreSQL 实例（版本 14+） |
| Node.js 20 LTS | 本地开发环境需要 Node.js 20 LTS |
| pnpm 8+ | 全局安装 pnpm |
