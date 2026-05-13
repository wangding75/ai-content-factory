# Test Report：Iteration 1 通用内容项目入口

## Test Scope

本次测试覆盖 Iteration 1 的通用内容项目入口交付物：

- `packages/shared`：统一 API 响应、错误码、ContentProject、PromptTemplate、LLM Provider DTO 与安全字段契约。
- `packages/core`：通用 `ContentProjectEntity` 领域接口与 shared 状态类型复用。
- `apps/api-server`：ContentType 查询、ContentProject CRUD、PromptTemplate 保存/查看、默认 LLM Provider 保存/安全查询、业务模块挂载、Prisma schema 合约。
- `apps/web-admin`：管理台导航、内容项目列表/创建/详情入口、PromptTemplate 列表/详情入口、LLM Provider 配置入口、Web API client。

识别到的测试类型与规范：

- `library`：公共类型、core 接口、API client 与跨包映射契约，按 `standards/testing/library.md` 执行。
- `integration`：API Controller/Service/Prisma 边界与错误码映射，按 `standards/testing/integration.md` 执行。
- `web-e2e`：Web/API 页面入口、表单、空状态、重试入口和安全显示，按 `standards/testing/web-e2e.md` 执行；因环境缺少 Chrome，使用 React render contract tests + Next dev server HTTP route smoke checks 作为替代证据。
- `sql-query`：不适用。设计声明本迭代不产出 SQL/query generator，SQL 闭环通过 Prisma schema 与相邻集成测试验证。

## Test Results

Green gate：

- 命令：`pnpm vitest run`
- 证据文件：`.cube/iterations/feature-iter_1/test-output.log`
- 结果：26 个测试文件通过；117 个测试通过；2 个 todo；0 失败。

Typecheck：

- 命令：`pnpm -r typecheck`
- 证据文件：`.cube/iterations/feature-iter_1/typecheck-output.log`
- 结果：6 个 workspace project typecheck 通过。

类型化测试结果：

- `library`：命令 `pnpm vitest run packages/shared/src/index.test.ts packages/core/src/index.test.ts apps/api-server/src/content-projects/content-projects.entity-mapping.test.ts apps/web-admin/src/lib/api-client.test.ts --reporter=verbose`；证据 `.cube/iterations/feature-iter_1/library-output.log`；4 个测试文件、21 个测试通过。
- `integration`：命令 `pnpm vitest run apps/api-server/src/content-types/content-types.integration.test.ts apps/api-server/src/content-projects/content-projects.integration.test.ts apps/api-server/src/prompt-templates/prompt-templates.integration.test.ts apps/api-server/src/llm-providers/llm-providers.integration.test.ts apps/api-server/src/app.test.ts --reporter=verbose`；证据 `.cube/iterations/feature-iter_1/integration-output.log`；5 个测试文件、45 个测试通过。
- `web-e2e` 替代验证：命令 `pnpm vitest run apps/web-admin/src/app/page.test.tsx apps/web-admin/src/app/content-projects/content-projects-pages.test.tsx apps/web-admin/src/app/prompt-templates/prompt-templates-pages.test.tsx apps/web-admin/src/app/llm-provider/page.test.tsx --reporter=verbose`；证据 `.cube/iterations/feature-iter_1/web-e2e-output.log`；4 个测试文件、13 个测试通过。
- Web HTTP smoke：启动 `pnpm --filter @ai-content-factory/web-admin dev` 后使用 Node `fetch` 请求 `/`、`/content-projects`、`/content-projects/new`、`/content-projects/example`、`/prompt-templates`、`/prompt-templates/example`、`/llm-provider`；证据 `.cube/iterations/feature-iter_1/web-http-output.log`；7 条路由 smoke checks 通过。

失败用例：无。

## Pass Criteria

- AC-001：通过。`ContentProjects API integration` 覆盖创建 Novel 内容项目并校验 enabled content type。
- AC-002：通过。项目摘要列表 DTO 与创建后字段映射由 `content-projects.integration.test.ts` 覆盖。
- AC-003：通过。项目详情包含基础信息、内容类型、目标平台、目标数量、默认参数、PromptTemplate 和默认 LLM Provider。
- AC-004：通过。更新项目后返回最新详情，由 `returns the latest detail after update` 覆盖。
- AC-005：通过。API 删除契约和 Web “Confirm delete” 入口均已覆盖。
- AC-006：通过。项目列表空状态和创建入口由 Web 页面测试与 HTTP smoke 覆盖。
- AC-007：通过。PromptTemplate 创建通过内容类型、用途、内容、版本校验后保存。
- AC-008：通过。PromptTemplate 摘要/详情包含内容类型、purpose/version 和 content/contentPreview 识别信息。
- AC-009：通过。默认 LLM Provider 保存接口通过集成测试覆盖。
- AC-010：通过。`LlmProviderSafeDto` 不包含 `apiKey` 或 `encryptedApiKeyValue`；保存后仅返回 `apiKeyConfigured` 和脱敏 `apiKeyPreview`。
- AC-011：通过。首页导航提供 Content Projects、PromptTemplates、LLM Provider 入口。
- AC-012：通过。核心表、API、核心页面测试覆盖不使用 book/chapter 作为核心概念。
- AC-013：通过。Novel 仅作为内容类型选项或内容包概念出现。
- AC-014：通过。未实现 Agent 生成流程、工作流执行、发布流程和 Novel 详细设定能力。

