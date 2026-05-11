# Iteration 1 Design：通用内容项目入口

## 1. 概述

本次设计为 AI Content Factory 增加最小可用的通用内容项目管理入口，使运营者可以通过 Web 管理台创建 Novel 类型的 ContentProject，维护项目基础信息、PromptTemplate 和默认 LLM Provider 配置。

整体方案采用现有 monorepo 分层：`apps/api-server` 提供 REST API 与 Prisma 持久化，`apps/web-admin` 提供管理台页面，`packages/shared` 提供前后端共享类型与错误码。当前迭代只实现管理入口与配置 CRUD，不实现 Agent 生成、工作流执行、发布流程或 Novel Pack 专属能力。

核心原则：

- 最小改动：复用现有 NestJS、Next.js、Prisma scaffold，不新增 Repository 抽象层。
- 内容类型无关：核心 API、表、页面文案使用 ContentProject、ContentType、ContentItem、PromptTemplate、LLM Provider 等通用概念。
- 边界校验明确：Controller 入口必须使用运行时 DTO/schema 校验请求体，不能只依赖 TypeScript interface。
- 安全边界明确：LLM Provider 的 API Key 只允许写入和加密保存，普通查询结果和 UI 不返回完整明文；`baseUrl` 必须通过 URL 语法和允许协议校验，后续 outbound 调用不得直接信任用户输入。
- 接口先行：先定义共享类型、DTO、Controller/Service 方法签名和页面入口，保证后续测试可直接基于契约编写。

命名约定：

- 数据模型和 TypeScript 类型：`LlmProvider`、`LlmProviderSafeDto`。
- API 路径：`/api/v1/llm-providers/*`。
- 页面文案：`LLM Provider`。
- 时间字段：API 响应统一返回 ISO 8601 字符串，例如 `2026-05-11T00:00:00.000Z`。

## 2. Impact Analysis

| 模块 | 影响程度 | 影响说明 |
|------|----------|----------|
| `apps/api-server` | 修改 + 新增 | 在现有 `AppModule` 中挂载 ContentProject、PromptTemplate、LLM Provider 模块；新增 Controller、Service、DTO、错误码映射。 |
| `apps/api-server/prisma/schema.prisma` | 修改 | 新增 `ContentType`、`ContentProject`、`PromptTemplate`、`LlmProvider` 模型。 |
| `apps/web-admin` | 修改 + 新增 | 将占位首页替换为管理台基础布局，新增项目、PromptTemplate、LLM Provider 的页面入口和基础表单组件。 |
| `packages/shared` | 修改 + 新增 | 导出共享领域类型、请求/响应类型、错误码常量、状态类型。 |
| `packages/core` | 轻量修改 | 导出通用内容项目领域接口，并由 API 层通过编译级引用消费，避免形成无使用价值的孤立导出。 |
| `packages/content-packs/novel-pack` | 无影响 | Novel 仅作为内容类型数据出现，不实现 Novel 专属能力。 |
| `packages/platform-adapters` | 无影响 | 本迭代不实现发布。 |

### 兼容性分析

- 现有 API 只有 `/health`，本迭代新增 `/api/v1/*` 资源，不改变 `/health` 行为。
- 当前 Prisma schema 无业务模型，因此新增表不存在存量数据迁移兼容问题。
- Web 管理台当前仅展示占位首页，替换为管理台布局不会破坏既有业务流程。
- 新增共享类型为 additive change，不破坏现有导出。

### 新增 vs 复用

- 复用现有 `HealthModule` 的 NestJS 分层风格：Module + Controller + Service + DTO。
- 复用现有 `PrismaModule` 和 `PrismaService` 作为持久化入口。
- 复用现有 API 规范的统一响应结构。
- 不引入额外状态管理库、Repository 层或内容包插件注册机制。

### 数据模型影响

新增四类核心表：内容类型、内容项目、PromptTemplate、LLM Provider。首期只开放 Novel 内容类型，但模型不对 Novel 做硬编码专属字段。

### 接口影响

新增 REST JSON API，路径遵循 `/api/v1/{resource}`。所有新增接口均返回统一成功/错误响应，不返回 API Key 完整明文。

## 3. Flow Design

### 3.1 创建内容项目流程

1. 用户在 Web 管理台进入内容项目创建表单。
2. Web 调用 `GET /api/v1/content-types` 获取可用内容类型。
3. 若返回空数组，Web 展示“暂无可用内容类型”，并禁用创建提交。
4. 用户填写项目名称、内容类型、目标平台、目标内容数量、默认生成参数。
5. Web 调用 `POST /api/v1/content-projects`。
6. `ContentProjectsController` 校验请求 DTO。
7. `ContentProjectsService` 调用 `ContentTypesService.ensureEnabledContentType()` 校验内容类型是否启用，并通过 Prisma 创建项目。
8. API 返回 ContentProject 响应；Web 跳转/刷新列表。
9. 若校验失败，返回 `VALIDATION_ERROR`；若内容类型不可用，返回 `CONTENT_TYPE_NOT_AVAILABLE`；若持久化失败，返回 `CONTENT_PROJECT_CREATE_FAILED` 且不展示半完成项目。

### 3.2 查看和编辑项目流程

1. 用户进入项目列表页，Web 调用 `GET /api/v1/content-projects`。
2. 用户进入详情页，Web 调用 `GET /api/v1/content-projects/:id`。
3. 用户编辑基础信息，Web 调用 `PATCH /api/v1/content-projects/:id`。
4. Service 校验项目存在和输入合法性，更新后返回最新项目。
5. 若项目不存在，返回 `CONTENT_PROJECT_NOT_FOUND`；若保存失败，返回 `CONTENT_PROJECT_SAVE_FAILED`，Web 保留用户输入并展示失败提示。

