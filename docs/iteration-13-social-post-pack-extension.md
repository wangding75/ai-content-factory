# Iteration 13：Social Post Pack 内容类型扩展

> 文件定位：本文件是迭代 13 的需求评审与开发范围文档。  
> 蓝图约束：本迭代必须遵守 `00-product-blueprint.md`。  
> 开发规则：进入开发前必须完成本文件中的需求评审检查。

---

## 1. 迭代目标

新增图文/种草类内容包，验证短内容和多平台格式化能力。

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

- 支持创建 Social Post 类型项目。
- 支持生成小红书/微博风格文案。
- 支持标题生成。
- 支持标签生成。
- 支持封面文案生成。
- 支持一键生成多版本。

---

## 4. 技术需求

- 注册 Social Post Pack。
- 注册 Social WorkflowTemplate。
- 新增 TagAgent、CoverCopyAgent。
- 复用 TopicAgent、DraftAgent、RewriteAgent、ReviewAgent。
- 新增 Social Post 指标模板。

---

## 5. 涉及数据模型

- `social_post_extension`
- `metric_template`

---

## 6. 涉及 Agent / 工作流

- TopicAgent
- DraftAgent
- RewriteAgent
- ReviewAgent
- TagAgent
- CoverCopyAgent

---

## 7. 验收标准

- [ ] 可以创建 Social Post 项目。
- [ ] 可以生成标题、正文、标签、封面文案。
- [ ] 可以生成多个风格版本。
- [ ] 可以进入通用审稿流程。
- [ ] 生成结果保存为 ContentItem。
- [ ] 不需要修改 Novel Pack 或 Article Pack。

---

## 8. 需求评审检查项

- [ ] Social Post 是否通过 Content Pack 扩展？
- [ ] 短内容是否复用通用 ContentItem？
- [ ] 平台格式是否通过 PublishFormat / Platform Adapter 扩展？
- [ ] 是否验证了系统支持非长文本内容？

---

## 9. 本迭代明确不做

- 不做图片生成。
- 不做小红书自动发布。
- 不做营销投放。

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
