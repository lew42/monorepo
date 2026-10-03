# Minion brief: the AI dashboard's Sessions tab + Overview grid — Part 2 of panel2-sessions

DRAFT — do not start until `task-mastermind-panel2-sessions` tells you Part 1 (`ext/panel2`) has
merged into `michael/dev` and points you at its readme. Load the `minion` skill first, then
`page` (you are building a view) and `code`.

Task directory (read the parent's task.jsonl and the full brief before you start):
`public/framework/ai/2026-10-02/panel2-sessions/` — `requirements.md` there is the owner's
original words for the whole task; this file covers Part 2 only.

Fence: `public/framework/ai/` only — specifically a new `public/framework/ai/sessions/` folder
(the new tab) and edits to `public/framework/ai/overview.js` / `public/framework/ai/page.js`
(the Overview tab's `content()`, and nothing else in that file — read it whole first, it is
already dense). Do not touch `ext/panel2` itself (done), `ai2/` (a sibling system, read-only
reference), or `core/Page/ext/Inbox` (read-only reference — reuse `InboxRail`, never copy it).

## The owner's own words (verbatim, the relevant slice)

> on the AI dashboard, we should have a prompt log and/or a session log. Prompts are part of a
> session. A time-based list, like the inbox view sorts itself, a preview card for each session,
> and that would be for agent spawn sessions too. Any time an agent has an ID… for this VS Code
> tab I should be able to see that with a tab or a tag that says VS Code on it, so I know that's
> this one… Maybe it should be its own tab… useful all over the site, like this left sidebar on
> the dashboard; that could be called a real-time inbox. Maybe the inbox can be rendered in a
> compact view on the default view. /framework/ai's default tab could show a grid-like dashboard
> that includes the inbox, but also the log next to it, in a responsive way.

## What to build

1. **A Sessions tab** on `/framework/ai/` (a real folder, `public/framework/ai/sessions/`, with
   `page.jsonl` containing `{"settings":{"tab":true,"weight":<pick one after the existing
   ones>}}` so `detect_tabs()` in `overview.js` picks it up automatically — do not hand-edit the
   tab list). One preview card per **session that has an id**, newest activity first, live
   (poll, same pattern as `ai2/agents.js`'s `all_agents()` — fetch, cache ~10-30s, redraw only on
   change). Covers THREE kinds, each with a visible **source tag**: `VS Code`, `Servex`, `CLI`.
   Each card: source tag, agent id or VS Code tab title, model, state (working/idle/dormant/
   stopped), the last prompt's first line, the time, cost if known. Click → that session's own
   url (e.g. `/framework/ai/sessions/<id>/`) showing its prompts in order, like a transcript —
   **prompts live inside their session, never as a separate log page.**
2. **Data**: check `task-mastermind-panel2-sessions`'s log / this task's `task.jsonl` for whether
   `mastermind-servex-9` added a `GET /api/sessions` route. If yes, fetch it (model this file's
   own `ai2/agents.js` — `servex_base()` + `servex_fetch()`, cached, polled, stops when hidden).
   If no route exists, do NOT invent Servex internals yourself: write a small standalone node
   script instead (`public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs`) that:
   - calls Servex's existing `GET /api/agents` for the Servex rows (session_id, role, model,
     state, cost already there — tag `source: "servex"`, split `role` to distinguish CLI minions
     from VS Code if `cwd` says so);
   - scans `%USERPROFILE%\.claude\projects\c--Code-lew42-monorepo\*.jsonl` for session ids NOT
     already covered, reading each file's last few lines for the latest timestamp and the most
     recent `"role":"user"` message's text (first line only) — this is a flat read of JSONL you
     already have working examples of in this repo (`ext/JSONL`), don't add a dependency;
     tag `source: "vscode"` when the transcript looks like an interactive session, `"cli"`
     otherwise (a `claude -p` one-shot has no later turns — heuristic is fine, document it).
   - writes one JSON file the page fetches as a static snapshot, and re-run the script on a
     short interval via Servex's existing health-supervisor style pattern, OR (simpler, and
     matches law 7 — "a node script... reads them, never written by hand") just run it from
     inside the page's own small dev-only fetch by asking `Server/` to expose it at one route if
     the dev server already has a slot for ad hoc JSON endpoints (`grep -n "res.json" Server/*.js`
     first). Pick whichever is less code; note the choice and why in the readme.
   - **Verify it end to end** on this VS Code mastermind's own session,
     `361c4d18-e878-4c04-9537-444e847e13d5`: it must show up tagged `VS Code`, with a real last
     prompt line. If it doesn't, the script is wrong — fix it before moving on.
