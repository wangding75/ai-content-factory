# AI Content Factory 产品蓝图

> 文档定位：本蓝图是后续所有迭代需求评审、技术评审、架构设计和开发实现的最高约束文档。  
> 核心原则：迭代计划、需求拆解、技术实现不得背离本蓝图。  
> 当前版本：v1.0

---

## 1. 产品定位

AI Content Factory 是一个面向多内容形态的 AI 内容生产、审核、分发、数据反馈和策略优化系统。

Novel Factory 不再作为系统本体，而是作为 AI Content Factory 的第一个垂直内容包 Novel Pack。

```text
AI Content Factory Core
  ├── Novel Pack：AI 小说工厂
  ├── Article Pack：公众号 / 知乎 / SEO 文章
  ├── Short Video Pack：短视频脚本
  ├── Social Post Pack：小红书 / 微博图文
  ├── Marketing Pack：营销文案 / 落地页 / 广告文案
  └── Course Pack：课程内容
```

---

## 2. 核心目标

| 层级 | 目标 |
|---|---|
| 短期目标 | 先用 Novel Pack 跑通 AI 内容生产闭环 |
| 中期目标 | 支持多内容项目、多平台发布、数据反馈和策略建议 |
| 长期目标 | 形成可扩展的 AI 内容生产、分发、复盘、优化系统 |

---

## 3. 产品核心价值

| 价值 | 说明 |
|---|---|
| AI 内容生产 | 用 Agent 工作流完成选题、结构、生成、审稿、改写 |
| 多内容类型扩展 | 小说、文章、短视频、图文、营销文案均以内容包扩展 |
| 多平台分发 | 通过 Platform Adapter 适配不同平台 |
| 数据反馈优化 | 采集阅读、完读、点赞、收藏、转化等指标 |
| Portfolio 管理 | 对多个内容项目进行资源分配、加仓、优化和停止 |
| 成本可控 | 统一 LLM Router 记录模型调用、Token、成本和失败情况 |

---

## 4. 系统分层架构

```text
外部平台层
  ↓
平台适配层 Platform Adapter
  ↓
内容业务层 Content Business
  ↓
工作流编排层 Workflow Engine
  ↓
Agent 执行层 Agent Runtime
  ↓
知识与记忆层 Knowledge Memory
  ↓
LLM 路由层 LLM Router
```

| 层级 | 职责 |
|---|---|
| 外部平台层 | 番茄、七猫、公众号、小红书、知乎、抖音、B站等 |
| 平台适配层 | 发布辅助、数据采集、平台格式转换 |
| 内容业务层 | 内容项目、内容单元、内容计划、发布任务、指标数据 |
| 工作流编排层 | 按内容类型执行不同生产流程 |
| Agent 执行层 | Topic、Research、Draft、Review、Strategy 等 Agent |
| 知识与记忆层 | Static Context、Dynamic State、Recent Content、Style Guide |
| LLM 路由层 | 多模型调用、Fallback、成本统计、调用日志 |

---

## 5. 核心领域模型

| 模型 | 说明 | 替代原小说概念 |
|---|---|---|
| ContentProject | 内容项目 | Book |
| ContentType | 内容类型 | 小说 / 文章 / 短视频等分类 |
| ContentItem | 内容单元 | Chapter |
| ContentPlan | 内容计划 | Outline |
| ContentAsset | 内容资产 | Worldview / 资料库 |
| AudienceProfile | 受众画像 | 读者画像 / 用户画像 |
| StyleGuide | 风格指南 | 写作风格 / 品牌语气 |
| WorkflowTemplate | 工作流模板 | 小说生成流程 |
| WorkflowRun | 工作流执行实例 | 一次内容生成流程 |
| AgentTask | Agent 任务 | Agent 执行记录 |
| PromptTemplate | Prompt 模板 | Agent Prompt |
| LLMCallLog | LLM 调用日志 | 模型调用记录 |
| PublishTarget | 发布目标 | 平台账号 / 栏目 |
| PublishJob | 发布任务 | 发布队列 |
| MetricRecord | 指标记录 | 留存率 / 完读率等 |
| StrategySuggestion | 策略建议 | keep / optimize / suspend / promote |
| ProjectPortfolio | 项目组合 | 多书 / 多内容项目 Portfolio |

---

## 6. 内容类型插件

核心平台不直接写死小说、文章、短视频等业务逻辑。不同内容类型通过 Content Pack 扩展。

