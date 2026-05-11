# Design：Iteration 0 — 项目脚手架与基础工程

## 1. 概述

本次设计为 AI Content Factory 建立完整的工程底座。当前代码库仅有 `docs/` 目录，属于完全绿地（greenfield）初始化。

**整体方案**：基于 pnpm workspace 建立 monorepo，创建 NestJS（api-server）和 Next.js（web-admin）应用骨架，以及 core / content-packs / platform-adapters / shared 四个包目录边界。数据库迁移工具选用 Prisma，结构化日志选用 nestjs-pino，配置校验选用 @nestjs/config + Joi，CI 命名边界检测通过 grep 脚本实现。

**核心约束**：
- `packages/core/` 禁止出现 `book`、`chapter`、`novel` 命名（CI grep 强制检测）
- 本迭代无任何业务表和业务逻辑
- 所有敏感配置通过 `.env` 传入，`.env` 不提交 git

## Impact Analysis

| 模块 | 影响类型 | 改动范围 | 对调用方影响 |
|------|---------|---------|------------|
| apps/api-server | 新增 | NestJS 应用全新创建 | 无现有调用方 |
| apps/web-admin | 新增 | Next.js 应用全新创建 | 无现有调用方 |
| packages/shared | 新增 | 空包结构，仅占位 | 无现有调用方 |
| packages/core | 新增 | 空包结构，命名约束 | 无现有调用方 |
| packages/content-packs/novel-pack | 新增 | 空包结构 | 无现有调用方 |
| packages/platform-adapters | 新增 | 目录占位，仅接口声明 | 无现有调用方 |
| 根目录配置 | 新增 | pnpm-workspace.yaml, tsconfig.base.json, .env.example | 无 |
| scripts/ci.sh | 新增 | CI 执行脚本，含命名边界检测 | 无 |
| docs/ | 修改 | 新增子目录结构 | 无 |

**接口兼容性**：全新项目，无现有接口。

**数据兼容性**：全新项目，无现有数据。

## Flow Design

### 应用启动流程（api-server）

```
pnpm start:dev
  → main.ts: NestFactory.create(AppModule)
  → ConfigModule.forRoot(): 读取 .env, Joi 校验
      缺少 DATABASE_URL → 抛出明确错误，进程退出
  → LoggerModule.forRoot(): 注册 Pino JSON 日志
  → PrismaModule: PrismaService.onModuleInit() 连接 PostgreSQL
      连接失败 → 记录结构化错误日志，进程退出
  → HealthModule: 注册 HealthController
  → 应用监听 PORT（默认 3000）
```

### GET /health 请求流程

```
HTTP GET /health
  → HealthController.check()
  → HealthService.getStatus()
  → 返回 { status: "ok" }，HTTP 200
```

### CI 检查流程

```
scripts/ci.sh
  ├── step: install       → pnpm install
  ├── step: lint          → pnpm lint (ESLint, 全部包)
  ├── step: typecheck     → pnpm typecheck (tsc --noEmit, 全部包)
  ├── step: test          → pnpm test (vitest run, 占位通过)
  ├── step: root-name     → 验证 package.json name == "ai-content-factory"
  │                         不符 → 输出 "STEP FAILED: root-name-check"，exit 1
  ├── step: naming        → if grep -riqE 'book|chapter|novel' packages/core/src/ 2>/dev/null
  │                         发现匹配 → 输出违规信息，exit 1
  └── step: db:check      → pnpm db:check (prisma migrate status)
                            连接失败 → 输出错误信息，exit 1
```

### 异常流程

| 场景 | 处理方式 |
|------|---------|
| DATABASE_URL 未设置 | ConfigModule Joi 校验失败，启动时打印 ValidationError，进程退出 |
| PostgreSQL 连接失败 | PrismaService 连接异常，结构化日志记录错误，进程退出 |
| core 命名违规 | CI grep 检测到匹配，输出违规文件路径，exit 1 |
| 任意 CI 步骤失败 | ci.sh 输出 "STEP FAILED: {step_name}" 到 stderr，exit 1 |

## Table Design

本迭代不创建任何业务表（FR-042）。

Prisma 初始化后仅存在框架自动管理的迁移记录表：