### 3.3 删除项目流程

1. 用户在列表或详情页触发删除。
2. Web 展示确认交互。
3. 用户确认后调用 `DELETE /api/v1/content-projects/:id`。
4. Service 删除项目。
5. Web 从列表移除项目。
6. 用户取消时不调用 API；删除失败返回 `CONTENT_PROJECT_DELETE_FAILED` 且列表保留项目。

### 3.4 PromptTemplate 保存和查看流程

1. 用户进入 PromptTemplate 管理入口。
2. Web 调用 `GET /api/v1/prompt-templates` 展示列表。
3. 用户可从列表进入模板详情，Web 调用 `GET /api/v1/prompt-templates/:id`。
4. 用户填写模板名称、适用内容类型、用途或 Agent、模板内容、版本。
5. Web 调用 `POST /api/v1/prompt-templates`。
6. Service 校验内容类型存在、名称和内容非空后保存。
7. API 返回模板响应；Web 刷新列表。

### 3.5 默认 LLM Provider 配置流程

1. 用户进入 LLM Provider 配置页。
2. Web 调用 `GET /api/v1/llm-providers/default`。
3. API 返回 Provider 名称、模型标识、Base URL、启用状态、`apiKeyConfigured`、`apiKeyPreview`，不返回完整 API Key。
4. 用户提交 Provider 名称、模型标识、Base URL、API Key、启用状态。
5. Web 调用 `PUT /api/v1/llm-providers/default`。
6. Service 校验必填字段，并保存 API Key 加密存储值。
7. 保存后 API 仍只返回脱敏配置。

### 3.6 异常与重试流程

- 所有输入校验失败统一映射为 `VALIDATION_ERROR`。
- 资源不存在映射为对应 `*_NOT_FOUND`，该类错误不可重试，Web 展示返回列表或创建入口。
- 加载失败类错误 `*_LOAD_FAILED` 默认可重试，Web 必须展示错误提示和重试入口。
- 点击重试必须重新发起同一路径、同参数请求；重试成功后覆盖错误态；重试失败后保持错误态并展示最后一次错误码。
- 持久化失败映射为对应 `*_CREATE_FAILED`、`*_SAVE_FAILED`、`*_DELETE_FAILED`，表单页保留用户已输入内容。
- 错误响应不得包含 API Key、连接串或内部异常堆栈。

## 4. Table Design

### 4.1 `content_types`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `String` | PK | 内容类型 ID，例如 `novel`。 |
| `name` | `String` | NOT NULL | 展示名称，例如 `Novel`。 |
| `packId` | `String` | NOT NULL | 内容包标识，例如 `novel-pack`。 |
| `enabled` | `Boolean` | NOT NULL, default true | 是否开放选择。 |
| `createdAt` | `DateTime` | NOT NULL, default now | 创建时间。 |
| `updatedAt` | `DateTime` | NOT NULL, updatedAt | 更新时间。 |

索引：`enabled`。

### 4.2 `content_projects`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `String` | PK, cuid | 项目 ID。 |
| `name` | `String` | NOT NULL | 项目名称。 |
| `contentTypeId` | `String` | FK `content_types.id` | 内容类型。 |
| `targetPlatform` | `String` | NOT NULL | 目标平台。 |
| `targetContentCount` | `Int` | NOT NULL | 目标内容数量，必须大于 0。 |
| `defaultGenerationParams` | `Json` | NOT NULL | 默认生成参数。 |
| `status` | `String` | NOT NULL, default `draft` | 项目状态。 |
| `createdAt` | `DateTime` | NOT NULL, default now | 创建时间。 |
| `updatedAt` | `DateTime` | NOT NULL, updatedAt | 更新时间。 |

索引：`contentTypeId`、`status`、`updatedAt`。

### 4.3 `prompt_templates`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `String` | PK, cuid | 模板 ID。 |
| `name` | `String` | NOT NULL | 模板名称。 |
| `contentTypeId` | `String` | FK `content_types.id` | 适用内容类型。 |
| `purpose` | `String` | NOT NULL | 用途或 Agent 标识。 |
| `content` | `String` | NOT NULL | 模板内容。 |
| `version` | `String` | NOT NULL | 版本。 |
| `createdAt` | `DateTime` | NOT NULL, default now | 创建时间。 |
| `updatedAt` | `DateTime` | NOT NULL, updatedAt | 更新时间。 |

索引：`contentTypeId`、`purpose`、`version`。

### 4.4 `llm_providers`

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | `String` | PK | Provider ID；默认配置使用 `default`。 |
| `name` | `String` | NOT NULL | Provider 名称。 |
| `model` | `String` | NOT NULL | 模型标识。 |
| `baseUrl` | `String?` | nullable | Base URL。 |
| `encryptedApiKeyValue` | `String` | NOT NULL | API Key 的加密存储值，禁止保存明文。 |
| `enabled` | `Boolean` | NOT NULL, default true | 是否启用。 |
| `createdAt` | `DateTime` | NOT NULL, default now | 创建时间。 |
| `updatedAt` | `DateTime` | NOT NULL, updatedAt | 更新时间。 |

索引：`enabled`。

## 5. API Design

所有 API 使用 JSON，并遵循统一响应：