| 内容包 | 内容类型 | 专属能力 |
|---|---|---|
| Novel Pack | 网文小说 | 世界观、人物、章节、爽点、连续性 |
| Article Pack | 公众号 / 知乎 / SEO | 资料整理、论点结构、标题优化 |
| Short Video Pack | 短视频脚本 | 开头钩子、分镜、口播、完播率优化 |
| Social Post Pack | 小红书 / 微博 | 种草文案、标签、封面文案 |
| Marketing Pack | 广告 / 落地页 | 卖点、痛点、CTA、转化率优化 |
| Course Pack | 课程内容 | 课程大纲、课件、练习题、总结 |

---

## 7. 通用 Agent 体系

| Agent | 职责 | 适用范围 |
|---|---|---|
| TopicAgent | 生成选题、评估选题价值 | 全部内容类型 |
| ResearchAgent | 收集资料、提炼背景信息 | 文章、视频、营销、课程 |
| AudienceAgent | 定义目标受众、内容视角 | 全部 |
| StructureAgent | 生成大纲、结构、脚本框架 | 全部 |
| DraftAgent | 生成初稿 | 全部 |
| RewriteAgent | 改写、扩写、压缩、风格调整 | 全部 |
| ReviewAgent | 质量检查、逻辑检查、格式检查 | 全部 |
| ComplianceAgent | 平台规则、敏感内容、版权风险检查 | 全部 |
| PublishFormatAgent | 转换为目标平台发布格式 | 全部 |
| PerformanceAgent | 分析内容数据表现 | 全部 |
| StrategyAgent | 给出优化、放大、停止、复用建议 | 全部 |
| RepurposeAgent | 一份内容改写为多平台版本 | 全部 |

---

## 8. Novel Pack 专属 Agent

| Agent | 职责 |
|---|---|
| WorldAgent | 生成世界观、力量体系、禁止项 |
| CharacterAgent | 生成人物设定、关系网、成长弧 |
| NovelOutlineAgent | 生成小说弧线大纲 |
| PlotAgent | 生成章节级剧情脚本 |
| WritingAgent | 生成章节正文 |
| SummaryAgent | 更新动态剧情摘要 |
| ContinuityAgent | 检查剧情和设定一致性 |
| AddictionAgent | 管理爽点、压抑-爆发节奏 |
| OpeningOptimizeAgent | 优化前 3-5 章开局 |

---

## 9. Knowledge Memory 设计

```text
KnowledgeMemory
├── StaticContext
├── DynamicState
├── RecentContentWindow
├── StyleGuide
└── RetrievalContext
```

| 记忆层 | 小说场景 | 通用内容场景 |
|---|---|---|
| StaticContext | 世界观、人物、规则 | 品牌资料、产品资料、行业资料 |
| DynamicState | 当前剧情、悬念、关系变化 | 当前项目状态、内容主线、已发布总结 |
| RecentContentWindow | 最近 3-5 章正文 | 最近文章、脚本、图文、营销文案 |
| StyleGuide | 小说文风、禁用表达 | 品牌语气、平台风格、格式规范 |
| RetrievalContext | 后续检索增强 | 资料库、案例库、历史内容库 |

---

## 10. 发布与平台适配

| Adapter | 平台 | 主要能力 |
|---|---|---|
| FanqieAdapter | 番茄小说 | 章节发布、完读率采集、段评采集 |
| QimaoAdapter | 七猫小说 | 章节发布、数据采集 |
| WeChatAdapter | 公众号 | 文章发布、阅读数据 |
| ZhihuAdapter | 知乎 | 文章发布、互动数据 |
| XiaohongshuAdapter | 小红书 | 图文发布、标签、互动数据 |
| DouyinAdapter | 抖音 | 视频发布辅助、完播率采集 |
| BilibiliAdapter | B站 | 视频内容管理、播放数据 |

第一阶段不做全自动发布，先做 PublishJob 和手动发布回填；平台自动化放到后续迭代。

---

## 11. 指标体系

MetricRecord 采用通用指标模型，不写死小说指标。

| 内容类型 | 核心指标 |
|---|---|
| 小说 | 阅读量、书架比、留存率、章节完读率、评论数 |
| 文章 | 阅读量、点赞、收藏、转发、关注转化 |
| 小红书 | 曝光、点击、点赞、收藏、评论、涨粉 |
| 短视频 | 播放量、完播率、点赞率、评论率、转粉率 |
| 营销文案 | 点击率、转化率、表单提交、购买转化 |
| 邮件 | 打开率、点击率、退订率、转化率 |

