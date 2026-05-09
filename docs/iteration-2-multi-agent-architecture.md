# Iteration 2：Workflow Engine 与多 Agent 架构

> 文件定位：本文件是迭代 2 的需求评审与开发范围文档。  
> 蓝图约束：本迭代必须遵守 `00-product-blueprint.md`。  
> 开发规则：进入开发前必须完成本文件中的需求评审检查。

---

## 1. 迭代目标

建立可配置工作流和 Agent Runtime，为 Novel Pack 的新书规划提供执行基础。

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

- 支持选择工作流模板。
- 支持启动一次工作流执行。
- 支持查看工作流执行状态。
- 支持查看每个 AgentTask 的输入、输出、失败原因。
- 首期内置 Novel 新书规划流程。

---

## 4. 技术需求

- 设计 WorkflowTemplate、WorkflowRun、AgentTask。
- 实现最小 Agent Runtime。
- 实现串行工作流执行。
- 实现任务状态机：pending、running、success、failed、cancelled。
- 实现 Agent 输入输出协议。
- 实现 LLMCallLog 记录。
- 评审 LangGraph / CrewAI / AutoGen / 自研轻量框架，首期建议自研轻量编排。

---

## 5. 涉及数据模型

- `workflow_template`
- `workflow_run`
- `agent_task`
- `llm_call_log`

---

## 6. 涉及 Agent / 工作流

- TopicAgent 框架
- WorldAgent 框架
- CharacterAgent 框架
- NovelOutlineAgent 框架

---

## 7. 验收标准

- [ ] 可以创建并启动一个 Novel 新书规划 WorkflowRun。
- [ ] WorkflowRun 可以按顺序执行多个 AgentTask。
- [ ] AgentTask 输入、输出、状态、错误可追踪。
- [ ] LLM 调用日志包含模型、耗时、Token、输入摘要、输出摘要。
- [ ] 工作流定义不得硬编码在业务 Service 中。

---

## 8. 需求评审检查项

- [ ] 多 Agent 架构是否仍遵循 Content Pack 插件化？
- [ ] Novel 相关 Agent 是否放在 Novel Pack 中？
- [ ] WorkflowTemplate 是否可支持未来 Article Pack？
- [ ] Agent 输入输出是否可结构化校验？
- [ ] 是否存在过早引入复杂开源框架的风险？

---

## 9. 本迭代明确不做

- 不做复杂 DAG。
- 不做多 Agent 协商。
- 不做 RevisionRequest 事件总线。
- 不做并行投票。

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
