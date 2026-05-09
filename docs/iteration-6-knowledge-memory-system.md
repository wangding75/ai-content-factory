# Iteration 6：Knowledge Memory 记忆系统

> 文件定位：本文件是迭代 6 的需求评审与开发范围文档。  
> 蓝图约束：本迭代必须遵守 `00-product-blueprint.md`。  
> 开发规则：进入开发前必须完成本文件中的需求评审检查。

---

## 1. 迭代目标

建立通用知识与记忆系统，解决长内容连续生成中的上下文一致性问题。

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

- 支持查看 StaticContext。
- 支持查看 DynamicState。
- 支持读取 RecentContentWindow。
- 每章审稿通过后自动更新动态摘要。
- 每 10 章触发一次一致性检查。
- 支持查看一致性问题报告。

---

## 4. 技术需求

- 实现 KnowledgeMemory 数据模型。
- 实现 ContextAssembler。
- 实现 SummaryAgent。
- 实现 ContinuityAgent。
- 实现 Token 预算控制。
- 支持从 ContentAsset、ContentItem、StyleGuide 装配上下文。

---

## 5. 涉及数据模型

- `knowledge_memory`
- `memory_snapshot`
- `consistency_report`

---

## 6. 涉及 Agent / 工作流

- SummaryAgent
- ContinuityAgent
- ContextAssembler

---

## 7. 验收标准

- [ ] 章节生成前可以自动装配上下文。
- [ ] 审稿通过后可以更新 DynamicState。
- [ ] 可以读取最近 3-5 个 ContentItem 作为 RecentContentWindow。
- [ ] 可以生成一致性检查报告。
- [ ] 连续生成 20 章时，主要人物、规则、悬念不明显漂移。
- [ ] 记忆系统命名保持通用，不写死小说概念。

---

## 8. 需求评审检查项

- [ ] KnowledgeMemory 是否能服务 Article Pack 和 Social Post Pack？
- [ ] Novel 连续性需求是否通过扩展实现？
- [ ] Token 装配规则是否可配置？
- [ ] 是否需要引入向量库？如果不是必须，应后置。

---

## 9. 本迭代明确不做

- 不做复杂向量检索。
- 不做跨项目知识蒸馏。
- 不做长期自优化。

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
