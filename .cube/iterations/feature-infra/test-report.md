# Stage 05 Test Report

## Test Scope

- 本次验收覆盖 Iteration 0 工程脚手架：pnpm workspace 根配置、`apps/api-server`、`apps/web-admin`、`packages/core`、`packages/shared`、`packages/content-packs/novel-pack`、`packages/platform-adapters`、`scripts/ci.sh` 与文档目录结构。
- 测试类型包含：Vitest 单元/框架测试、CLI 集成测试、Web/API 入口测试、Web 页面 HTTP 入口测试、TypeScript 类型检查、ESLint 检查、构建检查、覆盖率命令、依赖安全审计。
- 根据 `design.md` Output Contract 与 `test-map.yaml`，本迭代命中的类型化规范为：
  - `web-e2e`：`GET /health`、`apps/web-admin` 首页。
  - `cli`：`pnpm db:check`、`scripts/ci.sh`。
  - `integration`：`scripts/ci.sh → install → lint → typecheck → test → root-name-check → naming-check → db:check`。
  - `library`：workspace 包占位导出、配置模块、PrismaService 生命周期封装。
- 本迭代不包含 SQL/query generator；Prisma schema 保持无业务 model，因此未执行 `sql-query` typed standard。

## Test Results

- `pnpm vitest run scripts/core-naming-boundary.test.ts`：PASS — 1 个文件，4 个测试通过。
  - 已验证 `packages/core/src` 中变量名、类名、文件名命中 `book|chapter|novel` 时会被检测。
  - 文件名用例通过临时 fixture 执行与 `scripts/ci.sh` 一致的 `grep || find` naming-check 表达式，覆盖 `novel-helper.ts` 这类仅文件名违规的场景。
- `pnpm vitest run`：PASS — 7 个文件，20 个测试通过，2 个 todo。
- `npx vitest run --coverage`：PASS — 7 个文件，20 个测试通过，2 个 todo；V8 coverage report 已生成。
- `pnpm lint`：PASS。
- `pnpm typecheck`：PASS。
- `pnpm build`：PASS。
  - `apps/api-server` Nest build 通过。
  - `apps/web-admin` Next.js production build 通过，`/` 静态页面生成成功。
- `bash scripts/ci.sh`：PASS。
  - install：PASS。
  - lint：PASS。
  - typecheck：PASS。
  - test：PASS。
  - root-name-check：PASS。
  - naming-check：PASS。
  - db:check：`DATABASE_URL` 未设置时按当前本地脚本设计 SKIPPED；配置后仍执行真实 Prisma 检查。
- `pnpm --filter @ai-content-factory/api-server test`：PASS — 5 个文件，12 个测试通过，2 个 todo。
- `pnpm --filter @ai-content-factory/web-admin test`：PASS — 1 个文件，2 个测试通过。
- `DATABASE_URL='postgresql://user:pass@127.0.0.1:1/ai_content_factory' pnpm db:check`：PASS（失败路径符合预期）— 命令退出码非 0，Prisma 返回 `P1001: Can't reach database server at 127.0.0.1:1`。
- Web/API 入口验证：PASS。
  - API：启动 `PORT=3300 DATABASE_URL=postgresql://user:pass@127.0.0.1:1/ai_content_factory pnpm --filter @ai-content-factory/api-server start` 后，请求 `http://127.0.0.1:3300/health` 返回 `{"status":"ok"}`。
  - Web：启动 `WEB_PORT=3301 pnpm --filter @ai-content-factory/web-admin start` 后，请求 `http://127.0.0.1:3301/` 返回 HTTP 200，页面内容包含 `AI Content Factory`。
  - Playwright 浏览器检查未执行：当前环境缺少 Chrome executable；已用公共 HTTP 入口验证替代并记录风险。
- `pnpm audit --audit-level high`：PASS — 无 high/critical advisories；当前仅报告 3 low、7 moderate。

## Pass Criteria

- AC-001 项目根目录名为 `ai-content-factory`：PASS，`scripts/ci.sh` root-name-check 通过。
- AC-002 `apps/web-admin` 可本地启动，默认页可访问：PASS，`WEB_PORT=3301 pnpm --filter @ai-content-factory/web-admin start` 后 HTTP 200 且包含 `AI Content Factory`。
- AC-003 `apps/api-server` 可本地启动，`GET /health` 返回 `{ "status": "ok" }`：PASS，HTTP 入口验证通过。
- AC-004 core/content-packs/platform-adapters/shared 目录存在：PASS，对应 scaffold tests 与 workspace tests 通过。
- AC-005 Core 目录扫描不含 `book`、`chapter`、`novel` 命名：PASS，`scripts/core-naming-boundary.test.ts` 与 `scripts/ci.sh` naming-check 通过；文件名违规检测已覆盖。
- AC-006 `.env.example` 存在，本地应用可从环境变量加载基础配置：PASS，env template tests 与 API 配置测试通过。
- AC-007 PostgreSQL 连接检查或空迁移命令可执行：PARTIAL PASS，`DATABASE_URL` 配置后 `pnpm db:check` 执行真实 Prisma migrate status；本地无 PostgreSQL 时失败路径返回明确 P1001。未验证可达 PostgreSQL 的成功路径。
- AC-008 `pnpm lint`、`pnpm typecheck`、`pnpm test` 退出码为 0：PASS。
- AC-009 不存在任何业务表：PASS，`apps/api-server/prisma/schema.prisma` 无业务 model；Prisma generate 在无 model schema 下不会生成 client，`PrismaService` 对 Iteration 0 scaffold 以 optional client 方式处理。
- AC-010 `docs/` 目录中存在规定蓝图和迭代文档：PASS，docs scaffold tests 通过。