| 表名 | 说明 |
|------|------|
| `_prisma_migrations` | Prisma 自动创建，记录迁移历史 |

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 本迭代无业务 model — 业务表从 Iteration 1 开始添加
```

## API Design

### GET /health

**Method & Path**：`GET /health`

**描述**：服务健康检查，验证 api-server 可访问。

**请求参数**：无

**响应格式**：

```json
// HTTP 200
{
  "status": "ok"
}
```

**错误码**：

| HTTP 状态码 | 场景 |
|------------|------|
| 200 | 服务正常运行 |
| 503 | 服务依赖不可用（后续迭代扩展，本迭代不实现） |

> 注：服务未启动时 TCP 连接被拒绝，不在应用层定义错误码。

**遵循 api-spec.md**：本迭代 `/health` 直接返回 `{ "status": "ok" }`，不套 `{ success, data, message }` 包装（HealthCheck 业界惯例），后续业务 API 遵循 api-spec.md 包装格式。

## Module Design

### apps/api-server

**职责**：REST API 入口，本迭代提供健康检查和基础框架配置。

**目录结构**：
```
apps/api-server/
├── src/
│   ├── main.ts                  # 启动入口
│   ├── app.module.ts            # 根 Module
│   ├── config/
│   │   └── configuration.ts    # Joi 校验 schema
│   ├── health/
│   │   ├── health.module.ts
│   │   ├── health.controller.ts
│   │   ├── health.service.ts
│   │   └── dto/
│   │       └── health-status.dto.ts
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

**接口定义**：

```typescript
// health.service.ts
interface IHealthService {
  getStatus(): HealthStatusDto;
}

// health.controller.ts
// GET /health → IHealthService.getStatus() → HealthStatusDto
```

**模块间依赖**：
```
AppModule
  ├── ConfigModule (global, @nestjs/config + Joi)
  ├── LoggerModule (global, nestjs-pino)
  ├── PrismaModule (global)
  └── HealthModule → HealthController → HealthService
```

**与现有模块集成**：全新模块，无现有集成。

---

### apps/web-admin

**职责**：Admin UI，本迭代提供可访问的默认首页，显示项目名称占位。

**目录结构**：
```
apps/web-admin/
├── src/
│   └── app/
│       ├── layout.tsx
│       └── page.tsx             # 默认首页
├── package.json
├── tsconfig.json
└── next.config.ts
```

**接口定义**：

```typescript
// app/page.tsx
// 默认 React Server Component，渲染项目名称占位页
export default function HomePage(): JSX.Element
```

**与现有模块集成**：全新应用，无集成。

---

### packages/shared

**职责**：共享类型、工具和配置，供其他所有模块引用。本迭代仅建立目录边界。

```
packages/shared/
├── src/
│   └── index.ts     # 空导出，占位
├── package.json
└── tsconfig.json
```

---

### packages/core

**职责**：核心领域逻辑（Iteration 1+ 实现）。本迭代仅建立目录边界，**严格禁止 book/chapter/novel 命名**。

```
packages/core/
├── src/
│   └── index.ts     # 空导出，占位
├── package.json
└── tsconfig.json
```

---

### packages/content-packs/novel-pack

**职责**：Novel 专属 Agent 和 Workflow（Iteration 1+ 实现）。本迭代仅建立目录边界，允许 Novel 专属命名，不得被 core 反向依赖。

```
packages/content-packs/novel-pack/
├── src/
│   └── index.ts     # 空导出
├── package.json
└── tsconfig.json
```

---

### packages/platform-adapters

**职责**：平台适配器接口定义（Iteration 1+ 实现）。本迭代仅目录占位。

```
packages/platform-adapters/
├── package.json     # name: "@ai-content-factory/platform-adapters", private: true（确保 pnpm workspace 可识别）
└── README.md        # 占位说明
```

> `pnpm-workspace.yaml` 的 glob 需覆盖 `packages/platform-adapters`，因此需提供最小 `package.json`（含 `name` 和 `private: true`），否则 pnpm 解析 workspace 时可能报错。

---

### 根目录

**职责**：Monorepo 配置、CI 脚本、环境变量模板。

```
ai-content-factory/
├── pnpm-workspace.yaml          # workspace 声明
├── package.json                 # root scripts: lint, typecheck, test, ci:check
├── tsconfig.base.json           # 共享 TS 编译配置
├── .env.example                 # 环境变量模板
├── .gitignore                   # 含 .env
└── scripts/
    └── ci.sh                    # CI 统一入口脚本
```

## Output Contract

### 1. GET /health

