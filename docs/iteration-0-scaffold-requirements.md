# Iteration 0：项目脚手架与基础工程

> 文件定位：本文件是迭代 0 的需求评审与开发范围文档。  
> 蓝图约束：本迭代必须遵守 `00-product-blueprint.md`。  
> 开发规则：进入开发前必须完成本文件中的需求评审检查。  
> 评审日期：2026-05-09  
> 评审结论摘要：评审通过。迭代 0 与产品蓝图无背离，可进入开发；需在本迭代内补齐技术栈基线、目录边界、配置规范、迁移校验和 CI 检查脚本。  
> 是否需要更新蓝图：否。

---

## 1. 迭代目标

建立 AI Content Factory 的工程底座，确保后续所有功能以通用内容工厂架构展开。

评审后明确：本迭代的核心交付不是业务功能，而是可运行、可扩展、可评审的工程骨架。项目根命名、目录边界、配置规范和 CI 检查必须先稳定，避免后续迭代把 Novel Factory 误作为系统本体。

---

## 2. 蓝图对齐说明

| 蓝图约束 | 本迭代对齐方式 |
|---|---|
| 核心平台内容类型无关 | 本迭代不得把小说专属逻辑写入 Core |
| 内容类型插件化 | Novel 相关能力必须放入 Novel Pack 或扩展模型 |
| 工作流可配置 | 涉及流程时必须通过 WorkflowTemplate / WorkflowRun 承载；本迭代仅预留目录，不实现流程 |
| Agent 可追踪 | 涉及 Agent 时必须记录 AgentTask 和 LLMCallLog；本迭代仅预留 agent-runtime 目录，不实现 Agent |
| 发布平台适配器化 | 涉及发布时必须通过 PublishJob / PlatformAdapter 承载；本迭代仅预留 platform-adapters 目录 |
| 指标通用化 | 涉及数据时必须通过 MetricRecord / MetricTemplate 承载；本迭代不实现指标模型 |
| 人工节点保留 | 审稿、发布、策略等关键动作必须支持人工确认；本迭代不实现相关流程 |
| 迭代可评审 | 开发前必须完成需求评审与验收标准确认；本文件完成评审后作为开发依据 |

### 2.1 初步对齐检查

| 检查项 | 初始需求描述 | 蓝图定义 | 状态 |
|---|---|---|---|
| 产品命名 | 确认产品命名为 AI Content Factory | 蓝图将 AI Content Factory 定义为系统本体 | ✅ 对齐 |
| Novel Factory 定位 | Novel Factory 作为 Novel Pack，不是系统本体 | Novel Factory 是 AI Content Factory 的第一个垂直内容包 Novel Pack | ✅ 对齐 |
| 核心平台边界 | Core 不写小说专属逻辑 | 核心表不得写死 Book / Chapter，使用 ContentProject / ContentItem | ✅ 对齐 |
| 内容包边界 | 预留 Content Packs | 小说、文章、短视频等通过 Content Pack 扩展 | ✅ 对齐 |
| 平台适配边界 | 预留 Platform Adapters | 新平台通过 Platform Adapter 扩展 | ✅ 对齐 |
| 工程目录结构 | 建立 apps、packages、docs、scripts 基础目录 | 蓝图给出 apps/web-admin、apps/api-server、packages/core、content-packs、platform-adapters、shared 等结构 | ⚠️ 初始描述偏粗，已补充为明确目录验收 |
| 技术栈基线 | 初始化项目仓库、迁移、配置、日志、CI | 蓝图建议 Next.js / NestJS 或 FastAPI、PostgreSQL、Redis、OpenAI-compatible Adapter 等 | ⚠️ 初始描述未锁定基线，已补充默认技术选型 |
| 业务模型范围 | 不落地完整业务模型，仅准备 migration 基础 | Iteration 1 才开始 ContentProject / ContentType / ContentItem | ✅ 对齐 |
| Agent / 工作流范围 | 不实现 Agent，仅预留 agent-runtime 包目录 | Workflow Engine 与 Agent Runtime 在 Iteration 2 建设 | ✅ 对齐 |

---

## 3. 产品需求

- 确认产品命名为 AI Content Factory。
- 确认 Novel Factory 作为 Novel Pack，而不是系统本体。
- 整理 Phase 0 的 Prompt、章节、数据记录和失败原因。
- 建立基础文档目录、迭代目录和评审流程。
- 明确后续所有需求评审均以产品蓝图为最高约束。

### 3.1 评审后补充产品需求