```ts
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

### 5.1 `GET /api/v1/content-types`

请求参数：无。

响应：`ContentTypeDto[]`。无可用内容类型时成功返回 `[]`，由 Web 展示“暂无可用内容类型”。

错误码：

- `CONTENT_TYPES_LOAD_FAILED`：内容类型加载失败，可重试。

### 5.2 `GET /api/v1/content-projects`

请求参数：无。

响应：`ContentProjectSummaryDto[]`。

错误码：

- `CONTENT_PROJECTS_LOAD_FAILED`：项目列表加载失败，可重试。

### 5.3 `POST /api/v1/content-projects`

请求体：`CreateContentProjectRequest`。

响应：`ContentProjectDetailDto`。

错误码：

- `VALIDATION_ERROR`：名称为空、内容类型为空、目标内容数量不合法或参数格式不合法。
- `CONTENT_TYPE_NOT_AVAILABLE`：内容类型不存在或未启用。
- `CONTENT_PROJECT_CREATE_FAILED`：创建失败。

### 5.4 `GET /api/v1/content-projects/:id`

路径参数：`id`。

响应：`ContentProjectDetailDto`。

错误码：

- `CONTENT_PROJECT_NOT_FOUND`：项目不存在或已删除，不可重试。
- `CONTENT_PROJECT_LOAD_FAILED`：项目详情加载失败，可重试。

### 5.5 `PATCH /api/v1/content-projects/:id`

路径参数：`id`。

请求体：`UpdateContentProjectRequest`。

响应：`ContentProjectDetailDto`。

错误码：

- `VALIDATION_ERROR`：名称为空、目标内容数量不合法或参数格式不合法。
- `CONTENT_PROJECT_NOT_FOUND`：项目不存在或已删除。
- `CONTENT_PROJECT_SAVE_FAILED`：保存失败。

### 5.6 `DELETE /api/v1/content-projects/:id`

路径参数：`id`。

响应：`DeleteContentProjectResponse`。

错误码：

- `CONTENT_PROJECT_NOT_FOUND`：项目不存在或已删除。
- `CONTENT_PROJECT_DELETE_FAILED`：删除失败。

### 5.7 `GET /api/v1/prompt-templates`

请求参数：无。

响应：`PromptTemplateSummaryDto[]`。

错误码：

- `PROMPT_TEMPLATES_LOAD_FAILED`：模板列表加载失败，可重试。

### 5.8 `POST /api/v1/prompt-templates`

请求体：`CreatePromptTemplateRequest`。

响应：`PromptTemplateDetailDto`。

错误码：

- `VALIDATION_ERROR`：模板名称、内容、内容类型、用途或版本缺失。
- `CONTENT_TYPE_NOT_AVAILABLE`：内容类型不存在或未启用。
- `PROMPT_TEMPLATE_CREATE_FAILED`：保存失败。

### 5.9 `GET /api/v1/prompt-templates/:id`

路径参数：`id`。

响应：`PromptTemplateDetailDto`。

错误码：

- `PROMPT_TEMPLATE_NOT_FOUND`：模板不存在，不可重试。
- `PROMPT_TEMPLATE_LOAD_FAILED`：模板详情加载失败，可重试。

### 5.10 `GET /api/v1/llm-providers/default`

请求参数：无。

响应：`LlmProviderSafeDto | null`。未配置时成功返回 `null`，由 Web 展示未配置状态和新增配置入口。

错误码：

- `LLM_PROVIDER_LOAD_FAILED`：配置加载失败，可重试。

### 5.11 `PUT /api/v1/llm-providers/default`

请求体：`SaveDefaultLlmProviderRequest`。

响应：`LlmProviderSafeDto`，不得包含完整 `apiKey` 或 `encryptedApiKeyValue`。

错误码：

- `VALIDATION_ERROR`：Provider 名称、模型标识或 API Key 缺失；`baseUrl` 不符合 URL 语法或允许协议。
- `LLM_PROVIDER_SAVE_FAILED`：保存失败。

## 6. Module Design

### 6.1 `packages/shared`

职责：定义前后端共享的公共类型、请求/响应类型、错误码和状态常量。

接口：

```ts
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

type ContentProjectStatus = 'draft' | 'active' | 'archived';

type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'CONTENT_TYPES_LOAD_FAILED'
  | 'CONTENT_TYPE_NOT_AVAILABLE'
  | 'CONTENT_PROJECTS_LOAD_FAILED'
  | 'CONTENT_PROJECT_NOT_FOUND'
  | 'CONTENT_PROJECT_LOAD_FAILED'
  | 'CONTENT_PROJECT_CREATE_FAILED'
  | 'CONTENT_PROJECT_SAVE_FAILED'
  | 'CONTENT_PROJECT_DELETE_FAILED'
  | 'PROMPT_TEMPLATES_LOAD_FAILED'
  | 'PROMPT_TEMPLATE_NOT_FOUND'
  | 'PROMPT_TEMPLATE_LOAD_FAILED'
  | 'PROMPT_TEMPLATE_CREATE_FAILED'
  | 'LLM_PROVIDER_LOAD_FAILED'
  | 'LLM_PROVIDER_SAVE_FAILED';

interface ContentTypeDto {
  id: string;
  name: string;
  packId: string;
  enabled: boolean;
}

interface CreateContentProjectRequest {
  name: string;
  contentTypeId: string;
  targetPlatform: string;
  targetContentCount: number;
  defaultGenerationParams: Record<string, unknown>;
}

interface UpdateContentProjectRequest {
  name: string;
  targetPlatform: string;
  targetContentCount: number;
  defaultGenerationParams: Record<string, unknown>;
}

