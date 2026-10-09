# Session class: exact cost per session, cached

Owner (2026-10-08, dictated). Build on `public/framework/ai/2026-10-07/token-accounting/` (`findings.md`, `plan.md` items 4–7 and 13, `sessions/doc/realtime-plan.md`) — do not redo its investigation. Budget **$6**, Sonnet 5.5, medium effort. Batch reads; scripts read raw data; chat = one sentence.

## What the owner wants
1. **Account for every message and every tool call** that accrues token cost, in every session (Claude and OpenRouter, **kept separate** — different data, accounting and rendering; Claude = "Claude $total", OpenRouter = "$total"). First check whether the **Claude Agent SDK already does its own real-time accounting** (result messages, per-message usage events); if it does, lean on it, otherwise our own script.
2. **A `Session` class**, usable on the **server AND the client** (one class, native ESM, no build). Instantiate it with a session id/file and it loads the whole raw session file **in code, never into an LLM**, computes costs, and a breakdown (tools used, time running, cache read/write, per-model) — plus subagent rollups into the parent.
3. It renders: a **preview row** for the data grid and a **detailed view** (click-through) on the AI Sessions page (`public/framework/ai/sessions/`), as the two display modes of the same class.
4. **Never reprocess a huge raw file on load.** Process it once and cache the result in a per-session `session.jsonl`. After that, read only new lines, skipping any message id already counted.
   - The page loads the small cached data, never the raw file.
   - The site is already slow on mobile, so measure the bytes and requests the Sessions page loads before and after, and report both.
5. **Per-session folder** `public/framework/ai/sessions/<slug>/`: `session.jsonl` (usage, costs) sits beside `page.jsonl` (page data).
   - Agents never hand-write JSONL; a Servex tool writes each line and stamps time and author.
   - Streaming is owned by task `2026-10-08/live-not-polling`. Use its stream (read its `findings.md`); don't build another.

## Deliverables (numbered)
1. `findings.md`: does the SDK account in real time (evidence), and which source is the truth per provider.
2. `Session.js` (class file named and capitalised to match, per CLAUDE.md traps) in the right module folder per the readme chain; server + client use, with a node test that loads a real session file and checks its total against `Server/session-cost.mjs` / the reconcile result (gap reported, target 0).
3. The Sessions page's preview row + detail view backed by it; check at the four widths; through the merge gate.
4. A node script `Server/session-summary.mjs <session-id|file>` printing the same summary (so agents ask a script, not read a file).
5. Docs: `sessions/doc/` note (shape of `session.jsonl`, loading, saving, timing), linked from the readme.

## Rules
Worktree + merge gate for site files; commit with attribution; no loose files; land with `finish-task`. Anything needing the owner → `Note:` card on the AI board plus one line in findings.md.

## Addendum (owner, 2026-10-08, later) — tags and alerts on sessions
Sessions can carry **tags** (icon-item references to a class/page/system/file) and **alerts** (needs attention, with priority), both appended as lines to `session.jsonl` by a **log tool** that any minion can call for any session (stamped time + author, outside the session's own prompt). The Sessions table filters/sorts by tag and has a "needs attention" filter, prioritized. The task-audit mastermind (`2026-10-08/task-audit`) will be the first writer: agree the line shapes with its `requirements.md` addendum; you own the tool and the table. Never trigger an SDK resume to read cost — files only.

## Addendum 8 (owner, 2026-10-08, after using the Sessions tab) — one store, real names, compact grid
**Storage and links (answer in findings.md first, then fix):**
- Session cards link to **two different places**: `framework/ai/2026/10/07/session-<short-uuid>/` (date tree, opens in the Inbox view, little info, badly laid out) and `framework/ai/sessions/mastermind-servex-10` (opens as a right sidebar column, which is nice). There are three stores: UUID folders (the cache), named folders under `ai/sessions/`, and date-tree `session-<id>` folders (VS Code tabs live here). **Pick ONE store** (the date tree, `ai/YYYY/MM/DD/`, is the owner's preference) and write a **non-destructive conversion script** (move/rename, no rewrite; old links resolve via a resolver) that ports old session data to it. Name the alternative.
- "4,000 sessions": how is that computed? If the client loads all of them to count, that is wrong: serve counts/filters from the session index.
- **State flashes "running"** on some cards when it isn't. Find why and make state true (derived from the registry/ledger by code).
- **Names**: many cards are named "monorepo" (the repo name, not a session name), so the owner cannot match a card to what they know. Derive a useful name (task/card title, the first real prompt, or the agent id), never the repo name. **Going forward every session/task gets a proper name.** **Child sessions nest by path: `parent/child`, sub-sub-sessions `parent/child/grandchild`, literally subdirectories of the parent's directory** (not a `--` suffix); the grid shows nested rows under their parent, collapsed by default, with the rolled-up cost.

**Grid and layout:**
- Replace the big status tiles (5-hour / weekly numbers) with the **progress bars with the pace marker** that the Dashboard already has (reuse that component; one of everything).
- Wasted space above the grid: cut it. The list of sessions should be as compact as possible.
- A quick **"in flight / now / active"** filter next to the existing checkboxes; **sort toggles** (recency, cost, model, ...) to flip between chronological and cost views; the **state icon moves to the first column** (as important as the name). Don't over-build yet.
- Clicking through should open the same detail view whichever way you arrive (one route per session).

**Sub-pages inside the Sessions tab:** the grid fills the tab, so find a way to host sub-pages (readme, a decisions/notes page) within the tab. Create a **readme and a decisions doc** for the Sessions system showing the owner's asks and architectural decisions, **priority-ordered with the top priorities first** so they are always followed, and make them reachable from the tab (a visible link). Everything you create must be linked from the site (see CLAUDE.md "Everything is linked").
