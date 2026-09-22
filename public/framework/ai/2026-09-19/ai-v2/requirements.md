# ai-v2 — the second version of the AI dashboard: one dense, full-width, live board

Load the `minion` skill first. Then this brief. Model: Sonnet.

**Three laws.** Less is more. Clear beats brief by far. Prioritize (what the owner looks at every day first).

## The owner's words (2026-09-19)

> on the mastermind layout browser page we're wasting way too much space. We need to compact this to make it smaller. Look into our design system if we have scale controls. Some of the text on the screen here is pretty small. […] I kind of would like you to be able to put content on the screen quickly. […] Do we have a way to override this page so that you can just make [things] in real time? Make a sub page that takes over the full screen space, not including the sidebar. […] let's create a second version of the AI dashboard at ai/v/2.

## What exists — the mastermind built the first cut today; open it before anything else

`/framework/ai/v/2/` — `public/framework/ai/v/2/page.js` (about 150 lines) and `v2.css`. It reads ONE file live, the run's `task.jsonl`, through a `Run extends TaskJSONL` that adds a `note` verb. On one 1920 screen it shows: a top line (what is happening now, usage beside elapsed time), three panels (notes from the mastermind, minions in flight, what needs the owner), and every ask as a one-line row — a status dot and the conclusion — in as many columns as fit, grouped by topic, each opening to the owner's words and the links. About sixty asks fit on the first screen; the old page showed four. The old pages (`/framework/ai/`, the run task's page) stay untouched — this is the experiment beside them.

The mastermind appends lines like these, and they appear with no reload:

```
{"note": {"id": "…", "at": "…", "msg": "…", "links": [{"url": "…", "label": "…"}]}}
{"agent": {"task": "server-self", "model": "sonnet", "at": "…", "does": "…"}}      ← in flight until a later line adds "outcome"
```

## Build — improve the board; keep it one file the mastermind can still edit by hand in a minute

1. **The run it shows.** `RUN` is a constant today. Make it the newest run task automatically (group `ai-ops`, or the newest task whose slug starts `mastermind-` — find how `ext/AITask/dashboard.js` enumerates task dirs), with the constant as the fallback and a `?run=` override.
2. **Density the owner controls — use the design system's knob, do not invent one.** Read `/framework/styles/system/` and `framework.css` (~lines 225–247): `--size` is the one knob `--pad`, `--gap` and `--flow` derive from. Log what scale controls exist today. Give the board a small compact / cozy / roomy switch in its top line that sets the board's own scale (its `font-size` and, if the board uses them, `--size`), remembered with `Page.Store`, default compact. **No text under 12 px at any setting**; the owner said some text is already small.
3. **The top of the page.** About 80 px above the board and 68 px each side are still empty at 1920 — find what holds them (the page's own padding tracks; `.bleed`) and take the board to within about 16 px of the sidebar and the top, without editing core: a class or a word the page already offers, or the board's own CSS.
4. **Topics that run across columns** lose their heading in the next column. Choose: keep topics whole when short and let long ones split with a repeated "(continued)" head, or switch from CSS columns to a masonry-like grid of topic cards. Look at both at 1280, 1920, 3440; choose by the shot.
5. **Notes:** a dismiss × per note (remembered per note id in `Page.Store`; the line stays in the log), newest first, five showing, the rest behind "earlier". **Landed today** folds under In flight (already there) — show the landing's first sentence on the row, the rest on open.
6. **Decisions waiting for a verdict** get a fourth panel or a topic of their own: the claim, the chosen path, Approve / Improve (reuse `ext/AITask/decisions.js`'s verdict writer — do not fork it; if it cannot be reused without editing `ext/AITask/**`, say so and link to the Decisions tab instead).
7. **Measure the live delay** the owner asked about: append a note with a script while a headless page with a REAL socket is open on your private server; log milliseconds from the file write to the text in the DOM; put the number in the page's doc.
8. **Docs, small:** `public/framework/ai/v/2/readme.md` — what the board is, the lines the mastermind writes to it (the two above), how to add a panel. Add the `note` verb in one line to `.claude/skills/new-task/SKILL.md`'s verb list and to the mastermind skill's improvements file as a proposal line ("the mastermind writes `note` and in-flight `agent` lines so the v2 board is live") — do not edit the mastermind SKILL.md.

## Prove

Private server `PORT=8135 node server.js` (background; kill by its real Windows PID at landing). Shots at **400, 1280, 1920, 3440**, each density. Numbers: asks visible on the first 1920 screen, y of the first ask, smallest font size — before (the mastermind's cut) → after. No console errors; no horizontal scrollbar at any width. Then look at the shots as a stranger and fix what still looks off; say what you changed on that second look.

## Rules

- `new-task` before the first edit (your dir: `ai/2026-09-19/ai-v2/`); `code`, `css`, `layout` (its rules are suggestions; the shot is the verdict), `ui-test`, `documentation`; `finish-task`; `skill-improvement` if a skill misled you.
- **Fence:** `public/framework/ai/v/**`, `.claude/skills/new-task/SKILL.md` (one line), `.claude/skills/mastermind/improvements.md` (one entry), your task dir. The run's `task.jsonl` only by APPENDING `note` lines for your delay test (say "test" in them and keep them to three). Not `ext/AITask/**`, not `ext/JSONL/**`, not `core/**`, not `framework.css`, not `public/framework/ai/page.js`.
- The board is open in the owner's browser right now, and the mastermind appends to the run's log every few minutes: every edit in one write, loaded headless within a minute; if broken, fix forward at once. **Never kill or restart the owner's dev server (port 80) or the mastermind's (8123), never drive the owner's tabs.** Never `git stash`, never `find /`; an `rg` pattern starting with `/` returns nothing here. A bash heredoc containing an apostrophe fails in this harness — write files with the Write tool. Do not write the owner's name anywhere.
- Playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`. Scratch in the session scratchpad.
- Landing `outcome`: one screen — the before → after numbers, the live delay in ms, what scale controls exist, the choices made with their alternatives, what was left and why.
