# Copilot Instructions for NeoFront Web Management System

## 1. Purpose

NeoFront is a **parametric, metadata-driven SPA framework** for web management systems implemented in a monorepo.

All UI structure, navigation, forms, tables, and actions originate from **JSON schemas and configuration**, not hardcoded React logic.

The current phase focuses on **stabilizing reusable engine components** and the **metadata architecture**, before real backend integration.

---

## 2. Architecture Contract (MUST NEVER BREAK)

These rules override any other instruction.

### 2.1 Metadata authority

- UI structure and behavior must originate from **metadata, schemas, or project configuration**.
- React components in `packages/neofront` must **not encode business/domain structure**.
- Adding features should primarily require **metadata or project-level changes**, not engine rewrites.

Engine components may be modified only when:

- The change enables a reusable metadata capability, AND
- The solution is generic across multiple projects, AND
- No project-level workaround exists.

Metadata must define:

- Navigation structure
- Forms and fields
- Table columns and behaviors
- View-level actions
- Validation rules

---

### 2.2 Engine component purity

Components inside `packages/neofront/src/components/` are **pure view layers**:

- No direct data fetching
- No schema mutation
- No business logic branching
- Side effects limited to **local UI state only**

Data loading belongs exclusively to:

- `packages/app-*/` project loaders
- Metadata/configuration layers

Engine components must never:

- Import from any `packages/app-*` path
- Depend on project-specific metadata shape
- Contain conditional logic for a specific application

All project-specific behavior must live in `packages/app-*`.

---

### 2.3 Data flow boundaries

Valid runtime data sources during pre-beta:

- Project JSON files under `packages/app-*/project/` for metadata
- Mock data under `packages/app-*/project/views/**`
- Test API in `packages/mysql-api/`

Any solution bypassing these layers is **architecturally invalid**, even if functionally correct.

---

### 2.4 Conflict resolution

If a user request conflicts with the Architecture Contract:

1. Do NOT implement the requested change directly.
2. Explain briefly why it violates the contract, citing the exact rule section.
3. Propose the smallest metadata-driven alternative.
4. Only modify engine code if required to enable a reusable metadata capability.

---

## 3. Invalid Patterns (DO NOT GENERATE)

The following are always incorrect:

- Fetching or async I/O inside **engine UI components**
- Hardcoded table columns, form fields, navigation, or layout structure in React
- Business rules implemented directly in JSX
- Inline styles or hardcoded colors instead of Mantine theme tokens
- Creating new global context when `useAppUI` already provides the data
- Refactoring that increases abstraction without **clear multi-use reuse**

If a solution requires any item above, it must be **rejected and redesigned**.

---

## 4. Preferred Change Strategy (MINIMIZE CODE IMPACT)

When modifying code, follow this strict order:

1. Adjust **metadata or schemas**
2. Adjust **project configuration**
3. Modify **component props or parameters**
4. Perform **small local refactor in the same file**
5. Introduce **new helper function** only if necessary
6. Introduce **new abstraction/component** only with proven reuse

Primary optimization goals:

- Reduce total code size
- Remove unnecessary duplication
- Prefer small local duplication over premature abstraction
- Keep logic local and simple
- Backward compatibility is **not required**: breaking changes acceptable if necessary

---

## 5. Reasoning Workflow for Code Generation

Before writing code, the AI must internally:

1. Identify constraints from the **Architecture Contract**
2. Ensure the request does not violate **Invalid Patterns**
3. Choose the **smallest valid modification**
4. Prefer **metadata/project changes over engine changes**

Final output must contain only:

- Minimal code
- Minimal diff
- No long explanations

Before finishing an implementation, verify with:

- `npm run ai:check`

Diff constraints:

- Never rewrite entire files unless explicitly requested.
- Prefer line-level edits.
- Preserve existing naming and structure whenever possible.

If required information is missing:

- Do not invent APIs, props, or schemas.
- Ask for the missing file or definition instead.

Code must:

- Follow existing project patterns exactly
- Avoid introducing new libraries
- Avoid speculative abstractions

Monorepo safety:

- Do not move files across packages unless explicitly requested.
- Do not introduce cross-package dependencies outside intended public APIs.

---

## 6. Monorepo Structure Semantics

### Root

- `schemas/` → authoritative JSON schemas (`en-US` canonical)
- `scripts/` → validation and metadata tooling

---

### Engine (`packages/neofront/`)

- `src/` → public engine entrypoints/exports
- `src/components/` → reusable metadata-driven UI components
- `src/contexts/` → global UI state, theming, and app settings

Engine code must remain:

- Generic
- Metadata-driven
- Project-agnostic

---

### Projects (`packages/app-*/`)

Each `app-*` folder is a **standalone NeoFront application**.

- `project/` → app configuration (`app.json`, `menu.json`, `login.json`, etc.)
- `project/views/` → module metadata and mock data
- `public/` → runtime assets
- `src/` → thin bootstrap only

Projects are responsible for:

- Data loading
- Backend integration
- Runtime wiring

Engine must **not depend on project specifics**.

---

### Test API (`packages/mysql-api/`)

- Simple MySQL test backend
- Not part of engine architecture

---

## 7. UI & Theming Rules

- Always use **Mantine theming, tokens, and hooks**
- Never hardcode colors, spacing, or typography
- Ensure components remain **fully reusable and metadata-configurable**

---

## 8. Current Phase Constraints

- Components are **not production-ready**
- Breaking changes are acceptable
- Backend abstraction is incomplete
- Priority is **architecture correctness and reuse**, not feature completeness

---

## 9. References

- `README.md` → philosophy and overview
- `packages/app-*/project/` → configuration-driven structure
- `packages/neofront/src/components/` → engine UI patterns

Documentation:

- `ai/CONTEXT.md` → **dense single-file reference** for JSON schemas, patterns, and wiring. Read this first for any metadata or project work.
- `docs/INDEX.md` → full human-readable documentation navigator
- `docs/reference/` → per-file reference (fields, listview, form, app, menu, login, patterns)
- `ai/examples/` → copyable patterns for common tasks

External:

- React reference → https://react.dev/reference/react
- Mantine LLM guide → https://mantine.dev/llms.txt
- Mantine DataTable → https://icflorescu.github.io/mantine-datatable/

---

## 10. Guidance for AI Agents

During this phase, always prioritize:

- Strengthening the **metadata-driven architecture**
- Keeping implementations **minimal, pure, and reusable**
- Enforcing the **Architecture Contract** above all else

If uncertain, choose the option that:

- Reduces hardcoded logic
- Moves responsibility toward metadata or project config
- Simplifies the overall system

Tip: For new Copilot Chat threads, run `/neofront-change` from the Chat prompt list (stored at `.github/prompts/neofront-change.prompt.md`).
