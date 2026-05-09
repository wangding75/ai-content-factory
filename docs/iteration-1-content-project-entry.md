# Iteration 1：通用内容项目入口

> 文件定位：本文件是迭代 1 的需求评审与开发范围文档。  
> 蓝图约束：本迭代必须遵守 `00-product-blueprint.md`。  
> 开发规则：进入开发前必须完成本文件中的需求评审检查。

---

## 1. 迭代目标

建立 ContentProject / ContentType / ContentItem 的最小管理能力，为 Novel Pack 提供项目入口。

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

- 支持创建内容项目。
- 支持选择内容类型，首期只开放 Novel。
- 支持查看项目列表和项目详情。
- 支持配置项目基础信息，例如名称、目标平台、目标内容数量、默认生成参数。
- 支持 PromptTemplate 和 LLM 基础配置入口。

---

## 4. 技术需求

- 实现 ContentProject CRUD。
- 实现 ContentType 基础表，内置 novel。
- 实现 ContentItem 基础表，但不做复杂生成。
- 实现 PromptTemplate 基础管理。
- 实现 LLM Provider 抽象和 API Key 加密存储。
- 实现 Web 管理台基础布局。

---

## 5. 涉及数据模型

- `content_project`
- `content_type`
- `content_item`
- `prompt_template`
- `llm_provider_config`

---

## 6. 涉及 Agent / 工作流

- 不实现具体 Agent。

---

## 7. 验收标准

- [ ] 可以创建一个 Novel 类型 ContentProject。
- [ ] 可以查看项目列表和详情。
- [ ] 可以配置默认 LLM Provider。
- [ ] 可以保存 PromptTemplate。
- [ ] 数据库表命名符合通用内容模型，不使用 book/chapter 作为核心表名。

---

## 8. 需求评审检查项

- [ ] ContentProject 是否足够通用，能支持文章、短视频、图文？
- [ ] ContentType 是否支持后续内容包注册？
- [ ] PromptTemplate 是否按内容类型、Agent、版本管理？
- [ ] LLM 配置是否独立于具体 Agent 和内容类型？

---

## 9. 本迭代明确不做

- 不做工作流。
- 不做 Agent 生成。
- 不做 Novel 详细设定。

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
