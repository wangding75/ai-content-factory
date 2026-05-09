# Iteration 12：Article Pack 内容类型扩展

> 文件定位：本文件是迭代 12 的需求评审与开发范围文档。  
> 蓝图约束：本迭代必须遵守 `00-product-blueprint.md`。  
> 开发规则：进入开发前必须完成本文件中的需求评审检查。

---

## 1. 迭代目标

验证 AI Content Factory 底座的可扩展性，新增文章类内容生产包。

---

## 2. 蓝图对齐说明

| 蓝图约束 | 本迭代对齐方式 |
|---|---|
| 核心平台内容类型无关 | 本迭代不得把小说专属逻辑写入 Core |
| 内容类型插件化 | Novel 相关能力必须放入 Novel Pack 或扩展模型 |
| 工作流可配置 | 涉及流程时必须通过 WorkflowTemplate / WorkflowRun 承载 |
| Agent 可追踪 | 涉及 Agent 时必须记录 AgentTask 和 LLMCallLog |
| 发布平台适配器化 | 涉及发布时必须通过 PublishJob / PlatformAdapter 承载 |
| 指标通用化 | 涉及数据时必须通过 MetricRecord / MetricTemplate 承载 |
| 人工节点保留 | 审稿、发布、策略等关键动作必须支持人工确认 |
| 迭代可评审 | 开发前必须完成需求评审与验收标准确认 |

---

## 3. 产品需求

- 支持创建 Article 类型 ContentProject。
- 支持文章选题。
- 支持资料整理。
- 支持文章大纲。
- 支持正文生成。
- 支持标题优化。
- 支持文章审稿。

---

## 4. 技术需求

- 注册 Article Pack。
- 注册 Article WorkflowTemplate。
- 复用 TopicAgent、ResearchAgent、StructureAgent、DraftAgent、ReviewAgent。
- 新增 Article 专属 PromptTemplate。
- 新增文章指标模板。

---

## 5. 涉及数据模型

- `article_extension`
- `metric_template`

---

## 6. 涉及 Agent / 工作流

- ResearchAgent
- StructureAgent
- DraftAgent
- ReviewAgent

---

## 7. 验收标准

- [ ] 可以创建 Article 类型项目。
- [ ] 可以执行文章生成工作流。
- [ ] 可以生成一篇结构完整的文章。
- [ ] 可以进入通用审稿流程。
- [ ] 可以保存为 ContentItem。
- [ ] 新增 Article Pack 不需要重构 ContentProject / ContentItem / Workflow / AgentTask。

---

## 8. 需求评审检查项

- [ ] 新增内容类型是否证明核心模型通用？
- [ ] Article Pack 是否没有污染 Novel Pack？
- [ ] ReviewAgent 是否跨内容类型复用？
- [ ] MetricRecord 是否支持文章指标？

---

## 9. 本迭代明确不做

- 不做公众号自动发布。
- 不做 SEO 全流程。
- 不做复杂资料爬取。

---

## 10. 评审结论记录

| 项目 | 结论 |
|---|---|
| 产品评审结论 | 待评审 |
| 技术评审结论 | 待评审 |
| 是否允许进入开发 | 待确认 |
| 评审人 | 待填写 |
| 评审日期 | 待填写 |
| 主要风险 | 待填写 |
| 调整项 | 待填写 |

---

## 11. 开发完成验收记录

| 项目 | 结论 |
|---|---|
| 是否完成全部验收标准 | 待验收 |
| 是否存在蓝图偏离 | 待验收 |
| 是否允许进入下一迭代 | 待确认 |
| 遗留问题 | 待填写 |