| 字段 | 值 |
|------|---|
| 输入 | HTTP GET /health（无请求体） |
| 输出 | `{ "status": "ok" }`，HTTP 200 |
| 产出类型 | Web API 响应 |
| 功能类型 | Web/API |
| type id | `web-e2e` |
| 是否跨组件 | 否（HealthController → HealthService，同属 api-server） |
| 正确性规则 | status 字段值必须为字符串 "ok"；HTTP 状态码必须为 200 |
| 测试规范 | `standards/testing/web-e2e.md` |

---

### 2. pnpm db:check

| 字段 | 值 |
|------|---|
| 输入 | DATABASE_URL 环境变量 |
| 输出 | 退出码 0 + stdout 提示连接成功；连接失败时退出码非 0 + stderr 错误信息 |
| 产出类型 | 命令执行结果 |
| 功能类型 | CLI |
| type id | `cli` |
| 是否跨组件 | 否 |
| 正确性规则 | PostgreSQL 可达时退出码必须为 0；不可达时退出码必须非 0 且 stderr 含明确错误信息 |
| 测试规范 | `standards/testing/cli.md` |

---

### 3. scripts/ci.sh（CI 全量检查）

| 字段 | 值 |
|------|---|
| 输入 | 项目代码库（各步骤依次触发） |
| 输出 | 全部步骤通过 → 退出码 0；任意步骤失败 → 退出码 1 + "STEP FAILED: {step_name}" 到 stderr |
| 产出类型 | 命令执行结果 |
| 功能类型 | CLI + 跨组件集成 |
| type id | `cli` |
| 是否跨组件 | 是 |
| 组件链路 | ci.sh → pnpm install → pnpm lint → pnpm typecheck → pnpm test → root-name-check → naming-check → pnpm db:check |
| 正确性规则 | 任意子步骤失败即终止且退出非 0；命名检测发现 book/chapter/novel 即失败；所有子步骤通过时整体退出码为 0 |
| 测试规范 | `standards/testing/cli.md`、`standards/testing/integration.md` |

---

### 4. apps/web-admin 首页

| 字段 | 值 |
|------|---|
| 输入 | 浏览器访问 localhost:{WEB_PORT}（默认 3001） |
| 输出 | HTTP 200，页面含项目名称 "AI Content Factory" |
| 产出类型 | Web 页面 |
| 功能类型 | Web/UI |
| type id | `web-e2e` |
| 是否跨组件 | 否 |
| 正确性规则 | 页面可访问（HTTP 200）；页面内容包含 "AI Content Factory" 字样 |
| 测试规范 | `standards/testing/web-e2e.md` |

## Change Log

