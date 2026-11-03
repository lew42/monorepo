# Proposed CLAUDE.md lines (the mastermind applies them; this file only proposes)

## 1. "Where to look", one new bullet

> - `public/framework/ai/doc/audits.md` — every audit of what the owner asked against what was done; for new loose ends, the prompt audit (`node Server/PromptAudit.mjs --days 7`, doc `ai/doc/prompt-audit.md`). Check it before building another audit.

## 2. Under "Memory, history, safety" (or "Cost and roles"), one line

> **File each ask the first time** (the owner, 2026-10-21): every owner prompt's asks are filed the first time they are read, as tasks on the session's record or as one-line notes in the readme they concern; a task is a proposal until accepted ([core/Task readme](public/framework/core/Task/readme.md), "Using tasks").

Why: the pilot found 18 of 33 asks in one session never filed ([prompt-audit/report.md](../prompt-audit/report.md)); the prompt audit catches them later, but filing at first reading is cheaper.