interface ContentProjectSummaryDto {
  id: string;
  name: string;
  contentType: ContentTypeDto;
  targetPlatform: string;
  targetContentCount: number;
  status: ContentProjectStatus;
  createdAt: string;
  updatedAt: string;
}

interface ContentProjectDetailDto extends ContentProjectSummaryDto {
  defaultGenerationParams: Record<string, unknown>;
  promptTemplates: PromptTemplateSummaryDto[];
  defaultLlmProvider: LlmProviderSafeDto | null;
}

interface DeleteContentProjectResponse {
  id: string;
  deleted: true;
}

interface CreatePromptTemplateRequest {
  name: string;
  contentTypeId: string;
  purpose: string;
  content: string;
  version: string;
}

interface PromptTemplateSummaryDto {
  id: string;
  name: string;
  contentType: ContentTypeDto;
  purpose: string;
  version: string;
  contentPreview: string;
  createdAt: string;
  updatedAt: string;
}

interface PromptTemplateDetailDto extends PromptTemplateSummaryDto {
  content: string;
}

interface SaveDefaultLlmProviderRequest {
  name: string;
  model: string;
  baseUrl?: string;
  apiKey: string;
  enabled: boolean;
}

interface LlmProviderSafeDto {
  id: 'default';
  name: string;
  model: string;
  baseUrl?: string;
  enabled: boolean;
  apiKeyConfigured: boolean;
  apiKeyPreview: string | null;
  createdAt: string;
  updatedAt: string;
}
```

字段规则：

- `createdAt`、`updatedAt` 必须为 ISO 8601 字符串。
- `contentPreview` 为模板内容摘要，不超过 120 个字符。
- `apiKeyPreview` 只允许显示前缀和尾部，例如 `sk-***abcd`；无法安全生成预览时返回 `null`。
- `LlmProviderSafeDto` 禁止包含 `apiKey` 或 `encryptedApiKeyValue` 字段。

依赖：无应用层依赖。

### 6.2 `packages/core`

职责：导出通用内容项目领域接口，供后续 core/content-project 扩展使用。本迭代不在 core 中实现数据库 CRUD。

接口：

```ts
interface ContentProjectEntity {
  id: string;
  name: string;
  contentTypeId: string;
  targetPlatform: string;
  targetContentCount: number;
  defaultGenerationParams: Record<string, unknown>;
  status: ContentProjectStatus;
}
```

消费规则：API 层 mapping 或 service 类型声明必须至少有一个编译级引用使用 `ContentProjectEntity`，确保 core 导出与 shared status 类型保持一致。

依赖：可依赖 `packages/shared` 类型。

### 6.3 `apps/api-server/src/content-types`

职责：提供可用内容类型查询。

类和方法：

- `ContentTypesModule`
- `ContentTypesController.listContentTypes(): Promise<ApiSuccessResponse<ContentTypeDto[]>>`：返回启用内容类型；空数组是合法成功响应。
- `ContentTypesService.listEnabledContentTypes(): Promise<ContentTypeDto[]>`：只返回 enabled=true 的类型。
- `ContentTypesService.ensureEnabledContentType(contentTypeId: string): Promise<ContentTypeDto>`：不存在或未启用时抛出 `CONTENT_TYPE_NOT_AVAILABLE`。

依赖：`PrismaService`。

### 6.4 `apps/api-server/src/content-projects`

职责：提供 ContentProject CRUD。

类和方法：

- `ContentProjectsModule`
- `ContentProjectsController.listContentProjects(): Promise<ApiSuccessResponse<ContentProjectSummaryDto[]>>`：返回项目摘要列表，失败映射 `CONTENT_PROJECTS_LOAD_FAILED`。
- `ContentProjectsController.createContentProject(request: CreateContentProjectRequest): Promise<ApiSuccessResponse<ContentProjectDetailDto>>`：成功返回新项目详情，失败不产生可见半成品项目。
- `ContentProjectsController.getContentProject(id: string): Promise<ApiSuccessResponse<ContentProjectDetailDto>>`：不存在映射 `CONTENT_PROJECT_NOT_FOUND`。
- `ContentProjectsController.updateContentProject(id: string, request: UpdateContentProjectRequest): Promise<ApiSuccessResponse<ContentProjectDetailDto>>`：保存后返回最新项目详情。
- `ContentProjectsController.deleteContentProject(id: string): Promise<ApiSuccessResponse<DeleteContentProjectResponse>>`：删除成功返回 `{ id, deleted: true }`。
- `ContentProjectsService.listContentProjects(): Promise<ContentProjectSummaryDto[]>`
- `ContentProjectsService.createContentProject(request: CreateContentProjectRequest): Promise<ContentProjectDetailDto>`
- `ContentProjectsService.getContentProject(id: string): Promise<ContentProjectDetailDto>`
- `ContentProjectsService.updateContentProject(id: string, request: UpdateContentProjectRequest): Promise<ContentProjectDetailDto>`
- `ContentProjectsService.deleteContentProject(id: string): Promise<DeleteContentProjectResponse>`

依赖：`PrismaService`、`ContentTypesService`。

### 6.5 `apps/api-server/src/prompt-templates`

职责：提供 PromptTemplate 保存、列表和详情查询。

类和方法：

- `PromptTemplatesModule`
- `PromptTemplatesController.listPromptTemplates(): Promise<ApiSuccessResponse<PromptTemplateSummaryDto[]>>`：返回模板摘要列表，失败映射 `PROMPT_TEMPLATES_LOAD_FAILED`。
- `PromptTemplatesController.createPromptTemplate(request: CreatePromptTemplateRequest): Promise<ApiSuccessResponse<PromptTemplateDetailDto>>`：校验内容类型、名称、用途、版本、内容后保存。
- `PromptTemplatesController.getPromptTemplate(id: string): Promise<ApiSuccessResponse<PromptTemplateDetailDto>>`：不存在映射 `PROMPT_TEMPLATE_NOT_FOUND`。
- `PromptTemplatesService.listPromptTemplates(): Promise<PromptTemplateSummaryDto[]>`
- `PromptTemplatesService.createPromptTemplate(request: CreatePromptTemplateRequest): Promise<PromptTemplateDetailDto>`
- `PromptTemplatesService.getPromptTemplate(id: string): Promise<PromptTemplateDetailDto>`

依赖：`PrismaService`、`ContentTypesService`。

### 6.6 `apps/api-server/src/llm-providers`

职责：提供默认 LLM Provider 的安全保存和脱敏查询。

类和方法：

- `LlmProvidersModule`
- `LlmProvidersController.getDefaultProvider(): Promise<ApiSuccessResponse<LlmProviderSafeDto | null>>`：未配置时返回 `null`，加载失败映射 `LLM_PROVIDER_LOAD_FAILED`。
- `LlmProvidersController.saveDefaultProvider(request: SaveDefaultLlmProviderRequest): Promise<ApiSuccessResponse<LlmProviderSafeDto>>`：运行时校验 Provider 名称、模型标识、API Key 和 `baseUrl`，保存加密 API Key，并只返回安全 DTO。
- `LlmProvidersService.getDefaultProvider(): Promise<LlmProviderSafeDto | null>`
- `LlmProvidersService.saveDefaultProvider(request: SaveDefaultLlmProviderRequest): Promise<LlmProviderSafeDto>`：持久化前加密 API Key，不记录或返回明文。`
- `LlmProvidersService.toSafeDto(provider: LlmProviderRecord): LlmProviderSafeDto`：输出不得包含完整 API Key 或 `encryptedApiKeyValue`。

