
# Copilot Instructions for NeoFront Web Management System

VERY_SHORT: true

## Overview

This project implements a pre-beta version of **NeoFront**, a parametric, metadata-driven single-page application framework for web management systems. The UI, navigation, forms, tables, and actions are generated dynamically from configuration files, not hardcoded components. Logic and structure are defined in JSON schemas and metadata, enabling rapid changes and consistent UX.

This version uses React 19.2.2 with the Mantine UI library (plus the community-contributed Mantine DataTable) to build reusable components with a flexible theming system and battle-tested hooks. See the references at the bottom for more details on Mantine usage.

## ATTENTION: **Very important notes**

- The AI should always provide **VERY SHORT ANSWERS** and avoid long explanations at all costs. **TWO VERY SHORT PARAGRAPHS** is the limit, each one with just one sentence.
- The AI should try at all cost to make **MINIMAL** changes to existing code, avoiding adding new functions, excessive checking, abstractions or refactoring (unless absolutely necessary).
- In fact, the AI should make efforts to **REDUCE** code size whenever possible, removing unused code, simplifying logic, and avoiding duplication. Your task is to make the codebase as small and efficient as possible.
- I'm not in a hurry. I prefer to wait for high-quality, elegant code instead of quick fixes that I have to Undo and Redo many times.

## More Notes

- NeoFront components are under active development and are NOT production-ready. Breaking changes and incomplete features are accepted. Backward compatbility is not a concern at this stage.
- The current phase focuses primarily on building robust, reusable React components and a metadata-driven architecture.
- All visual components should be designed with reusability in mind, leveraging metadata for configuration.
- Data is mocked via JSON files; no backend integration exists yet. The goal is to finalize the core framework before adding real data sources and business logic in future phases.

## Architecture & Key Directories

- `project/`: Core app configuration. Contains `app.json`, `menus.json`, and data/tables for modules. In the future, this folder will be replaced by remote access or moved to a separate repository.
- `project/views/`: Metadata (schema) definitions and mock data.
- `schemas/`: JSON schema definitions organized by locale. The only up-to-date language is en-US.
- `scripts/`: Utility scripts for schema validation and other tasks.
- `src/`: The NeoFront engine.
- `src/components/`: Reusable UI components. All are generic and driven by metadata.
- `src/contexts/`: Context providers for UI state, theming, and app-wide settings.
- `src/utils/`: General-purpose utility functions.
- `src/views/`: Page-level hooks used to load metadata and data for each view.
- `__sobras/`: Experimental or legacy code. Must be ignored.

## Patterns & Conventions

- **Metadata-first:** UI and behavior are defined in JSON, not in React code. Example: Adding a new table requires only adding new folders to `project/views/` and updating `menus.json`.
- **No direct API calls in components:** Data is loaded via the page-level hooks at `src/views/`. Components receive data and metadata as props.
- **Theming:** Use Mantine's theming system. Avoid hardcoded colors; use semantic colors and CSS variables.
- **Hooks:** Use Mantine hooks for state management, theming, and responsiveness.
- **Data sources:** During the pre-beta, all data is loaded from JSON files in `project/data/`. In the future they will be replaced with API calls by updating data loader utilities.
- **Schema evolution:** Update or add schemas in `schemas/` to change app structure or validation rules. Schemas are actively being changed during this pre-beta phase.

## References

- See `README.md` for big-picture philosophy and demo details.
- See `project/` for configuration-driven architecture.
- See `src/components/` for generic UI patterns.
- React documentation: https://react.dev/reference/react  # Use as canonical guide for preferred React patterns
- Mantine LLMs.txt reference: https://mantine.dev/llms.txt
- Mantine DataTable (community component) reference: https://icflorescu.github.io/mantine-datatable/  # This is the DataTable component used in NeoFront
- React 19.2.2 documentation: https://react.dev/reference/react  # Use as canonical guide for preferred React patterns

---
**For AI agents:** In the current phase we are actively building the reusable React components and a metadata-driven architecture.