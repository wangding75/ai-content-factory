# AI Content Factory — Module Design

## Module List

| Module | Path | Purpose | Key Planned Classes |
|--------|------|---------|---------------------|
| web-admin | apps/web-admin | Admin UI for content management | Pages, components (Next.js) |
| api-server | apps/api-server | REST API entry point | AppModule, Controllers |
| core/content-project | packages/core/content-project | ContentProject CRUD and ContentItem management | ContentProjectService, ContentItemService |
| core/workflow-engine | packages/core/workflow-engine | WorkflowTemplate and WorkflowRun orchestration | WorkflowEngineService |
| core/agent-runtime | packages/core/agent-runtime | Agent task execution and LLM call logging | AgentRuntimeService, LLMRouterService |
| core/llm-router | packages/core/llm-router | Multi-provider LLM routing with fallback | LLMRouterService |
| core/knowledge-memory | packages/core/knowledge-memory | Context memory management | KnowledgeMemoryService |
| core/publish | packages/core/publish | PublishTarget and PublishJob management | PublishService |
| core/metrics | packages/core/metrics | MetricRecord ingestion and querying | MetricsService |
| core/strategy | packages/core/strategy | StrategySuggestion rule engine | StrategyService |
| novel-pack | packages/content-packs/novel-pack | Novel-specific agents and workflow | WorldAgent, CharacterAgent, WritingAgent |
| platform-adapters | packages/platform-adapters/* | Per-platform publish and data adapters | FanqieAdapter, WeChatAdapter |
| shared | packages/shared | Shared types, utils, config | Types, Utils, Config |

## Module Dependencies

```
api-server
  → core/content-project
  → core/workflow-engine
  → core/agent-runtime
  → core/llm-router
  → core/publish
  → core/metrics
  → core/strategy

core/workflow-engine
  → core/agent-runtime
  → novel-pack (via plugin registration)

novel-pack
  → core/agent-runtime
  → core/knowledge-memory
  → core/llm-router

platform-adapters
  → core/publish (implements adapter interface)
```

## Boundary Rules

- `packages/core` MUST NOT import from `packages/content-packs`
- `packages/core` MUST NOT contain `book`, `chapter`, `novel` naming
- `packages/content-packs/novel-pack` MAY use novel-specific naming
- `packages/platform-adapters` MUST NOT contain business logic

## Data Model (Planned — Iteration 1+)

| Entity | Table | Key Fields |
|--------|-------|------------|
| ContentProject | content_projects | id, name, content_type_id, status |
| ContentType | content_types | id, name, pack_id |
| ContentItem | content_items | id, project_id, sequence, status, body |
| WorkflowTemplate | workflow_templates | id, content_type_id, definition_json |
| WorkflowRun | workflow_runs | id, template_id, project_id, status |
| AgentTask | agent_tasks | id, run_id, agent_type, input, output, status |
| LLMCallLog | llm_call_logs | id, task_id, provider, model, tokens_in, tokens_out, cost |
| MetricRecord | metric_records | id, project_id, item_id, metric_key, value, recorded_at |
| StrategySuggestion | strategy_suggestions | id, project_id, action, reason, created_at |