依赖：`PrismaService`。

### 6.7 `apps/web-admin`

职责：提供管理台基础导航、项目管理、PromptTemplate 和 LLM Provider 配置入口。

页面和组件：

- `app/page.tsx`：管理台首页和导航。
- `app/content-projects/page.tsx`：项目列表、空状态、加载失败和重试入口。
- `app/content-projects/new/page.tsx`：项目创建表单；无可用内容类型时提示并禁用提交。
- `app/content-projects/[id]/page.tsx`：项目详情、编辑、删除确认、加载失败和重试入口。
- `app/prompt-templates/page.tsx`：PromptTemplate 列表、详情入口、保存入口、空状态、加载失败和重试入口。
- `app/prompt-templates/[id]/page.tsx`：PromptTemplate 详情页。
- `app/llm-provider/page.tsx`：默认 LLM Provider 配置入口；API Key 仅写入不明文展示。
- `lib/api-client.ts`：封装对 `/api/v1/*` 的调用。

依赖：`packages/shared` 类型。

## 7. Output Contract

### 7.1 Content Type 查询

- 业务描述：Web 管理台查询当前可选内容类型，首期返回 Novel；无启用类型时返回空数组并展示暂无可用内容类型。
- 规范化 type id：`web-e2e`、`integration`、`library`
- 输入：无。
- 输出：`ContentTypeDto[]`，只包含启用内容类型。
- 正确性规则：Novel 作为可选内容类型存在；未启用类型不得出现在创建入口；空数组是成功响应，Web 禁用创建提交。
- 是否跨组件：是（Web Create Form -> api-client -> ContentTypesController -> ContentTypesService -> Prisma）。
- 断点断言：Controller 响应为统一格式；Service 过滤 enabled；Web 对空数组展示空状态。
- 测试规范：`cube/standards/testing/web-e2e.md`、`cube/standards/testing/integration.md`、`cube/standards/testing/library.md`。

### 7.2 ContentProject CRUD

- 业务描述：创建、列表、详情、编辑、删除通用内容项目。
- 规范化 type id：`web-e2e`、`integration`、`library`
- 输入：`CreateContentProjectRequest`、`UpdateContentProjectRequest`、项目 ID。
- 输出：`ContentProjectSummaryDto[]`、`ContentProjectDetailDto`、`DeleteContentProjectResponse`。
- 正确性规则：名称、内容类型、目标内容数量必须校验；创建成功后列表可见；编辑后列表和详情显示最新信息；删除前 Web 必须确认；删除后详情不可访问；加载失败必须提供重试入口。
- 是否跨组件：是（Web Create/Edit/Delete Flow -> api-client -> ContentProjectsController -> ContentProjectsService -> ContentTypesService.ensureEnabledContentType -> Prisma）。
- 断点断言：Controller 入参校验；Service 校验内容类型；Prisma 创建/更新/删除结果映射为 DTO；Web 保持内容类型无关文案。
- 测试规范：`cube/standards/testing/web-e2e.md`、`cube/standards/testing/integration.md`、`cube/standards/testing/library.md`。

### 7.3 PromptTemplate 管理入口