非功能性契约：

- NFR-001：通过。API Key 使用 AES-256-GCM 加密保存，DTO/UI 不返回完整明文。
- NFR-002：通过。Controller/schema 层对项目、PromptTemplate、LLM Provider 输入进行运行时校验。
- NFR-003：通过。错误映射测试验证错误响应不泄露 API Key，服务错误不返回内部异常堆栈。
- NFR-004~NFR-006：通过。核心类型与页面/API 文案保持内容类型无关，LLM Provider 独立于 Agent 和内容类型。
- NFR-007~NFR-008：通过。空状态、重试入口、删除确认入口均由页面契约和 smoke checks 覆盖。

## Coverage

未配置独立 coverage command，`workflow.yaml` 仅定义 green gate `pnpm vitest run`。本阶段未生成行覆盖率百分比。

覆盖缺口与替代验证：

- 浏览器自动化：Playwright 与 superpowers Chrome 均因环境缺少 Chrome 被阻塞，错误为 Chrome executable not found。替代验证为 React render contract tests 与 Next dev server HTTP route smoke checks。核心页面路由、表单标签、空状态、重试入口和安全 API Key 展示均已验证；真实浏览器点击/键盘交互未在本环境执行。
- SQL/query：本迭代无 SQL generator；未执行 expected SQL 或方言语义 fixture。Prisma schema contract、Prisma Client include 结构与 API integration tests 覆盖相邻闭环。
- 覆盖率数据：无 coverage command，未产生覆盖率百分比。

未覆盖链路不阻塞验收的原因：本迭代交付为 skeleton/contract 入口，Web 页面无客户端事件处理或真实后端联动；HTTP route smoke checks 已验证 Next 路由渲染可达。完整浏览器交互可在安装 Chrome 的环境中补跑。

## Standards Evidence

- `standards/testing/library.md`
  - 命令：`pnpm vitest run packages/shared/src/index.test.ts packages/core/src/index.test.ts apps/api-server/src/content-projects/content-projects.entity-mapping.test.ts apps/web-admin/src/lib/api-client.test.ts --reporter=verbose`
  - 证据：`.cube/iterations/feature-iter_1/library-output.log`
  - 结果：PASS，覆盖公共 API、类型稳定性、序列化字段、API client 公共方法和跨包 consumer。

- `standards/testing/integration.md`
  - 命令：`pnpm vitest run apps/api-server/src/content-types/content-types.integration.test.ts apps/api-server/src/content-projects/content-projects.integration.test.ts apps/api-server/src/prompt-templates/prompt-templates.integration.test.ts apps/api-server/src/llm-providers/llm-providers.integration.test.ts apps/api-server/src/app.test.ts --reporter=verbose`
  - 证据：`.cube/iterations/feature-iter_1/integration-output.log`
  - 结果：PASS，覆盖 Controller/validation/service/Prisma mock 边界、成功路径、校验失败、domain failure、错误码映射和安全 DTO。

- `standards/testing/web-e2e.md`
  - 命令：`pnpm vitest run apps/web-admin/src/app/page.test.tsx apps/web-admin/src/app/content-projects/content-projects-pages.test.tsx apps/web-admin/src/app/prompt-templates/prompt-templates-pages.test.tsx apps/web-admin/src/app/llm-provider/page.test.tsx --reporter=verbose`
  - 证据：`.cube/iterations/feature-iter_1/web-e2e-output.log`
  - 结果：PASS，覆盖页面入口、表单字段、空状态、重试入口、删除确认入口和 API Key write-only/safe preview 展示。
  - 替代补充：`web-http-output.log` 记录 Next dev server HTTP route smoke checks。未执行真实浏览器自动化，原因是当前环境缺少 Chrome。

- `SQL Contract`
  - 设计结论：`none`。未使用 `$queryRawUnsafe` 或字符串拼接 SQL；通过 Prisma schema contract 与 API integration tests 验证。

## Review Evidence

使用 reviewer：`everything-claude-code:code-reviewer`，并在 04 阶段使用过 `everything-claude-code:security-reviewer` 与 TypeScript reviewer。

审查结论：

- 04-development 最终复审：无 CRITICAL/HIGH 问题。
- 05-testing 跨阶段一致性审查初次发现 1 个 HIGH：LLM Provider 真实 AES 存储值无法产生设计要求的脱敏 `apiKeyPreview`。
- 修复：`apps/api-server/src/llm-providers/llm-providers.service.ts` 在保存时将安全脱敏预览与 AES-256-GCM 密文一并存储到加密载荷格式中，DTO 只提取脱敏预览，不返回明文或 `encryptedApiKeyValue`。
- 修复后复审：无剩余 CRITICAL/HIGH 问题。

## Known Issues

- 当前 skeleton 设计未包含认证授权体系；PRD 明确完整权限体系为 Out of Scope。若后续迭代开放真实多用户环境，mutating API 需要补齐认证与授权。
- 当前环境缺少 Chrome，无法执行 Playwright/Chrome 浏览器自动化；已使用 render tests 与 HTTP route smoke checks 替代。
- 未配置 coverage command，无法报告覆盖率百分比。
