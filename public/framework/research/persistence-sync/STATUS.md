# Status

## Answer so far

**Keep your Item / List / Page core. Fix it, don't replace it.** Figma, Linear and tldraw run the same design. Borrow their protocols; adopt libraries only at the edges (Yjs for shared text, SQLite search, Cloudflare voice).

## New tonight: calls vs changes, made concrete

- **Try it: [Replay Lab](https://claude.ai/artifact/1Tj59c1Bz6Y8iq89CiDCT5).** Press Start, wait, press Reload, and compare the two logs. Four examples: a task that spawns an agent, toggle and drag, +1 from two tabs, and asking an AI.
- **The answer: save the changes. Side effects are the reason *not* to re-run a method.** A method changes data (saved), keeps something going in this tab (started from the state, never saved) or acts on the outside world (once, result saved). Calls win only for +1 from two tabs at once, bulk actions like sort, and games.
- **Snapshots:** Figma, Linear, Notion and tldraw load a snapshot plus the changes after it. A snapshot *is* the changes collapsed to the last value of each key, so loading from one is the "changes" answer.
- **New decisions:** D17 how code reacts to a change (your `set_<key>` hook inside the class, `view.bind` for views); D18 which values are saved (tabs and column widths per person; selection, hover and focus never; timers from `started_at`).
- **Worked examples in words:** Phase 1 §2.2 (four kinds of value) and §2.3 (nine examples, from click to reload).

## Agents split, or disagree with your lean

- **D2 save path:** direct call (your lean) vs each item holding a store reference.
- **D10 two editors:** soft lock (your lean) vs last-writer-wins plus a "who's editing" badge.
- **D14 log the call or the change:** recommendation is now "both in one line, replay applies the changes". Your evening notes lean the same way.

## Bugs found along the way (each on its decision page)

- A view listener that throws stops the save; the edit stays on screen only.
- Pages may save `act()` twice (two save paths).
- Replaying `child_changed` re-runs `complete()`; a task's running timer is memory-only (`_ran_since`).

## Done

- `integration/data-shapes-2` is an upgrade and nearly ready to merge (`persistence-sync/lew42/branch-assessment.md`).
- Design docs: `phase-1.md`, `decisions.json` (D1–D18), `decisions-log.md`.
- Research snapshot on monorepo branch `research/persistence-sync`.

Usage: 16% of the week used, about 59% of pace (00:20 UTC Oct 31). Parked ideas: `ideas/backburner.md`.
