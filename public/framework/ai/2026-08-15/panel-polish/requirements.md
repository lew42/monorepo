# panel-polish

## The ask

Continuation of Mike's 2026-08-15 autonomy grant ("keep improving!"). Three small, measured fixes surfaced by today's three Panel tasks — each one flagged by a minion, verified by measurement, and left unclaimed because it sat outside that minion's fence:

1. **`align-content: safe center` on `.panel-body`** — a panel body centres what it is handed, and centred overflow spills out of BOTH ends (measured: an inspector's first row 75px above its panel, unreachable by scroll). One rule fixes every overflowing template at once; `.panel-props`'s local `align-content: start` workaround can then be reconsidered.
2. **The grip's hug/fill menu can still hug a SPLIT** — a hugging parent measures children that size themselves from it → 0px panel, 0-height grips. The bar and the inspector both withhold `mode` from splits; the grip menu is the one way in. Close it.
3. **`workspace.js` is 229 lines** — the roll/scatter/resolve extraction its own doc/file entry already proposes (~30 lines out), restoring the under-100-ish discipline the module held this morning.

## Fences

- **Minion Q**: `Panel/panel.css` (the safe-center rule), `Panel/templates.css` (only if the `.panel-props` workaround changes), `Panel/grip.js` (withhold hug from split neighbors), `Panel/workspace.js` + a NEW extraction module (say the name out loud), `Panel/doc/file/*.md` for touched files. Returns readme delta as text (likely: strike the "unclaimed" sentence from the both-ends bite bullet; grip bullet update).
- **Orchestrator**: readme merge, landing.
- Everyone: panels.json backup/diff-restore; screenshots staged in scratchpad; ext/editor read-only.