- 业务描述：保存并查看与内容生产相关的 PromptTemplate。
- 规范化 type id：`web-e2e`、`integration`、`library`
- 输入：`CreatePromptTemplateRequest`、模板 ID。
- 输出：`PromptTemplateSummaryDto[]`、`PromptTemplateDetailDto`。
- 正确性规则：模板名称、内容、内容类型、用途、版本必须校验；模板可按内容类型、用途或 Agent、版本识别；列表可进入详情；加载失败必须提供重试入口。
- 是否跨组件：是（Project Detail/PromptTemplates Page -> api-client -> PromptTemplatesController -> PromptTemplatesService -> ContentTypesService.ensureEnabledContentType -> Prisma）。
- 断点断言：模板详情返回完整 `content`；列表只返回 `contentPreview`；内容类型不存在时保存失败。
- 测试规范：`cube/standards/testing/web-e2e.md`、`cube/standards/testing/integration.md`、`cube/standards/testing/library.md`。

### 7.4 默认 LLM Provider 配置

- 业务描述：保存并安全展示系统默认 LLM Provider。
- 规范化 type id：`web-e2e`、`integration`、`library`
- 输入：`SaveDefaultLlmProviderRequest`。
- 输出：`LlmProviderSafeDto | null`。
- 正确性规则：Provider 名称、模型标识、API Key 必填；Base URL 如提供则必须通过运行时 URL 校验和允许协议校验；未配置时返回 null；普通查询和 UI 不返回完整 API Key；错误提示不泄露密钥、连接串或内部堆栈；加载失败必须提供重试入口。
- 是否跨组件：是（Web Provider Form -> api-client -> LlmProvidersController -> validation -> LlmProvidersService.toSafeDto -> Prisma）。
- 断点断言：Controller 不回传 `apiKey`；Service `toSafeDto()` 输出 `apiKeyConfigured` 和脱敏 `apiKeyPreview`；Web 不渲染完整密钥。
- 测试规范：`cube/standards/testing/web-e2e.md`、`cube/standards/testing/integration.md`、`cube/standards/testing/library.md`。

### 7.5 SQL Contract

- 业务描述：本迭代不产出 SQL/query generator。
- 规范化 type id：`none`
- 目标方言：PostgreSQL，通过 Prisma schema 和 Prisma Client 访问。
- 输入：Prisma Client query 参数，不接受 SQL 字符串作为业务输入。
- 输出：Prisma Client 返回的 typed records，经 Service 映射为 DTO。
- 正确性规则：禁止使用 `prisma.$queryRawUnsafe` 或字符串拼接 SQL；查询结构以 Prisma schema 与 Prisma Client API 为准；无需编写 expected SQL 字符串契约测试。
- 典型结构：`prisma.contentProject.findMany({ include: { contentType: true } })`、`prisma.llmProvider.upsert({ where: { id: 'default' }, ... })`。
- 产出类型 `none` 仅用于不暴露独立运行时行为的结构性变更，例如 Prisma schema、模块挂载或 SQL generator 不适用声明；其闭环通过相邻 `integration`、`library` 或 `web-e2e` 任务验证。

## 8. Change Log

| 模块/文件 | 类型 | 原因 |
|-----------|------|------|
| `apps/api-server/prisma/schema.prisma` | 修改 | 新增内容类型、内容项目、PromptTemplate、LLM Provider 数据模型。 |
| `apps/api-server/src/app.module.ts` | 修改 | 挂载新增业务模块。 |
| `apps/api-server/src/content-types/*` | 新增 | 提供内容类型查询和启用校验。 |
| `apps/api-server/src/content-projects/*` | 新增 | 提供 ContentProject CRUD API，并消费 core 领域接口。 |
| `apps/api-server/src/prompt-templates/*` | 新增 | 提供 PromptTemplate 保存和查看 API。 |
| `apps/api-server/src/llm-providers/*` | 新增 | 提供默认 LLM Provider 保存和安全查询 API。 |
| `apps/web-admin/src/app/page.tsx` | 修改 | 将占位首页替换为管理台导航入口。 |
| `apps/web-admin/src/app/content-projects/*` | 新增 | 提供项目列表、创建、详情、编辑、删除入口。 |
| `apps/web-admin/src/app/prompt-templates/*` | 新增 | 提供 PromptTemplate 列表、详情和保存入口。 |
| `apps/web-admin/src/app/llm-provider/*` | 新增 | 提供默认 LLM Provider 配置入口。 |
| `apps/web-admin/src/lib/api-client.ts` | 新增 | 封装 Web 到 API 的请求。 |
| `packages/shared/src/*` | 修改 + 新增 | 导出共享类型、请求/响应契约和错误码。 |
| `packages/core/src/*` | 修改 + 新增 | 导出通用内容项目领域接口并被 API 层编译级消费。 |
| `.cube/iterations/feature-iter_1/skeleton-map.yaml` | 新增 | 记录接口骨架与开发任务的映射关系。 |

## 9. Development Tasks

- Task-01：定义共享 API 响应、错误码和内容项目类型
  - 所属模块：packages/shared
  - 简要描述：定义统一 API 响应、错误码、ContentType、ContentProject、PromptTemplate、LLM Provider 请求和响应类型。
  - 涉及接口/方法：ApiSuccessResponse、ApiErrorResponse、ContentTypeDto、ContentProjectSummaryDto、ContentProjectDetailDto、PromptTemplateSummaryDto、PromptTemplateDetailDto、LlmProviderSafeDto、DeleteContentProjectResponse
  - 输入：无
  - 输出：共享 TypeScript 类型和错误码常量
  - 产出类型：library
  - 功能类型：共享类型契约（type id: library）
  - 是否跨组件：否
  - 正确性规则：所有 API Design 引用的 DTO 都在 shared 中有字段定义；时间字段为 ISO 字符串；`LlmProviderSafeDto` 不包含完整 API Key；覆盖 FR-001~FR-010、NFR-001~NFR-003、AC-001~AC-010。
