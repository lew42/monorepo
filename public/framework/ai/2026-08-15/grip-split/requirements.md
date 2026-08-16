# grip-split

## The ask

Continuation of Mike's 2026-08-15 autonomy grant. The review's code fixer left one hygiene flag: `Panel/grip.js` is 161 lines (born 110 this afternoon; the pointercancel teardown and open-time menu stamping grew it past the house's ~100-line guidance). The day-one recon pre-named this seam: "optionally `Panel/handle.js` if the popover outgrows `grip()`" — it has. Extract the hug/fill seam menu into its own module.

## Scope

- Move the menu (build, open-time stamping, hug-withheld-from-splits filter, placement) out of `grip.js` into a new module. Naming note: `handle.js` collides conceptually with `toolbar.js`'s exported `handle()` (the drag grip) — say the name out loud; `seam.js` or `menu.js` are the candidates.
- Behavior byte-identical: the review just fixed F6 (pointercancel), F7 (open-time stamping), F10 (stale token), F11 (pointerleave close) in these lines — the extraction must not regress any; re-verify each with the same measurements.
- Both files under ~100 lines after. One-way imports preserved.

## Fences

- **Minion G**: `Panel/grip.js`, the new module, `Panel/page.js` (`files:` line), `Panel/doc/file/{grip.js,<new>}.md`. Returns readme delta as text (the shape bullet). Nothing else.
- **Orchestrator**: readme merge, landing.
