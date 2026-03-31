# NeoFront Documentation Index

> **Who is this for?** Both humans and AI models. Every section is linked and
> self-contained. For AI work, prefer starting with [`ai/CONTEXT.md`](../ai/CONTEXT.md)
> which is a dense single-file reference designed to be used as context.

---

## Reading order

### New to NeoFront
1. [Architecture](02-architecture.md) — engine vs project, data flow, key concepts
2. [Project Structure](03-project-structure.md) — every file and folder explained
3. [Quickstart](01-quickstart.md) — build a working view from scratch in ~15 minutes

### Building a feature
- Creating a new view → [Quickstart](01-quickstart.md) + [fields reference](reference/fields.md)
- Configuring the shell → [app.json reference](reference/app.md)
- Building the navigation → [menu.json reference](reference/menu.md)
- Adding forms → [form.json reference](reference/form.md)
- Configuring the list table → [listview.json reference](reference/listview.md)
- Advanced patterns → [Patterns guide](reference/patterns.md)

### Reference (alphabetical)
| File | Schema | Reference |
|------|--------|-----------|
| `project/app.json` | `schemas/app.schema.json` | [app.md](reference/app.md) |
| `project/menu.json` | `schemas/menu.schema.json` | [menu.md](reference/menu.md) |
| `project/login.json` | `schemas/form.schema.json` | [login.md](reference/login.md) |
| `project/views/views.json` | `schemas/views.schema.json` | [views.md](reference/views.md) |
| `views/<name>/fields.json` | `schemas/fields.schema.json` | [fields.md](reference/fields.md) |
| `views/<name>/listview.json` | `schemas/listview.schema.json` | [listview.md](reference/listview.md) |
| `views/<name>/form.json` | `schemas/form.schema.json` | [form.md](reference/form.md) |

### AI-specific resources
| File | Purpose |
|------|---------|
| [`ai/CONTEXT.md`](../ai/CONTEXT.md) | Dense single-file reference — use as system prompt or file context |
| [`ai/README.md`](../ai/README.md) | AI workflow checklist |
| [`ai/examples/`](../ai/examples/) | Copyable patterns |

---

## Validation

Run this after any JSON change:

```bash
npm run ai:check
# target a specific project:
npm run ai:check -- --project ./packages/app-demo/project
```

Exit code 0 = clean. Exit code 3 = errors found. Logs written to `scripts/logs/`.