- Task-02：定义通用内容项目领域接口
  - 所属模块：packages/core
  - 简要描述：导出 ContentProjectEntity 等通用领域接口，不实现 CRUD 业务逻辑。
  - 涉及接口/方法：ContentProjectEntity
  - 输入：共享内容项目状态和基础字段
  - 输出：core 领域接口导出
  - 产出类型：library
  - 功能类型：公共库接口（type id: library）
  - 是否跨组件：否
  - 正确性规则：接口不出现 book/chapter 等小说专属核心命名；字段与 shared 状态类型一致；覆盖 NFR-004、AC-012、AC-013。
- Task-03：新增 core 接口消费映射
  - 所属模块：apps/api-server
  - 简要描述：在 API 层 mapping 或 service 类型声明中编译级引用 ContentProjectEntity，证明 core 导出被实际消费。
  - 涉及接口/方法：ContentProjectEntity mapping
  - 输入：Prisma ContentProject record 形状
  - 输出：ContentProjectEntity 或基于该接口的 DTO mapping 类型
  - 产出类型：library
  - 功能类型：跨包类型消费（type id: library）
  - 是否跨组件：否
  - 正确性规则：`pnpm -r typecheck` 下无未使用或字段漂移；接口字段与 shared status 类型一致；覆盖 NFR-004。
- Task-04：新增 Prisma 数据模型
  - 所属模块：apps/api-server
  - 简要描述：在 Prisma schema 中新增 ContentType、ContentProject、PromptTemplate、LlmProvider 模型。
  - 涉及接口/方法：Prisma schema models
  - 输入：Table Design 中的字段和约束
  - 输出：可生成 Prisma Client 的 schema
  - 产出类型：none
  - 功能类型：数据模型定义（type id: none）
  - 是否跨组件：否
  - 正确性规则：模型不包含 book/chapter 核心命名；LlmProvider 使用 `encryptedApiKeyValue` 而非明文字段；覆盖 FR-001~FR-010、NFR-001、AC-012。
- Task-05：实现内容类型查询 API 骨架
  - 所属模块：apps/api-server
  - 简要描述：新增 ContentTypesModule、Controller、Service，提供启用内容类型列表和内容类型启用校验接口。
  - 涉及接口/方法：GET /api/v1/content-types、listEnabledContentTypes()、ensureEnabledContentType()
  - 输入：无或 contentTypeId
  - 输出：ContentTypeDto[] 或 ContentTypeDto
  - 产出类型：integration
  - 功能类型：API 跨组件查询（type id: integration）
  - 是否跨组件：是（Controller -> Service -> Prisma）
  - 正确性规则：只返回 enabled 内容类型；无可用内容类型时返回空数组；无效 contentTypeId 抛出 `CONTENT_TYPE_NOT_AVAILABLE`；覆盖 FR-002、AC-001、AC-013。
- Task-06：实现内容项目 CRUD API 骨架
  - 所属模块：apps/api-server
  - 简要描述：新增 ContentProjectsModule、Controller、Service，提供项目创建、列表、详情、编辑和删除接口。
  - 涉及接口/方法：GET/POST/PATCH/DELETE /api/v1/content-projects、listContentProjects()、createContentProject()、getContentProject()、updateContentProject()、deleteContentProject()
  - 输入：CreateContentProjectRequest、UpdateContentProjectRequest、项目 ID
  - 输出：ContentProjectSummaryDto[]、ContentProjectDetailDto、DeleteContentProjectResponse
  - 产出类型：integration
  - 功能类型：API 跨组件 CRUD（type id: integration）
  - 是否跨组件：是（Controller -> Service -> ContentTypesService -> Prisma）
  - 正确性规则：创建校验名称、内容类型、目标数量；列表和详情返回通用内容项目字段；编辑后返回最新 DTO；删除返回 `{ deleted: true }`；错误码覆盖校验、not found、load/create/save/delete failed；覆盖 FR-001、FR-003~FR-006、AC-001~AC-006。
- Task-07：实现 PromptTemplate API 骨架
  - 所属模块：apps/api-server
  - 简要描述：新增 PromptTemplatesModule、Controller、Service，提供模板保存、列表和详情接口。
  - 涉及接口/方法：GET/POST /api/v1/prompt-templates、GET /api/v1/prompt-templates/:id、listPromptTemplates()、createPromptTemplate()、getPromptTemplate()
  - 输入：CreatePromptTemplateRequest、模板 ID
  - 输出：PromptTemplateSummaryDto[]、PromptTemplateDetailDto
  - 产出类型：integration
  - 功能类型：API 跨组件管理入口（type id: integration）
  - 是否跨组件：是（Controller -> Service -> ContentTypesService -> Prisma）
  - 正确性规则：保存校验名称、内容、内容类型、用途、版本；列表返回摘要和版本；详情返回完整内容；错误码覆盖 validation、not found、load/create failed；覆盖 FR-007、FR-008、AC-007、AC-008。
