
# Copilot Instructions for NeoFront Web Management System

VERY_SHORT: true

## Overview

This workspace is a monorepo implementing a pre-beta version of **NeoFront**, a parametric, metadata-driven single-page application framework for web management systems. The UI, navigation, forms, tables, and actions are generated dynamically from configuration files, not hardcoded components. Logic and structure are defined in JSON schemas and metadata, enabling rapid changes and consistent UX.

This version uses React with the Mantine UI library (plus the community-contributed Mantine DataTable) to build reusable components with a flexible theming system and battle-tested hooks. See the references at the bottom for more details on Mantine usage.

Repo layout summary:
- `packages/neofront/`: the NeoFront engine (reusable framework/components)
- `packages/app-*/`: each `app-*` folder is a standalone NeoFront project
- `packages/api-mysql/`: a small MySQL test API

## ATTENTION: **Very important notes**

- The AI should always provide **VERY SHORT ANSWERS** and avoid long explanations at all costs. **TWO VERY SHORT PARAGRAPHS** is the limit, each one with just one sentence.
- The AI should try at all cost to make **MINIMAL** changes to existing code, avoiding adding new functions, excessive checking, abstractions or refactoring (unless absolutely necessary).
- In fact, the AI should make efforts to **REDUCE** code size whenever possible, removing unused code, simplifying logic, and avoiding duplication. Your task is to make the codebase as small and efficient as possible.
- I'm not in a hurry. I prefer to wait for high-quality, elegant code instead of quick fixes that I have to Undo and Redo many times.
- Backward compatibility is explicitly NOT a concern; prioritize clean, minimal changes even if they break existing behavior.

## More Notes

- NeoFront components are under active development and are NOT production-ready. Breaking changes and incomplete features are accepted. Remember, backward compatibility is not a concern at this stage.
- The current phase focuses primarily on building robust, reusable React components and a metadata-driven architecture.
- All visual components should be designed with reusability in mind, leveraging metadata for configuration.
- Data is mocked via JSON files; no backend integration exists yet. The goal is to finalize the core framework before adding real data sources and business logic in future phases.

## Architecture & Key Directories

- Repo root
	- `schemas/`: JSON schema definitions (authoritative language is `en-US`)
	- `scripts/`: Utility scripts for schema validation and metadata tooling

- NeoFront engine package (`packages/neofront/`)
	- `src/`: engine entrypoints and exports
	- `src/components/`: reusable UI components (metadata-driven)
	- `src/contexts/`: context providers for UI state, theming, and app-wide settings

- NeoFront projects (`packages/app-*/`)
	- `project/`: per-project configuration (`app.json`, `menu.json`, `login.json`, etc)
	- `project/views/`: per-module metadata and mock data (typically `fields.json`, `form.json`, `listview.json`, `data.json` and maybe extra mock data files)
	- `public/`: runtime assets (images, icons, etc)
	- `src/`: thin project bootstrap (typically `main.tsx` and CSS style files)

- MySQL test API (`packages/api-mysql/`)
	- `src/index.js`: simple API entrypoint (not part of the NeoFront engine)

## Patterns & Conventions

- **Metadata-first:** UI and behavior are defined in JSON, not in React code. Example: Adding a new module typically means adding a new folder under `packages/app-*/project/views/` and updating `packages/app-*/project/menu.json`.
- **No direct API calls in engine components:** Data is loaded by each `app-*` project (via its project loaders / view loaders); engine components receive metadata and data via props.
- **Theming:** Use Mantine's theming system. Avoid hardcoded colors; use semantic colors and CSS variables.
- **Hooks:** Use Mantine hooks for state management, theming, and responsiveness.
- **Data sources:** During the pre-beta, all data is loaded from JSON files under each project (commonly `packages/app-*/project/views/**/data.json`) or from the test MySQL API. In the future they will be replaced with API calls by updating project data loader utilities.
- **Schema evolution:** Update or add schemas in `schemas/` to change app structure or validation rules. Schemas are actively being changed during this pre-beta phase.
- **useAppUI first:** Always check whether the `useAppUI` hook already provides the necessary data or functions before adding new context providers or hooks. For example, URLSearchParams() is generally not needed in components because `useAppUI` already has a `currentSearchParams` property.

## References

- See `README.md` for big-picture philosophy and demo details.
- See `packages/app-*/project/` for configuration-driven architecture.
- See `packages/neofront/src/components/` for UI components.
- React documentation: https://react.dev/reference/react  # Use as canonical guide for preferred React patterns
- Mantine LLMs.txt reference: https://mantine.dev/llms.txt
- Mantine DataTable (community component) reference: https://icflorescu.github.io/mantine-datatable/  # This is the DataTable component used in NeoFront

---
**For AI agents:** In the current phase we are actively building the reusable React components and a metadata-driven architecture.