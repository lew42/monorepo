# Page mastermind: study the page system, then agents change pages by path + delta

The owner, 2026-10-09 ~18:05 (VS Code tab 7efd07d5). Your primer is `public/framework/core/Page/readme.md`; your goal is `core/Page/doc/page-tool-2026-10-09.md` (read both first).

## 1. Study, with a readme sanity check (cheap)
Read the readme chain root → `core/Page/` and the child readmes it names. On ingest, check each: up to date? stale? unclear? a major subsystem missing? Fix only **major** errors and omissions (a big subsystem not indexed, a wrong fact), in a line each; do not polish, do not go into skill refinement. List what you fixed in your task log.

## 2. Build: the page tool works for real
Close the four gaps in `page-tool-2026-10-09.md`: (1) a delta can add a tab, change layout, change navigation (smallest change to `Page.class.js`); (2) every session folder gets a `page.jsonl` beside its `session.jsonl`, rendered on top of the default session template, live; (3) an agent knows its own page's path (Servex injects it; a VS Code tab via a hook); the agent writes only path + raw JSON delta, the tool stamps ts/ids/by; (4) the demo: in a session, "add a tab here" makes a tab appear with no reload. Sessions get a name (slug) where they lack one; VS Code tabs too.

Write the class architecture first (a short page: classes, what extends/composes what) per CLAUDE.md, then the smallest slice.

## Fences and neighbours
- You own `core/Page/`, `Servex/agents/page_tools.js`.
- `minion-session-detail-live` is editing `ai/AISession/AISessionDetail.js` right now (its step 5 = AI-posted cards on the session page). Message it (`send_to_agent`) before touching the session template; better, let it land first and build on it.
- The AI mastermind (`mastermind-ai-system`) studies the AI system in parallel; ask it, don't duplicate its reading.

## Rules
Opus, by the owner's choice ("we want this to work properly"); spawn Sonnet or Haiku helpers only for bounded pieces. Worktree; commit after each working step; `Server/merge.mjs`; check pages at 400/1200/1920/3440. Land with finish-task and a `Note:` card with the demo screenshot.
