# AI Content Factory — API Specification

## API Style

RESTful JSON API served by NestJS at `apps/api-server`.

## Base URL Pattern

```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}
```

## Response Format (Planned)

```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": { ... }
  }
}
```

## Authentication

TBD — planned JWT-based auth in a future iteration.

## Health Check

`GET /health` — Returns `{ "status": "ok" }` (required by Iteration 0).

## Planned Endpoints (Iteration 1+)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/content-projects | List projects |
| POST | /api/v1/content-projects | Create project |
| GET | /api/v1/content-projects/:id | Get project |
| PATCH | /api/v1/content-projects/:id | Update project |
| DELETE | /api/v1/content-projects/:id | Delete project |
| GET | /api/v1/content-projects/:id/items | List content items |
| POST | /api/v1/content-projects/:id/items | Create content item |
