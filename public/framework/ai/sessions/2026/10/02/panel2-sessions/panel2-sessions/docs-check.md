# Docs check — panel2, Inbox, sessions, dashboard

Read readme.md + doc/*.md for each, then checked the claims against Panel2.js / Inbox.js / Rail.js / page.js.

## 1. ext/panel2 — clear

A newcomer can follow this readme alone: plain-words intro, a runnable `Use` example that matches
`Panel2.js` exactly (`title`, `start`/`end`, `footer`, `.header.append()`), the 34em drawer
breakpoint explained in "five-year-old words," and four honestly-labeled open questions instead of
silently missing features. Nothing in the code contradicts it. Only a nit: `doc/decisions.md` is
all "open questions / why we didn't build X" — fine as a decisions log, but a true newcomer never
needs to open it; the readme alone is enough to use the module.

## 2. core/Page/ext/Inbox — clear, one small rough edge

The readme's "one class, two views" framing matches `Inbox.js` exactly (`inbox.rail` /
`inbox.compact`, lazy getters, `Inbox.Rail = Rail` to avoid an import cycle). The before/after
section is unusually good at explaining *why* the restructure happened, which helps more than it
costs space.

- **Small gap:** `Inbox.js`'s own top-of-file comment says "Docs: doc/inbox.md · Servex/doc/inbox.md"
  with no folder prefix. Read in isolation (someone opening the source file, not the readme) this
  reads as if a `doc/inbox.md` lives inside this same `Inbox/` folder — it doesn't; there is no
  `doc/` directory here at all. The real files are `ext/drawer/doc/inbox.md` and
  `Servex/doc/inbox.md`, which the readme's own "More" section does link correctly. Not a readme
  defect, but worth a one-word fix in the code comment (`ext/drawer/doc/inbox.md`) so the two don't
  disagree on how explicit a path needs to be.
- The readme's json example (`{"inbox": {"type": ..., "author": ...}}`) is the page.jsonl extension
  schema, collected into `page.inbox` — confirmed it's shown on `core/Page/ext/`'s own demo page
  (`demo.js`), exactly where the readme points. Good: no dangling example.
- Worth noting for a newcomer (not stated anywhere): `inbox.compact`'s "Leave a note" rows
  (`Rail.js`-unrelated, drawn in `Inbox.js`'s `draw()`) use a field called `n.from`, while the
  page.jsonl extension's own rows use `author`/`from`-fallback. These are two unrelated data
  sources with similar-looking field names — the readme does separate them conceptually ("Leave a
  note" box vs. the page.jsonl extension) but a reader skimming could still conflate the two
  schemas. Minor; the architecture section's wording already does most of the work to prevent this.

## 3. ai/sessions — clear

This is the strongest of the four. Readme explains the three source kinds, exactly where each
row's data comes from (live poll vs. a gitignored snapshot script), why it's a script and not a
route (with the fence constraint stated plainly), and a "Watch out" that heads off the one real
landmine (`ext/Session` is an unrelated *voice* session, not this). Cross-checked against
`sessions/page.js`: the merge logic, the 20s poll, the VS-Code-vs-CLI heuristic in
`doc/decisions.md` all match what the code does. No contradictions found.

## 4. ai/dashboard — clear, one thing a newcomer could stumble on

Readme lists the five tiles in order, says plainly that none is a second copy of its data, and
`doc/decisions.md`'s table says exactly which function each tile reuses and why (including the
one place a literal reading of the brief was deliberately overridden — `watch_needs()` instead of
`Inbox.Compact` — with the evidence for that call written down). Matches `dashboard/page.js`
exactly.

- **One thing that could confuse a newcomer:** the readme names tile 2 "In flight + queued," and
  the doc/decisions.md table just says "`tasks.json`, polled every 20s" without saying how a
  "queued" task is told apart from an "in flight" one. The code's actual filter is
  `t.state === "building"` — there is no separate `"queued"` state at all (confirmed against
  `stalled-and-budgets`'s own requirements: the schema is only
  `landed | building | stalled | snoozed | killed`, and "queued" is just the readme's own label for
  a `building` task with no `landed_at` yet). A reader following only readme.md + doc/decisions.md
  (not the other task's requirements.md, which isn't linked from here) has no way to learn that —
  they'd reasonably expect two different states or two different tiles. A one-line addition to
  either doc ("queued" is `building` with no `landed_at` yet — same state, not a separate one")
  would close this.