---

## 12. 技术蓝图

| 模块 | 建议 |
|---|---|
| 前端 | React / Next.js + Ant Design 或 shadcn/ui |
| 后端 | Node.js NestJS 或 Python FastAPI |
| 数据库 | PostgreSQL |
| 缓存 / 队列 | Redis |
| 任务队列 | BullMQ / Celery，后续可升级 Temporal |
| LLM 适配 | OpenAI-compatible Adapter + Provider Adapter |
| 向量库 | 暂缓，后续可接 pgvector / Qdrant |
| 文件存储 | 本地文件系统起步，后续 MinIO / S3 |
| 浏览器插件 | Chrome Extension Manifest V3 |
| 日志追踪 | 数据库日志表起步，后续 OpenTelemetry |

---

## 13. 项目工程结构建议

```text
ai-content-factory/
├── apps/
│   ├── web-admin/
│   └── api-server/
├── packages/
│   ├── core/
│   │   ├── content-project/
│   │   ├── content-item/
│   │   ├── workflow-engine/
│   │   ├── agent-runtime/
│   │   ├── llm-router/
│   │   ├── knowledge-memory/
│   │   ├── publish/
│   │   ├── metrics/
│   │   └── strategy/
│   ├── content-packs/
│   │   ├── novel-pack/
│   │   ├── article-pack/
│   │   ├── short-video-pack/
│   │   └── social-post-pack/
│   ├── platform-adapters/
│   │   ├── fanqie-adapter/
│   │   ├── qimao-adapter/
│   │   ├── wechat-adapter/
│   │   ├── xiaohongshu-adapter/
│   │   └── douyin-adapter/
│   └── shared/
│       ├── types/
│       ├── utils/
│       └── config/
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── iterations/
│   └── content-packs/
└── scripts/
```

---

## 14. 蓝图约束

后续所有迭代必须遵守以下约束：

| 约束 | 说明 |
|---|---|
| 核心表不得写死小说概念 | 使用 ContentProject / ContentItem，而不是 Book / Chapter |
| 内容类型必须插件化 | 小说能力放在 Novel Pack，不进入 Core |
| 工作流必须可配置 | 通过 WorkflowTemplate 驱动，不硬编码流程 |
| Agent 必须可追踪 | AgentTask、LLMCallLog 必须记录执行过程 |
| 发布必须平台适配器化 | 不直接在业务服务中写平台逻辑 |
| 指标必须通用化 | MetricRecord 支持不同内容类型和平台指标 |
| 人工节点必须保留 | 审稿、发布、策略执行均需支持人工介入 |
| 迭代必须可评审 | 每个迭代开发前必须进行需求评审和蓝图一致性检查 |

---

## 15. 阶段成功标准

### Phase 1：Novel Pack MVP 成功标准

| 指标 | 标准 |
|---|---|
| 内容生产 | 能稳定生成小说章节 |
| 连续性 | 连续 20 章无明显设定崩坏 |
| 审稿 | 运营者可通过 / 打回 / 编辑 |
| 发布 | 章节可进入发布队列并完成状态回填 |
| 数据 | 可录入阅读、书架、留存、完读率 |
| 策略 | 可根据规则输出优化 / 停更 / 加仓建议 |
| 成本 | 每次 LLM 调用有日志和成本记录 |

### Phase 2：AI Content Factory 成功标准

| 指标 | 标准 |
|---|---|
| 内容类型扩展 | 新增 Article Pack 不需要重构核心表 |
| 工作流扩展 | 新内容类型可注册自己的 WorkflowTemplate |
| Agent 复用 | ReviewAgent、StrategyAgent、LLM Router 可跨内容类型复用 |
| 平台扩展 | 新平台通过 PlatformAdapter 接入 |
| 指标扩展 | 新指标通过 MetricRecord 支持，不改核心模型 |
| Portfolio | 可同时管理多个内容项目并比较表现 |

---

## 16. 后续迭代原则

开发每个迭代前必须先完成对应迭代需求评审。

需求评审必须回答：

1. 本迭代是否仍符合 AI Content Factory Core + Content Pack 的架构？
2. 是否存在把小说逻辑写入核心平台的风险？
3. 是否新增了无法通用化的字段、流程或状态？
4. 是否保留了人工审核、人工发布或人工覆盖能力？
5. 是否有明确验收标准？
6. 是否能支持后续 Article Pack / Social Post Pack 扩展？
