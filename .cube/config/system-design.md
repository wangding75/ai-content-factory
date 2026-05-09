# AI Content Factory — System Design

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | 5.x |
| Frontend | Next.js (React) | 14.x |
| Backend | NestJS | 10.x |
| Runtime | Node.js | 20.x LTS |
| Build / Monorepo | pnpm workspace | 8.x |
| Database | PostgreSQL | 16.x |
| Cache / Queue | Redis + BullMQ | latest |
| LLM Adapter | OpenAI-compatible | — |

## Architecture Pattern

Layered monorepo architecture:
- **Core packages** provide reusable domain logic (content-project, workflow-engine, agent-runtime, llm-router, etc.)
- **Content packs** extend core with domain-specific capabilities (novel-pack, article-pack, etc.)
- **Platform adapters** provide per-platform publishing and data collection
- **Apps** are the deployment surfaces (web-admin UI, api-server REST API)

## Layer Structure

```
web-admin (Next.js)
  ↓ REST / tRPC
api-server (NestJS)
  ↓
packages/core
  ├── content-project     — ContentProject / ContentType / ContentItem
  ├── workflow-engine     — WorkflowTemplate / WorkflowRun
  ├── agent-runtime       — AgentTask / LLMCallLog
  ├── llm-router          — Multi-model routing, fallback, cost logging
  ├── knowledge-memory    — StaticContext / DynamicState / RecentContentWindow
  ├── publish             — PublishTarget / PublishJob
  ├── metrics             — MetricRecord / MetricTemplate
  └── strategy            — StrategySuggestion
  ↓
packages/content-packs
  └── novel-pack          — WorldAgent, CharacterAgent, WritingAgent, etc.
  ↓
packages/platform-adapters
  └── fanqie-adapter, wechat-adapter, etc.
```

## Key Domain Models

| Model | Package | Purpose |
|-------|---------|---------|
| ContentProject | core/content-project | Top-level project (replaces Book) |
| ContentType | core/content-project | Content category (novel/article/etc.) |
| ContentItem | core/content-project | Content unit (replaces Chapter) |
| ContentPlan | core/content-project | Outline / plan |
| WorkflowTemplate | core/workflow-engine | Reusable workflow definition |
| WorkflowRun | core/workflow-engine | Single workflow execution instance |
| AgentTask | core/agent-runtime | Agent execution record |
| LLMCallLog | core/agent-runtime | LLM call, token, and cost log |
| MetricRecord | core/metrics | Universal metric entry |
| StrategySuggestion | core/strategy | keep/optimize/suspend/promote |

## Configuration

- Config location: `apps/api-server/src/config/`
- Environment: `.env` / `.env.example` at repo root
- Profiles: development, test, production
- Database: PostgreSQL via environment variable `DATABASE_URL`