| 模块/文件 | 变更类型 | 变更原因 |
|---------|---------|---------|
| `pnpm-workspace.yaml` | 新增 | Monorepo 工作区声明（FR-002） |
| `package.json`（根目录） | 新增 | 根级 scripts：lint, typecheck, test, build, ci:check |
| `tsconfig.base.json` | 新增 | 共享 TypeScript 编译基础配置 |
| `.env.example` | 新增 | 环境变量模板（FR-030） |
| `.gitignore` | 新增/修改 | 忽略 .env、node_modules、dist 等（FR-031） |
| `scripts/ci.sh` | 新增 | CI 统一入口脚本（FR-050～FR-055） |
| `apps/api-server/src/main.ts` | 新增 | NestJS 启动入口（FR-020） |
| `apps/api-server/src/app.module.ts` | 新增 | 根 Module，集成 Config/Logger/Prisma/Health（FR-020） |
| `apps/api-server/src/config/configuration.ts` | 新增 | Joi 配置校验 schema（FR-032） |
| `apps/api-server/src/health/health.module.ts` | 新增 | HealthModule 声明（FR-022） |
| `apps/api-server/src/health/health.controller.ts` | 新增 | GET /health 路由处理（FR-022, FR-023） |
| `apps/api-server/src/health/health.service.ts` | 新增 | 健康状态逻辑（FR-023） |
| `apps/api-server/src/health/dto/health-status.dto.ts` | 新增 | HealthStatusDto 类型定义 |
| `apps/api-server/src/prisma/prisma.service.ts` | 新增 | PrismaClient 封装，连接 PostgreSQL（FR-040） |
| `apps/api-server/src/prisma/prisma.module.ts` | 新增 | PrismaModule 全局声明（FR-040） |
| `apps/api-server/prisma/schema.prisma` | 新增 | Prisma schema（无业务 model，FR-041, FR-042） |
| `apps/api-server/package.json` | 新增 | api-server 依赖声明（NestJS, Prisma, Pino 等） |
| `apps/api-server/tsconfig.json` | 新增 | api-server TS 配置（extends tsconfig.base.json） |
| `apps/api-server/tsconfig.build.json` | 新增 | api-server 构建 TS 配置（排除 test 文件） |
| `apps/web-admin/src/app/page.tsx` | 新增 | 默认首页（FR-010～FR-012） |
| `apps/web-admin/src/app/layout.tsx` | 新增 | Root layout |
| `apps/web-admin/package.json` | 新增 | web-admin 依赖声明（Next.js 14, React 18） |
| `apps/web-admin/tsconfig.json` | 新增 | web-admin TS 配置 |
| `apps/web-admin/next.config.ts` | 新增 | Next.js 配置 |
| `packages/shared/src/index.ts` | 新增 | shared 包导出占位（FR-004） |
| `packages/shared/package.json` | 新增 | shared 包声明 |
| `packages/shared/tsconfig.json` | 新增 | shared TS 配置 |
| `packages/core/src/index.ts` | 新增 | core 包导出占位（FR-004, FR-005） |
| `packages/core/package.json` | 新增 | core 包声明 |
| `packages/core/tsconfig.json` | 新增 | core TS 配置 |
| `packages/content-packs/novel-pack/src/index.ts` | 新增 | novel-pack 导出占位（FR-004, FR-006） |
| `packages/content-packs/novel-pack/package.json` | 新增 | novel-pack 包声明 |
| `packages/content-packs/novel-pack/tsconfig.json` | 新增 | novel-pack TS 配置 |
| `packages/platform-adapters/README.md` | 新增 | platform-adapters 目录占位（FR-004, FR-007） |
| `packages/platform-adapters/package.json` | 新增 | platform-adapters 最小包声明（private: true，确保 pnpm workspace 识别） |
| `docs/product/` | 新增 | 文档子目录（FR-060） |
| `docs/architecture/` | 新增 | 文档子目录（FR-060） |
| `docs/iterations/` | 新增 | 文档子目录（FR-060） |
| `docs/content-packs/` | 新增 | 文档子目录（FR-060） |

## Development Tasks

> 按依赖顺序排列，编号越小越先实现。

---

