# Proof: the afternoon's chat fixes, live

Headless Playwright against the real, live site (`http://monorepo.localhost`, uncommitted) —
no code changed here. Script: [`proof.mjs`](proof.mjs) · raw pass/fail list:
[`proof-results.json`](proof-results.json) · shots: [`shots/`](shots/).

**36 of 38 checks pass.** The 2 that don't are a real finding (check 5), not a test bug.

## One line per check

1. No duplicates (demo + sheet, both the fast push and the slow poll) — **pass**.
   [shot](shots/duplicates-demo.png)
2. Full-screen sheet, old empty void gone (a small deliberate safe-area gap is left,
   not a bug) — **pass**. [shot](shots/full-screen-sheet-400.png)
3. Auto-scroll with a scroll state + jump-to-bottom button — **pass**, every part of it.
   [shot](shots/autoscroll-1200.png)
4. Mic start/stop sounds, one chime each, never silent or doubled — **pass** (demo + sheet).
5. The pulsing dot — **pass as a widget** (works exactly as documented), **but fails live**:
   no real surface uses it yet. `ux/Dictate/page.js`'s demo and `ext/drawer/rail.js`'s ✦ sheet
   both still pass `level`/`source`/`debug` instead of `pulse`. [on](shots/pulse-dot-on.png) ·
   [off](shots/pulse-dot-off.png)
6. Do the two surfaces match? — **no**, see the table below.
7. Menu merge (one ⚙, opens one full-screen panel with both halves) — **pass**.
   [shot](shots/menu-merge-open-400.png) Threaded replies (already landed) — **pass**: a fresh
   reply nests under its parent and opens itself at once ("so it is seen"), then collapses on
   a click. [shot](shots/threaded-reply-900.png)

## 6 — the surfaces table (input to the next merge)

| option | the Dictate demo | the ✦ sheet |
| --- | --- | --- |
| `keep` | `false` (its own session) | `true` (the global one) |
| `level` / `source` / `debug` | all `true` | all `false` |
| `mode` | the page's own switch | `"dictate"` |
| `pulse` | `false` | `false` |

Neither surface uses the dot yet, and nothing marks which differences above are on purpose.
