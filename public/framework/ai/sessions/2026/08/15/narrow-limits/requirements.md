# narrow-limits

## The ask

Continuation of Mike's 2026-08-15 autonomy grant — the last two recorded Opens in `ext/Panel/readme.md` with sketched fixes:

1. **A workspace narrower than 16em cannot honour `--panel-hug`** (200px measured: a 248.3px body inside a 200px panel, clipped). "Same fix, same neighbourhood" as the toolbar fold — the declared extent needs a cap it can't exceed.
2. **Below ~146px the 6-column template picker stops fitting even capped** (6 × `min-width: 1.7em` = 144px). "Auto-filling its columns would fix it and would destroy the alignment 3×3, which needs a way to tell the two pickers apart that is not `--panel-cols`."

## Scope

- Cap the hug extent so a hugged panel never exceeds what its workspace can give (the smallest mechanism that doesn't disturb normal hug at roomy widths — measured 248.3px must survive).
- Let the template picker's grid degrade below ~146px (fewer/auto columns) while the alignment 3×3 stays exactly 3×3 at every width. The distinguishing mechanism is the design call — a class per picker kind is the obvious shape; keep API surface at zero for templates.
- Update the two readme Open bullets (returned as delta text) and touched doc/file entries.

## Fences

- **Minion N**: `Panel/panel.css` (hug cap), `Panel/toolbar.css` (picker degrade), `Panel/toolbar.js` (only if the pickers need distinguishing classes), `Panel/doc/file/*.md` for touched files. Returns readme delta as text. Nothing else.
- **Orchestrator**: readme merge, landing.