- Task-08：实现默认 LLM Provider API 骨架
  - 所属模块：apps/api-server
  - 简要描述：新增 LlmProvidersModule、Controller、Service，提供默认 Provider 保存和安全查询接口。
  - 涉及接口/方法：GET/PUT /api/v1/llm-providers/default、getDefaultProvider()、saveDefaultProvider()、toSafeDto()
  - 输入：SaveDefaultLlmProviderRequest
  - 输出：LlmProviderSafeDto | null
  - 产出类型：integration
  - 功能类型：API 跨组件安全配置（type id: integration）
  - 是否跨组件：是（Controller -> Service -> Prisma）
  - 正确性规则：未配置返回 null；保存校验 name/model/apiKey；baseUrl 如提供则校验 URL 语法和允许协议；查询和保存响应均不包含完整 API Key；错误不泄露密钥、连接串或堆栈；覆盖 FR-009、FR-010、NFR-001、NFR-003、AC-009、AC-010。
- Task-09：挂载 API 业务模块
  - 所属模块：apps/api-server
  - 简要描述：在 AppModule 中挂载 ContentTypesModule、ContentProjectsModule、PromptTemplatesModule、LlmProvidersModule。
  - 涉及接口/方法：AppModule imports
  - 输入：新增模块类
  - 输出：应用启动时加载新增 API 模块
  - 产出类型：none
  - 功能类型：模块集成（type id: none）
  - 是否跨组件：否
  - 正确性规则：不改变 `/health`；新增模块可被 NestJS 编译加载；覆盖 FR-001~FR-010。
- Task-10：实现 Web API Client 骨架
  - 所属模块：apps/web-admin
  - 简要描述：封装内容类型、内容项目、PromptTemplate、LLM Provider 的 API 调用方法签名。
  - 涉及接口/方法：listContentTypes()、listContentProjects()、createContentProject()、getContentProject()、updateContentProject()、deleteContentProject()、listPromptTemplates()、createPromptTemplate()、getPromptTemplate()、getDefaultLlmProvider()、saveDefaultLlmProvider()
  - 输入：共享请求类型和资源 ID
  - 输出：共享响应类型 Promise
  - 产出类型：library
  - 功能类型：Web API 调用库（type id: library）
  - 是否跨组件：否
  - 正确性规则：每个 API Design endpoint 都有对应 client 方法；错误响应保留错误码供 UI 重试/错误态使用；覆盖 FR-001~FR-010、NFR-007。
- Task-11：实现 Web 管理台基础导航骨架
  - 所属模块：apps/web-admin
  - 简要描述：替换占位首页，提供项目管理、PromptTemplate、LLM Provider 配置导航入口。
  - 涉及接口/方法：HomePage()
  - 输入：访问管理台首页
  - 输出：包含通用内容项目入口的页面结构
  - 产出类型：web-e2e
  - 功能类型：Web 页面导航（type id: web-e2e）
  - 是否跨组件：否
  - 正确性规则：导航包含项目管理、PromptTemplate、LLM Provider 配置；页面不出现 Book/Chapter 作为核心概念；覆盖 FR-011、FR-012、AC-011~AC-013。
- Task-12：实现内容项目 Web 页面骨架
  - 所属模块：apps/web-admin
  - 简要描述：新增项目列表、创建、详情、编辑和删除确认入口页面骨架。
  - 涉及接口/方法：ContentProjectsPage()、NewContentProjectPage()、ContentProjectDetailPage()
  - 输入：页面访问、表单输入、项目 ID
  - 输出：项目列表、空状态、详情、表单、PromptTemplate 关联入口、默认 LLM Provider 配置入口和删除确认页面结构
  - 产出类型：web-e2e
  - 功能类型：Web 项目管理流程（type id: web-e2e）
  - 是否跨组件：是（Web Page -> API Client）
  - 正确性规则：空列表展示创建入口；加载失败展示重试；项目详情展示基础信息、关联 PromptTemplate 入口和默认 LLM Provider 配置入口；创建表单只允许 Novel 可选类型；删除必须确认；保存失败保留输入；覆盖 FR-001~FR-006、FR-012、NFR-007、NFR-008、AC-001~AC-006、AC-012、AC-013。
- Task-13：实现 PromptTemplate Web 页面骨架
  - 所属模块：apps/web-admin
  - 简要描述：新增 PromptTemplate 列表、详情和保存入口页面骨架。
  - 涉及接口/方法：PromptTemplatesPage()、PromptTemplateDetailPage()
  - 输入：页面访问、模板 ID 和模板表单输入
  - 输出：模板列表、详情、空状态、重试入口和保存入口页面结构
  - 产出类型：web-e2e
  - 功能类型：Web 模板管理入口（type id: web-e2e）
  - 是否跨组件：是（Web Page -> API Client）
  - 正确性规则：空列表展示创建入口；加载失败展示重试；列表可进入详情；详情展示版本、用途和内容；保存失败保留输入；覆盖 FR-007、FR-008、FR-012、AC-007、AC-008、AC-012、AC-013。
- Task-14：实现 LLM Provider Web 页面骨架
  - 所属模块：apps/web-admin
  - 简要描述：新增默认 LLM Provider 配置页面骨架，API Key 字段仅写入不明文展示。
  - 涉及接口/方法：LlmProviderPage()
  - 输入：页面访问和 Provider 表单输入
  - 输出：脱敏配置展示、未配置状态、重试入口和保存入口页面结构
  - 产出类型：web-e2e
  - 功能类型：Web 安全配置入口（type id: web-e2e）
  - 是否跨组件：是（Web Page -> API Client）
  - 正确性规则：未配置展示新增入口；已配置只展示 `apiKeyConfigured` 或脱敏 `apiKeyPreview`；加载失败展示重试；保存失败保留非敏感输入；覆盖 FR-009、FR-010、FR-012、NFR-001~NFR-003、AC-009、AC-010、AC-012、AC-013。