## Coverage

- `npx vitest run --coverage` 已执行并 PASS。
- 覆盖率结果：All files 0% statements / 0% branches / 0% functions / 0% lines。
- 覆盖率缺口说明：当前根 `vitest.config.ts` 只 include `scripts/**/*.test.ts`，但 coverage include 范围包含 `apps/api-server/src`、`apps/web-admin` 等应用源码；这些源码的实际测试在各 workspace package 的独立 Vitest 配置中运行，因此根 coverage report 未能反映 package-level 测试覆盖。
- 未覆盖/未完整覆盖链路：
  - 可达 PostgreSQL 的 `pnpm db:check` 成功路径未在本地环境执行。
  - Playwright/真实浏览器可访问性检查未执行，原因是当前环境缺少 Chrome executable；已用 HTTP 入口与 Next.js build 替代。
  - `scripts/ci.sh` 在 `DATABASE_URL` 未设置时跳过 db:check，避免本地无数据库阻塞 scaffold CI；配置 `DATABASE_URL` 后仍会执行真实检查。
- 覆盖率工具修复：新增 `@vitest/coverage-v8@1.6.1`，并通过 `test-exclude@6.0.0>glob: 7.2.3` scoped override 避免 repo 全局 `glob: 13.0.6` override 破坏 coverage provider 的 legacy dependency。

## Standards Evidence

- `standards/testing/web-e2e.md`
  - API 证据：`GET http://127.0.0.1:3300/health` 返回 `{"status":"ok"}`，覆盖公共 HTTP 入口、Controller → Service → response 链路。
  - Web 证据：`GET http://127.0.0.1:3301/` 返回 HTTP 200 且包含 `AI Content Factory`。
  - 替代说明：Playwright 未执行，环境缺少 Chrome；HTTP 入口验证覆盖状态码和页面内容，风险为未验证浏览器级可访问性/交互。
- `standards/testing/cli.md`
  - `bash scripts/ci.sh`：PASS，验证 exit code、步骤输出与失败即终止策略。
  - `DATABASE_URL=postgresql://user:pass@127.0.0.1:1/ai_content_factory pnpm db:check`：预期失败路径 PASS，退出码非 0 且 stderr/stdout 包含 Prisma P1001 连接错误。
  - `scripts/core-naming-boundary.test.ts`：PASS，验证 naming-check 对内容和文件名违规均可检测。
- `standards/testing/integration.md`
  - `bash scripts/ci.sh`：PASS，覆盖 install → lint → typecheck → test → root-name-check → naming-check → db:check skip/configured path 的集成链路。
  - 重要中间契约：root package name、core naming boundary、workspace lint/typecheck/test 均已验证。
- `standards/testing/library.md`
  - API server 配置、PrismaService 生命周期、workspace 包占位导出均通过 public module/package entry 测试验证。
  - `PrismaService` 在 Iteration 0 无业务 model、无法生成 Prisma client 的场景下保持可注入；有生成 client 时仍委托 `$connect/$disconnect`。
- TypeScript preset/rules
  - `pnpm typecheck`：PASS。
  - `pnpm lint`：PASS，API 与 Web 包均使用 TypeScript ESLint unused-variable/debugger 规则。
- 安全/依赖证据
  - `pnpm audit --audit-level high`：PASS，无 high/critical；low/moderate 作为非阻塞残留风险。

## Review Evidence

- 使用 reviewer：
  - `everything-claude-code:typescript-reviewer`：首次 Stage 05 code review。
  - `everything-claude-code:security-reviewer`：安全审查。
  - `superpowers:code-reviewer`：修复后最终复审。
- 首次代码审查结论：发现 1 个 HIGH 问题——`scripts/core-naming-boundary.test.ts` 的文件名违规检测测试退化为静态字符串检查，不能证明 CI 实际失败。
- 修复措施：将该测试改为在临时 fixture 中执行与 `scripts/ci.sh` 一致的 `grep || find` naming-check 表达式，验证 `packages/core/src/novel-helper.ts` 文件名违规可被检测。
- 最终复审结论：无 CRITICAL/HIGH；prior HIGH 已解决，Stage 05 fix set APPROVE / NON-BLOCKING。
- 安全审查结论：无 CRITICAL/HIGH。
  - MEDIUM 记录 1：`PrismaService` 对 `@prisma/client did not initialize yet` 的 fallback 可能在未来非 Iteration 0 环境掩盖 DB 初始化问题，建议后续按环境收紧或加 structured warning。
  - MEDIUM 记录 2：coverage provider 的 scoped `glob@7.2.3` 为 dev/test-only legacy dependency，建议后续升级工具链后移除。

## Known Issues

- 本地环境无可达 PostgreSQL，未验证 `pnpm db:check` 成功路径；失败路径和配置后真实执行路径已验证。
- 当前环境缺少 Chrome executable，未执行 Playwright 浏览器级 E2E；HTTP 入口验证已覆盖 Stage 05 最小 Web/API 验收。
- 根 coverage report 为 0%，原因是 root coverage 范围与 workspace package 测试执行范围不一致；不代表 package tests 未执行。
