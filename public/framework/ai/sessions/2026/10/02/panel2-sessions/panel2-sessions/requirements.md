# Panel 2, and the AI dashboard's Sessions view and Overview grid: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step, because more may be appended.

## Part 1: `ext/panel2` (Panel 2), the standard UI area
- **A new, small module.** Leave `ext/Panel` alone (it has callers). Panel 2 copies nothing from it; reuse only `ext/grip` for resizing.
- **The shape:** `header` (a slim toolbar: a title on the left, controls on the right, minimal height), `main`, and `footer` (optional). `main` can have an optional `start` and/or `end` side (a sidebar; on mobile it becomes a drawer that slides over).
- **The API is a class with parts as statics** (code/patterns): `class Panel2 { static Header; static Side; … }`. A toolbar control is just a View placed in `panel.header`.
- **Nesting and splitting:** a Panel 2 can hold Panel 2s side by side, each with its own toolbar, and a `grip` between them resizes. Do the simple split now. Layout switches (fixed ↔ fluid width) are a later step: write down the open question in the readme, and don't build it.
- **The responsive rule** (answers the owner's grid question; put it in the readme in plain words): use a grid of `repeat(auto-fit, minmax(min(100%, 22rem), 1fr))`. Each panel says only its smallest comfortable width, and the grid fits as many per row as there's room for, stacking on a phone. It works like flex-wrap, but the columns line up. Keep flex-wrap as the recorded alternative.
- A demo page at /framework/ext/panel2/ showing one panel, two side by side with a grip, and the phone stack. Docs: readme.md and page.js.

## Part 2: the AI dashboard (/framework/ai/), built with Panel 2
1. **A full-width slim toolbar** across the dashboard (one Panel 2 header), plus each panel's own toolbar.
2. **A Sessions view** (its own tab, `Sessions`, and also a panel on the Overview): one preview card per session, newest activity first, live. It covers EVERY session with an id: VS Code tabs, Servex agents (masterminds, minions, fast/smart pairs), and the CLI. Each card shows a **source tag** (`VS Code`, `Servex`, `CLI`), the agent id or tab title, the model, its state (working/idle/dormant/stopped), the last prompt's first line, the time, and the cost if known. A click opens the session's prompts in order (its transcript). **Prompts belong to a session:** show them inside it, not as a separate log.
   - Data: Servex's agents list (`list_agents`; session_id, role, model, state, cost) plus the Claude Code transcripts under `%USERPROFILE%\.claude\projects\c--Code-lew42-monorepo\*.jsonl` for VS Code sessions. A node script or Servex route reads them (law 7); the AI never writes them by hand. If a Servex route is needed, ask @mastermind-servex-9 for it through its inbox.
   - This VS Code mastermind's session is `361c4d18-e878-4c04-9537-444e847e13d5`: check that it shows up tagged `VS Code`.
3. **The Overview tab is a grid dashboard** using the Part 1 rule: a compact Inbox (the existing `InboxRail` from `core/Page/ext/Inbox` in a `compact` variant, NOT a copy), the Log next to it, and Sessions. One per row on a phone.
4. Yes, the Inbox class exists: `core/Page/ext/Inbox` (InboxRail; AI and AI 2 share it). The "real-time inbox" is that class in a Panel 2 side.

## Rules
- Coordinate with the owner of /framework/ai's tabs (@task-mastermind-inbox-ext) through the page inbox; it owns the tab detection.
- A Sonnet task mastermind, at most 2 Sonnet minions. Part 1 lands first, then Part 2. A pool worktree, `merge.mjs`, and the review skill at all four widths (it's a layout).
- Never wait on the owner.