- Task-01：初始化根目录 Monorepo 配置
  - 所属模块：根目录
  - 描述：创建 `pnpm-workspace.yaml`（声明 apps/*, packages/**, packages/content-packs/**, packages/platform-adapters/**）、根 `package.json`（含 lint/typecheck/test/build scripts）、`tsconfig.base.json`（共享 strict 模式 TS 配置）、`.gitignore`（含 .env/node_modules/dist/.next）
  - 涉及接口/方法：无（纯配置）
  - 输入：无
  - 输出：`pnpm install` 可成功执行，workspace 识别所有子包
  - 产出类型：配置文件
  - 功能类型：none
  - type id：`none`
  - 是否跨组件：否

---

- Task-02：创建 .env.example 环境变量模板
  - 所属模块：根目录
  - 描述：创建 `.env.example`，包含以下占位字段：`PORT=3000`、`DATABASE_URL=postgresql://user:pass@localhost:5432/ai_content_factory`、`LOG_LEVEL=info`、`LLM_PROVIDER_API_KEY=`、`WEB_PORT=3001`
  - 涉及接口/方法：无
  - 输入：无
  - 输出：`.env.example` 文件存在，`.env` 被 `.gitignore` 忽略
  - 产出类型：配置文件
  - 功能类型：none
  - type id：`none`
  - 是否跨组件：否

---

- Task-03：初始化 packages/shared
  - 所属模块：packages/shared
  - 描述：创建 `packages/shared/package.json`（name: `@ai-content-factory/shared`）、`tsconfig.json`（extends ../../tsconfig.base.json）、`src/index.ts`（空导出）
  - 涉及接口/方法：`src/index.ts: export {}`
  - 输入：无
  - 输出：`@ai-content-factory/shared` 可被其他包通过 workspace 协议引用
  - 产出类型：TypeScript 包
  - 功能类型：library
  - type id：`library`
  - 是否跨组件：否

---

- Task-04：初始化 packages/core 并建立命名约束
  - 所属模块：packages/core
  - 描述：创建 `packages/core/package.json`（name: `@ai-content-factory/core`）、`tsconfig.json`、`src/index.ts`（空导出）。文件名、类名、变量名**禁止**包含 book/chapter/novel（大小写不敏感），由 Task-13 CI 脚本检测
  - 涉及接口/方法：`src/index.ts: export {}`
  - 输入：无
  - 输出：`@ai-content-factory/core` 可被引用；src/ 下无违规命名
  - 产出类型：TypeScript 包
  - 功能类型：library
  - type id：`library`
  - 是否跨组件：否

---

- Task-05：初始化 packages/content-packs/novel-pack
  - 所属模块：packages/content-packs/novel-pack
  - 描述：创建 `package.json`（name: `@ai-content-factory/novel-pack`）、`tsconfig.json`、`src/index.ts`（空导出）。不得被 core 引用
  - 涉及接口/方法：`src/index.ts: export {}`
  - 输入：无
  - 输出：novel-pack 目录结构存在，`@ai-content-factory/novel-pack` 包可识别
  - 产出类型：TypeScript 包
  - 功能类型：library
  - type id：`library`
  - 是否跨组件：否

---

- Task-06：初始化 packages/platform-adapters 目录占位
  - 所属模块：packages/platform-adapters
  - 描述：创建 `packages/platform-adapters/package.json`（name: `@ai-content-factory/platform-adapters`, private: true，确保 pnpm workspace 识别该目录）和 `README.md`（说明：仅保留适配器接口和目录占位，不实现平台自动化）
  - 涉及接口/方法：无
  - 输入：无
  - 输出：目录存在，`ls packages/platform-adapters/` 可见 package.json 和 README.md；pnpm workspace 可识别该包
  - 产出类型：目录占位
  - 功能类型：none
  - type id：`none`
  - 是否跨组件：否

---

- Task-07：初始化 apps/api-server NestJS 基础框架
  - 所属模块：apps/api-server
  - 描述：创建 NestJS 应用基础文件：`package.json`（含 NestJS 10.x 全套依赖）、`tsconfig.json`、`tsconfig.build.json`、`src/main.ts`（`NestFactory.create + listen(PORT)`）、`src/app.module.ts`（空根 Module）
  - 涉及接口/方法：`bootstrap(): Promise<void>`（main.ts）
  - 输入：`pnpm start:dev`
  - 输出：api-server 在 PORT（默认 3000）启动，控制台有启动成功日志
  - 产出类型：NestJS 应用
  - 功能类型：none（启动框架，无业务）
  - type id：`none`
  - 是否跨组件：否
  - 测试覆盖说明：本 Task 无独立测试用例，应用启动可用性验收由 Task-11 的 `GET /health` E2E 测试覆盖

---

- Task-08：集成 @nestjs/config + Joi 配置校验
  - 所属模块：apps/api-server
  - 描述：在 `AppModule` 引入 `ConfigModule.forRoot({ isGlobal: true, validationSchema })`；`src/config/configuration.ts` 定义 Joi schema：必须字段 `DATABASE_URL`（string, required），可选字段 `PORT`（number, default 3000）、`LOG_LEVEL`（string, default 'info'）、`LLM_PROVIDER_API_KEY`（string, optional, allow('')）；ConfigModule 设置 `validationOptions: { allowUnknown: true, abortEarly: false }`
  - 涉及接口/方法：`ConfigModule.forRoot(options)`；`ConfigService.get<T>(key)`
  - 输入：`.env` 文件（含或不含 DATABASE_URL）
  - 输出：有效 .env → 配置可通过 ConfigService 访问；缺少 DATABASE_URL → 启动时抛出 ValidationError，进程退出，stderr 含字段名
  - 产出类型：配置模块
  - 功能类型：library
  - type id：`library`
  - 是否跨组件：否

---

- Task-09：集成 nestjs-pino 结构化日志
  - 所属模块：apps/api-server
  - 描述：在 `AppModule` 引入 `LoggerModule.forRootAsync()`，使用 `ConfigService` 读取 `LOG_LEVEL`；配置 pino 输出 JSON 格式，每条日志含 `timestamp`、`level`、`module`、`message` 字段；`main.ts` 调用 `app.useLogger(app.get(Logger))`；使用 `renameContext: 'module'` 将 NestJS context 重命名为 module 字段
  - 涉及接口/方法：`LoggerModule.forRootAsync(options)`；NestJS `Logger` interface
  - 输入：应用启动，LOG_LEVEL 环境变量
  - 输出：stdout 输出 JSON 格式日志，JSON key 包含 `timestamp`、`level`、`module`、`message`
  - 产出类型：日志模块
  - 功能类型：library
  - type id：`library`
  - 是否跨组件：否

---

- Task-10：集成 Prisma + PrismaService
  - 所属模块：apps/api-server
  - 描述：创建 `prisma/schema.prisma`（仅 datasource + generator，无 model）；创建 `src/prisma/prisma.service.ts`（extends PrismaClient，实现 `onModuleInit` 连接数据库）；创建 `src/prisma/prisma.module.ts`（global module，导出 PrismaService）；在 `AppModule` 引入 `PrismaModule`；添加 `db:check` script（`prisma migrate status`）
  - 涉及接口/方法：`PrismaService extends PrismaClient`；`PrismaService.onModuleInit(): Promise<void>`
  - 输入：DATABASE_URL 环境变量
  - 输出：PrismaService 可注入其他模块；`pnpm db:check` 在 PostgreSQL 可达时退出码 0，不可达时退出码非 0 含错误信息
  - 产出类型：数据库模块
  - 功能类型：library
  - type id：`library`
  - 是否跨组件：否

---

- Task-11：实现 GET /health 接口
  - 所属模块：apps/api-server
  - 描述：创建 `src/health/health.service.ts`（`getStatus(): HealthStatusDto`）；创建 `src/health/health.controller.ts`（`@Get('/health') check(): HealthStatusDto`）；创建 `src/health/dto/health-status.dto.ts`（`{ status: string }`）；创建 `src/health/health.module.ts`；在 `AppModule` 引入 `HealthModule`
  - 涉及接口/方法：`GET /health → HealthController.check() → HealthService.getStatus()`；`HealthService.getStatus(): HealthStatusDto`
  - 输入：`GET /health`（无请求体）
  - 输出：`{ "status": "ok" }`，HTTP 200
  - 产出类型：REST API 响应
  - 功能类型：Web/API
  - type id：`web-e2e`
  - 是否跨组件：否（api-server 内部）

---

- Task-12：初始化 apps/web-admin Next.js 应用
  - 所属模块：apps/web-admin
  - 描述：创建 Next.js 14 App Router 应用；`src/app/layout.tsx`（根 layout，含 html/body）；`src/app/page.tsx`（首页，显示 "AI Content Factory" 项目名称占位）；`package.json`（name: `@ai-content-factory/web-admin`，含 next/react 依赖，`"dev": "next dev -p ${WEB_PORT:-3001}"`）；`tsconfig.json`、`next.config.ts`
  - 涉及接口/方法：`HomePage(): JSX.Element`（page.tsx 默认导出）
  - 输入：`pnpm dev`（或 `pnpm start`）
  - 输出：浏览器访问 `localhost:{WEB_PORT}` → HTTP 200，页面含 "AI Content Factory"
  - 产出类型：Web 页面
  - 功能类型：Web/UI
  - type id：`web-e2e`
  - 是否跨组件：否

---

- Task-13：实现 CI 检查脚本（含命名边界检测和根目录名检测）
  - 所属模块：scripts/
  - 描述：创建 `scripts/ci.sh`（bash，`set -euo pipefail`），依次执行：install → lint → typecheck → test → root-name-check → naming-check → db:check；每步骤失败时输出 `STEP FAILED: {step_name}` 到 stderr 并 exit 1
  - 涉及接口/方法：Bash 脚本，无 TypeScript 接口
  - 输入：项目代码库（各步骤依次触发）
  - 输出：全部通过 → exit 0；任意失败 → exit 1 + "STEP FAILED: {step_name}" 到 stderr
  - 产出类型：CLI 脚本
  - 功能类型：CLI + 跨组件集成
  - type id：`cli`
  - 是否跨组件：是（组件链路：ci.sh → install → lint → typecheck → test → root-name-check → naming-check → db:check）

---

- Task-14：创建 docs 子目录结构
  - 所属模块：docs/
  - 描述：在 `docs/` 下创建 `product/`、`architecture/`、`iterations/`、`content-packs/` 子目录，各目录添加 `.gitkeep` 占位
  - 涉及接口/方法：无
  - 输入：无
  - 输出：`ls docs/` 可见四个子目录；docs/00-product-blueprint.md 等文档文件存在
  - 产出类型：目录结构
  - 功能类型：none
  - type id：`none`
  - 是否跨组件：否
