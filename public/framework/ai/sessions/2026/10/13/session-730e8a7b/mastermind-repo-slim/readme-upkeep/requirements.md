# Readme upkeep: everything that landed today is reachable from the readme chain

Budget: $6. Load the `sub-mastermind` and `documentation` skills first. CLAUDE.md: "Link every mention, and every page" (a page that is not linked will never be found), "Readmes are the cheap index" (under 100 lines, one line per child, when you would load it), "Documentation sanity check" (fix the obvious). Your log is this dir's `task.jsonl`.

## What landed today (2026-10-13) and must be reachable

The run's landing lines: `node Server/FollowUp.mjs --write` or read each `landed_at` line under `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/*/task.jsonl`. New or moved pages include: `/framework/catalog/`, `/framework/ux/Dictate/surfaces/`, `/framework/ux/Content/Object/` (InstanceTree), `/framework/ai/models/`, `/framework/ai/AITask/` (moved from `ext/AITask`), `ai/doc/architecture.md`, `ai/doc/repo-size.md`, `ai/doc/follow-up.md`, `ai/doc/asks-outcomes.md`, `ai/doc/skills-proposals-2026-10-13.md`, `core/Page/doc/how-a-page-renders.md`, `core/Page/doc/storage.md`, `ext/Figma/doc/round-trip.md`, `ext/Refine/doc/confidence.md` + `runs/`, `Server/doc/session-index.md`, `Servex/agents/doc/assistant-chain.md`, `lab/doc/pwa-state.md`, 12 modules' `doc/architecture.md`, the `make` skill.

## Deliverable

1. **Check by script** (`Server/readme-reach.mjs`, read-only, or extend the readme-audit script from 10-12 at `ai/sessions/2026/10/12/session-87bec773/readme-audit/`): for each page or doc above, is it linked from its parent readme (or `children:`), and is every readme in the chain root → leaf under 100 lines? Print the table into this task dir; two numbers that must agree (items checked vs items listed).
2. **Fix the misses**: one link line each in the right readme (the module's, or `public/framework/readme.md` / `ai/readme.md` for the top-level ones), wording in the readme's index shape (what it is, when you would load it). Trim any readme that went over 100 lines today by moving body text to its `doc/` with a link (never delete text).
3. **Sanity**: a readme that still names `ext/AITask`, the flat `ai/<date>/` day folders, or `naming`/`new-page` as live things gets the one-line fix.
4. Commit on `michael/dev` by path (readmes only, no site code); a landing line checked with `tail -1`; the card lists the misses fixed.

Fence: `readme.md` files and one link line in the root/ai readmes, `Server/readme-reach.mjs`, this task dir. Sonnet at low effort; Haiku may read.
