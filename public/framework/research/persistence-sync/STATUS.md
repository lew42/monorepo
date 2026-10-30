# Status

## Answer so far

**Keep your Item / List / Page core. Fix it, don't replace it.** Figma, Linear and tldraw run the same design. Borrow their protocols; adopt libraries only at the edges (Yjs for shared text, SQLite search, Cloudflare voice).

## For you today: Design → Decisions

16 decisions, grouped open / leaning / decided. Seven were scored overnight by two independent agents each: one listed where every option wins and fails (with severity), one checked how the closest tools do it.

**Agents agree:**
- **D7 binding:** a one-line `bind` helper that also unbinds; signals later, only for derived values.
- **D11 typing:** stream every keystroke live, save the latest value every 0.5–5 s.
- **D15 list order:** fractional position keys, as Figma and tldraw do.
- **D16 class versions:** upgrade old lines as they're read, with a version on every line.

**Agents split, or disagree with your lean:**
- **D2 save path:** direct call (your lean) vs each item holding a store reference. Both drop bubbling for saving.
- **D10 two editors:** soft lock (your lean) vs last-writer-wins plus a "who's editing" badge.
- **D14 log the call or the change:** neither picks calls (your lean). One says "both in one line, replay applies changes", the other "changes only".

**Bugs found along the way** (each on its decision page):
- A view listener that throws stops the save; the edit stays on screen only.
- Pages may save `act()` twice (two save paths).
- Replaying `child_changed` re-runs `complete()`; a task's running timer is memory-only.

## Done

- `integration/data-shapes-2` is an upgrade and nearly ready to merge (`persistence-sync/lew42/branch-assessment.md`).
- Design docs consolidated: `phase-1.md`, `decisions.json`, `decisions-log.md`.
- Research snapshot on monorepo branch `research/persistence-sync`.

Usage: 94% of weekly pace at 07:50 UTC; work stopped for the night after this update. Parked ideas: `ideas/backburner.md`.