3. **The Overview tab becomes a grid dashboard**, using Part 1's Panel2 responsive grid rule
   (`.panel2-grid` / `auto-fit, minmax(min(100%, 22rem), 1fr)` — read `ext/panel2/readme.md` for
   the exact class/helper name Part 1 shipped). Three Panel2 panels side by side (one per row on
   a phone, per the grid rule — no manual breakpoint):
   - a **compact Inbox**: the existing `InboxRail` from `core/Page/ext/Inbox` (`Rail.js`), in a
     new `compact` variant/option you add to that class (a prop like `new InboxRail({ page: this,
     compact: true })` — read its constructor first; add the minimal switch, don't fork the
     class). Never copy `InboxRail` — if `compact` doesn't fit as a constructor option, ask
     `task-mastermind-inbox-ext` (it owns `/framework/ai/`'s tabs and inbox wiring) via
     `drop("/framework/ai/", "...")` before forking anything.
   - the **Log** (the existing Log tab's content, reused — read how `tab_page()` in
     `overview.js` builds the `log` entry today and call the same thing inside a Panel2, don't
     reimplement it).
   - the new **Sessions** panel: the same preview-card list as the Sessions tab, just mounted
     inside a Panel2 instead of full-page (reuse one render function for both).
   Put this behind the full-width toolbar from deliverable 4, as one Panel2 whose `header` is
   that toolbar and whose `main` is the three-panel grid.
4. **A full-width slim toolbar** across the top of the dashboard — one Panel2's `header`, used as
   the page's own band (replacing or wrapping the existing `.inbox-head` strip in `ai/page.js`'s
   `content()` — read it whole before touching it; keep the title-left / tabs-right shape it
   already has, just drawn as a Panel2 header so the rest of the site can reuse the same chrome
   later). Each of the three panels inside Overview keeps its OWN small toolbar too (Part 1's
   per-panel header) — e.g. Sessions' toolbar could hold a source-tag filter, Inbox's its own
   existing controls if any.

## Rules

- Reuse, never duplicate (CLAUDE.md law 6): `InboxRail`, the Log tab's existing render, `ext/grip`,
  `ext/panel2` — every one of these already exists; your job is wiring, not rebuilding.
- No build step, resolve urls against `import.meta`, every CSS rule in a layer.
- Work in the worktree `task-mastermind-panel2-sessions` gives you the path for.
- Before you start: `claim_topic` nothing new — this mastermind already holds `/framework/ai/`'s
  awareness via its inbox note; just build.
- When done: `node Server/layout-check.mjs <ai dashboard urls: Overview + Sessions tab + one
  session's transcript url> --widths 400,1200,1920,3440` and read every shot yourself, band by
  band, before reporting — a title wrapping to two lines or a tab bar breaking to two rows is a
  fail you fix now, not a caveat you note.
- Check `michael/dev` hasn't moved under you (`git log michael/dev -1` vs your branch base)
  before you touch `ai/page.js` — it is a hot file other agents may have changed today.

## Report back

To `task-mastermind-panel2-sessions`: the Sessions tab url, the Overview grid url, a screenshot
or the layout-check output at all four widths, and which data path you used (Servex route or
standalone script) and why.