- 项目根目录命名必须使用 `ai-content-factory`，不得使用 `novel-factory` 作为系统根命名。
- 文档目录必须至少包含：
  - `docs/product/`
  - `docs/architecture/`
  - `docs/iterations/`
  - `docs/content-packs/`
- `00-product-blueprint.md`、`00-product-blueprint-README.md`、`iteration-README.md` 和 `iteration-0-scaffold-requirements.md` 必须进入 docs 目录，并保持可追踪。
- Phase 0 历史资料只能作为 Novel Pack 的输入资料归档，不得反向影响 Core 层命名和领域模型。
- 本迭代只提供工程默认入口和健康检查，不开发业务页面。

---

## 4. 技术需求

- 初始化项目仓库和目录结构。
- 建立 apps、packages、docs、scripts 基础目录。
- 初始化数据库迁移工具。
- 建立基础配置管理、环境变量规范和日志规范。
- 建立 Core / Content Packs / Platform Adapters 的代码边界。
- 建立基础 CI 检查脚本。

### 4.1 评审后补充技术需求

- 技术栈基线默认采用：
  - 前端：`apps/web-admin`，Next.js + TypeScript。
  - 后端：`apps/api-server`，NestJS + TypeScript。
  - 数据库：PostgreSQL。
  - Monorepo：pnpm workspace。
  - 共享包：`packages/shared`。
- 必须建立以下代码边界：

```text
packages/core/
packages/content-packs/novel-pack/
packages/platform-adapters/
packages/shared/
```

- `packages/core` 中不得出现 `book`、`chapter`、`novel` 等小说专属领域命名。
- `packages/content-packs/novel-pack` 可以出现 Novel 专属命名，但不得被 Core 反向依赖。
- `packages/platform-adapters` 仅保留适配器接口和目录占位，不实现平台自动化。
- 配置管理必须提供 `.env.example`，并区分至少以下配置：
  - 应用端口
  - 数据库连接
  - 日志级别
  - LLM Provider 占位配置
- 日志规范必须采用结构化日志，至少包含 `timestamp`、`level`、`module`、`message` 字段。
- 数据库迁移工具必须能够连接 PostgreSQL 并执行空迁移或迁移状态检查；本迭代不创建业务表。
- CI 检查脚本至少包含：
  - install
  - lint
  - typecheck
  - test 或 test:placeholder
  - migration check 或 db check

---

## 5. 涉及数据模型

- `无完整业务模型落地，仅准备 migration 基础。`

评审后明确：本迭代不得创建 `book`、`chapter`、`content_project`、`content_item` 等业务表。`content_project` / `content_type` / `content_item` 将在 Iteration 1 中落地。

---

## 6. 涉及 Agent / 工作流

- 不实现 Agent，仅预留 agent-runtime 包目录。

评审后明确：本迭代不得实现 WorkflowTemplate、WorkflowRun、AgentTask、LLMCallLog 等业务模型；仅保留目录、接口占位或 README 说明。相关能力进入 Iteration 2。

---

## 7. 验收标准

- [ ] 项目可以在本地启动。
- [ ] 基础目录结构与蓝图一致。
- [ ] docs 中存在产品蓝图、迭代总览和迭代 0 文档。
- [ ] 核心目录命名不得使用 novel-factory 作为系统根命名。
- [ ] 能够执行空数据库迁移。
- [ ] 能够加载基础配置。

### 7.1 评审后补充验收标准

- [ ] 项目根目录为 `ai-content-factory`。
- [ ] `apps/web-admin` 可以启动默认页面或健康检查页。
- [ ] `apps/api-server` 可以启动并提供 `/health` 检查接口。
- [ ] `packages/core`、`packages/content-packs/novel-pack`、`packages/platform-adapters`、`packages/shared` 目录存在。
- [ ] Core 目录扫描不得出现 `book`、`chapter`、`novel` 等小说专属领域命名。
- [ ] `.env.example` 存在，且本地应用可从环境变量加载基础配置。
- [ ] PostgreSQL 连接检查或空迁移命令可以执行成功。
- [ ] CI 脚本可以执行 lint、typecheck、测试占位和数据库检查。
- [ ] Phase 0 历史资料归档在 Novel Pack 文档目录，不进入 Core。

---

## 8. 需求评审检查项

- [x] 是否已经从 Novel Factory 命名调整为 AI Content Factory？
- [x] 是否避免在 Core 层出现 Book、Chapter 等小说专属命名？
- [x] 是否为 Content Pack 和 Platform Adapter 预留边界？
- [x] 是否具备后续迭代文档和评审流程？

### 8.1 评审意见

