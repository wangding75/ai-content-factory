# 迭代计划总览

> 本文件用于说明所有迭代文档的顺序、目标和蓝图追踪关系。  
> 所有迭代均必须遵守 `00-product-blueprint.md`。

---

## 1. 文档清单

| 迭代 | 文件 | 标题 | 目标 |
|---:|---|---|---|
| 0 | `iteration-0-scaffold-requirements.md` | 项目脚手架与基础工程 | 建立 AI Content Factory 的工程底座，确保后续所有功能以通用内容工厂架构展开。 |
| 1 | `iteration-1-content-project-entry.md` | 通用内容项目入口 | 建立 ContentProject / ContentType / ContentItem 的最小管理能力，为 Novel Pack 提供项目入口。 |
| 2 | `iteration-2-multi-agent-architecture.md` | Workflow Engine 与多 Agent 架构 | 建立可配置工作流和 Agent Runtime，为 Novel Pack 的新书规划提供执行基础。 |
| 3 | `iteration-3-novel-planning-workflow.md` | Novel Pack 新书规划流程 | 基于通用 Workflow Engine，实现小说项目的选题、世界观、人物和大纲生成。 |
| 4 | `iteration-4-content-generation-loop.md` | 内容单元生成闭环 | 实现 Novel Chapter 作为第一种 ContentItem 的脚本生成和正文生成能力。 |
| 5 | `iteration-5-review-quality-control.md` | 审稿与质量控制 | 建立通用内容审核流程，并完成 Novel 章节审稿场景。 |
| 6 | `iteration-6-knowledge-memory-system.md` | Knowledge Memory 记忆系统 | 建立通用知识与记忆系统，解决长内容连续生成中的上下文一致性问题。 |
| 7 | `iteration-7-publish-queue-manual.md` | 发布队列与手动发布回填 | 建立通用 PublishJob 机制，先支持 Novel 内容的手动发布与状态回填。 |
| 8 | `iteration-8-metrics-dashboard.md` | 数据录入与指标看板 | 建立通用 MetricRecord 指标中心，并先支持 Novel Pack 的阅读、书架、留存、完读率数据。 |
| 9 | `iteration-9-strategy-suggestion-loop.md` | 策略建议与单类型业务闭环 | 根据指标数据输出策略建议，完成 Novel Pack 的生成、审稿、发布、数据、策略闭环。 |
| 10 | `iteration-10-portfolio-management.md` | Project Portfolio 多项目管理 | 从单项目闭环升级为多内容项目组合管理，支持资源分配、优先级和成本对比。 |
| 11 | `iteration-11-platform-adapter-browser-extension.md` | 平台适配器与浏览器插件 | 建立 Platform Adapter 体系，并用浏览器插件实现番茄小说的半自动发布和基础数据采集。 |
| 12 | `iteration-12-article-pack-extension.md` | Article Pack 内容类型扩展 | 验证 AI Content Factory 底座的可扩展性，新增文章类内容生产包。 |
| 13 | `iteration-13-social-post-pack-extension.md` | Social Post Pack 内容类型扩展 | 新增图文/种草类内容包，验证短内容和多平台格式化能力。 |

---

## 2. 阶段划分

| 阶段 | 覆盖迭代 | 核心目标 |
|---|---|---|
| 基础平台 | 迭代 0-2 | 建立 AI Content Factory Core、Workflow Engine、Agent Runtime |
| Novel Pack MVP | 迭代 3-6 | 跑通小说新书规划、章节生成、审稿和记忆系统 |
| 数据闭环 | 迭代 7-9 | 发布队列、指标看板、策略建议 |
| 规模化 | 迭代 10-11 | Portfolio 管理、平台适配器、浏览器插件 |
| 内容类型扩展 | 迭代 12-13 | Article Pack、Social Post Pack |

---

## 3. 蓝图追踪矩阵

| 蓝图能力 | 落地迭代 | 说明 |
|---|---|---|
| 通用内容项目模型 | 迭代 1 | ContentProject / ContentType / ContentItem |
| 多 Agent 架构 | 迭代 2 | Workflow Engine / Agent Runtime |
| Novel Pack 首个内容包 | 迭代 3-6 | 新书规划、章节生成、审稿、记忆 |
| 发布队列 | 迭代 7 | PublishTarget / PublishJob / 手动发布 |
| 指标中心 | 迭代 8 | MetricRecord / MetricTemplate / 看板 |
| 策略建议 | 迭代 9 | StrategySuggestion / 规则引擎 / 人工确认 |
| Portfolio 管理 | 迭代 10 | ProjectPortfolio / 多项目调度 |
| 平台适配器 | 迭代 11 | PlatformAdapter / Chrome Extension |
| 多内容类型扩展 | 迭代 12-13 | Article Pack / Social Post Pack |

---

## 4. 迭代评审规则

每个迭代开发前必须进行需求评审。评审通过后才能进入开发。

评审必须检查：

1. 是否符合 `00-product-blueprint.md`。
2. 是否存在将 Novel 专属逻辑写入 Core 的问题。
3. 是否保留 Content Pack / Platform Adapter 扩展边界。
4. 是否有明确产品需求、技术需求和验收标准。
5. 是否有明确“不做范围”。
6. 是否支持后续迭代承接。
7. 是否能在完成后进入下一迭代。

---

## 5. 不允许出现的偏离

| 偏离 | 说明 |
|---|---|
| Core 层写死 Book / Chapter | 应使用 ContentProject / ContentItem |
| 直接把番茄逻辑写进业务服务 | 应通过 FanqieAdapter |
| Agent 执行不落库 | 必须记录 AgentTask 和 LLMCallLog |
| 指标字段写死为留存率 / 完读率 | 应通过 MetricRecord 扩展 |
| 策略自动执行且不可人工覆盖 | 必须保留人工确认 |
| 新内容类型需要修改核心表 | 说明底层设计失败，应回到蓝图评审 |

---

## 6. 推荐开发顺序

```text
iteration-0-scaffold-requirements.md
  ↓
iteration-1-content-project-entry.md
  ↓
iteration-2-multi-agent-architecture.md
  ↓
iteration-3-novel-planning-workflow.md
  ↓
iteration-4-content-generation-loop.md
  ↓
iteration-5-review-quality-control.md
  ↓
iteration-6-knowledge-memory-system.md
  ↓
iteration-7-publish-queue-manual.md
  ↓
iteration-8-metrics-dashboard.md
  ↓
iteration-9-strategy-suggestion-loop.md
  ↓
iteration-10-portfolio-management.md
  ↓
iteration-11-platform-adapter-browser-extension.md
  ↓
iteration-12-article-pack-extension.md
  ↓
iteration-13-social-post-pack-extension.md
```

---

## 7. 使用方式

开发某个迭代时，打开对应迭代文档，按以下顺序执行：

1. 阅读迭代目标。
2. 检查蓝图对齐说明。
3. 评审产品需求。
4. 评审技术需求。
5. 确认数据模型和 Agent 范围。
6. 确认验收标准。
7. 确认本迭代不做范围。
8. 填写评审结论。
9. 进入开发。
10. 开发完成后填写验收记录。
