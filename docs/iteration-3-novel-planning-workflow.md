# Iteration 3：Novel Pack 新书规划流程

> 文件定位：本文件是迭代 3 的需求评审与开发范围文档。  
> 蓝图约束：本迭代必须遵守 `00-product-blueprint.md`。  
> 开发规则：进入开发前必须完成本文件中的需求评审检查。

---

## 1. 迭代目标

基于通用 Workflow Engine，实现小说项目的选题、世界观、人物和大纲生成。

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

- 支持基于题材配置生成候选选题。
- 支持确认选题后生成世界观。
- 支持生成人物设定。
- 支持生成小说弧线大纲。
- 运营者可以查看、编辑、确认规划结果。

---

## 4. 技术需求

- 实现 Novel Pack 数据模型。
- 实现 TopicAgent、WorldAgent、CharacterAgent、NovelOutlineAgent。
- 实现结构化输出解析。
- 实现生成结果版本快照。
- 实现规划结果写入 ContentAsset 和 Novel 扩展表。

---

## 5. 涉及数据模型

- `content_asset`
- `novel_worldview`
- `novel_character`
- `novel_arc`

---

## 6. 涉及 Agent / 工作流

- TopicAgent
- WorldAgent
- CharacterAgent
- NovelOutlineAgent

---

## 7. 验收标准

- [ ] 一个 Novel 项目可以从题材配置生成 3 个候选选题。
- [ ] 选题确认后可以生成世界观和禁止项。
- [ ] 可以生成主角、配角、反派的人物设定。
- [ ] 可以生成 3-5 个弧线的大纲。
- [ ] 规划结果可以人工编辑并保存。
- [ ] Novel 专属数据不得污染 Core 通用模型。

---

## 8. 需求评审检查项

- [ ] NovelWorldview、NovelCharacter 是否作为 Novel Pack 扩展？
- [ ] 世界观、人物、大纲是否可作为 ContentAsset 被引用？
- [ ] 规划结果是否有版本快照？
- [ ] 是否为后续章节生成提供足够上下文？

---

## 9. 本迭代明确不做

- 不做正文生成。
- 不做发布。
- 不做数据分析。

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
