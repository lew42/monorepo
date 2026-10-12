# Page API for AIs: few universal tools, one simple model (mastermind brief)

**Owner (2026-10-12, dictated before bed):** finish the page basics so agents build pages live through tools.
- **Scope:** CRUD for subpages, how content is saved, real-time AI interaction through the page system.
- **Tools:** a few universal tools that take deltas (property name + value), not one tool per card kind. The model picks the delta, so the tool descriptions (or a skill) must teach the system.
- **Model:** simple enough for a human or an AI: the properties, the data structures, how they flow, which tool does what, under what name.
> "Keep it simple and straightforward so it's clear what needs to happen, which tool needs to be called, what things are called."

**What exists (read first, do not rebuild):** `Servex/agents/page_tools.js` (`page_set`, `page_add`, `page_call`, `page_read`, `page_note`, `create_page`); `core/Page/doc/content.md` and `core/Page/parts/` (just landed: content as a List, kinds are Items with a View); `core/Page/doc/split-plan.md` (in progress by @mastermind-page-split-plan); Item `set`/`apply`; `Page.Reader` tails `page.jsonl`. Every session has a page at `/framework/ai/sessions/<id>/`.

## Done when (tick each with proof)
- [ ] **The model, one screen:** `core/Page/doc/ai-api.md`: the page as data (`page.jsonl` lines → `page.set(delta)` → properties, `content` list, `pages` list), and a table: "to do X, call tool Y with delta Z" for: create a subpage, add/update/move/remove a content card, set a page property, call a page method, read the computed state. Linked from the core/Page readme and the Servex agents readme.
- [ ] **Tools match the model:** the fewest tools that cover the table (decide whether `page_add` and `create_page` fold into `page_set` deltas; keep old names as aliases, never break callers). Each tool's description carries the model in a few lines plus a pointer to `ai-api.md`, so an agent that never loads a skill still uses them right.
- [ ] **Subpage CRUD persists:** create a subpage from a tool call (folder + `page.js` or `page.jsonl`, parent's children updated by code, no hand edit), rename/move by script, remove = move aside (never destructive).
- [ ] **Live proof:** a fresh Haiku agent given only the tool descriptions builds, on its own session page, a heading + three cards + one subpage, and a headless browser watching the page sees each card appear within about a second of its tool call. Record the run (time per step, any wrong deltas the model chose) in `ai-api.md`.
- [ ] Layout-check at 400/1200/1920/3440; smoke clean; commit each step; merge.

## Decide, record the alternative
- **Names:** stay the owner's words (page, subpage, content, card).
- **Coordinate** with @mastermind-page-content-unify (`content.md`) and @mastermind-page-split-plan (`send_to_agent`). Do not edit `Page.class.js` while the split plan is written; only add.
- **Model:** Opus 5.5 for the API design; Sonnet/Haiku for the build and the proof run.
- **Process:** worktree; one Servex restart, proven on a private port; one-sentence chat replies; `STATE.md` here; land with `finish-task`.