| 维度 | 评审结论 | 建议 |
|---|---|---|
| 完整性 | 初始需求覆盖工程脚手架主线，但对技术栈、目录边界、CI、配置和迁移验收不够细 | 已补充为可验收条目 |
| 合理性 | 不实现业务模型、不实现 Agent、不实现页面业务是合理的 | 仅保留默认入口和健康检查，避免范围膨胀 |
| 一致性 | 与蓝图和后续迭代顺序一致；Iteration 1 再实现内容项目模型，Iteration 2 再实现 Agent / Workflow | 保持 Iteration 0 只做基础工程 |
| 风险点 | 若目录和命名不收紧，后续容易把 Novel Factory 当作系统本体 | 通过根目录命名、Core 扫描、Novel Pack 归档边界控制风险 |

---

## 9. 本迭代明确不做

- 不做业务页面开发，仅允许默认首页或健康检查页。
- 不做 Agent 执行。
- 不做内容生成。
- 不做发布和数据看板。
- 不做 ContentProject / ContentType / ContentItem 业务模型。
- 不做 WorkflowTemplate / WorkflowRun / AgentTask / LLMCallLog 业务模型。
- 不做 Novel Pack 的世界观、人物、大纲、章节等具体业务能力。

---

## 10. 评审结论记录

| 项目 | 结论 |
|---|---|
| 产品评审结论 | 通过。产品命名、Novel Pack 定位、文档评审流程与蓝图一致。 |
| 技术评审结论 | 有条件通过。需按本文件补充技术栈基线、目录边界、配置规范、迁移检查和 CI 脚本。 |
| 是否允许进入开发 | 允许进入开发。 |
| 评审人 | ChatGPT |
| 评审日期 | 2026-05-09 |
| 主要风险 | 工程目录过粗导致 Core / Content Pack 边界不清；技术栈未锁定导致后续迭代工程风格不一致；Phase 0 小说资料误污染 Core 命名。 |
| 调整项 | 增加技术栈基线、明确目录结构、补充 Core 禁用命名、补充 env / log / migration / CI 验收标准。 |

---

## 11. 开发完成验收记录

| 项目 | 结论 |
|---|---|
| 是否完成全部验收标准 | 待验收 |
| 是否存在蓝图偏离 | 待验收 |
| 是否允许进入下一迭代 | 待确认 |
| 遗留问题 | 待填写 |

---

## 12. 最终需求变更说明

| 变更项 | 变更内容 | 原因 |
|---|---|---|
| 项目命名 | 明确项目根目录为 `ai-content-factory` | 避免继续使用 Novel Factory 作为系统本体命名 |
| 技术栈基线 | 默认采用 Next.js + NestJS + TypeScript + PostgreSQL + pnpm workspace | 蓝图允许该技术路线，迭代 0 需要锁定工程基线 |
| 目录边界 | 明确 `core`、`content-packs`、`platform-adapters`、`shared` 的最小目录 | 防止 Core 与 Novel Pack 混写 |
| Core 命名约束 | Core 禁止出现 `book`、`chapter`、`novel` 等领域命名 | 落实核心平台内容类型无关原则 |
| Phase 0 归档 | Phase 0 历史资料只归档在 Novel Pack 文档中 | 防止历史小说工厂资料污染通用架构 |
| 验收标准 | 增加健康检查、配置加载、迁移检查、CI 检查、目录扫描 | 将“基础工程”转化为可验证交付 |
| 不做范围 | 增加不做业务模型、Agent 模型、Workflow 模型、Novel 具体能力 | 防止 Iteration 0 范围膨胀 |

---

## 13. 最终对齐验证

| 检查项 | 最终结论 |
|---|---|
| 是否符合 AI Content Factory Core + Content Pack 架构 | ✅ 符合 |
| 是否存在把小说逻辑写入核心平台的风险 | ✅ 已通过 Core 禁用命名和 Novel Pack 归档边界控制 |
| 是否新增无法通用化的字段、流程或状态 | ✅ 未新增业务字段、流程或状态 |
| 是否保留后续人工审核、人工发布、人工覆盖能力的架构空间 | ✅ 已预留，但本迭代不实现 |
| 是否有明确验收标准 | ✅ 已补充为可执行验收项 |
| 是否支持后续 Article Pack / Social Post Pack 扩展 | ✅ 通过 Content Pack 边界支持 |
| 是否需要更新产品蓝图 | 否 |

结论：属于情况 A — 无蓝图背离。已更新本迭代需求文档，不需要修改 `00-product-blueprint.md`。
