# editor-controls

## The ask

Continuation of Mike's 2026-08-15 autonomy grant. toolbar-edges shipped `.panel-controls`: one class on a template's drawn payload makes the panel body reserve `--panel-bar-h`, so the hover bar no longer covers a control surface's first row. ext/editor's five regions have that collision today and adopt the fix by adding the class — "no flag, no second rule" (Panel readme, Open). This task is that adoption.

## Scope

- Add `panel-controls` to the payload root of each ext/editor region whose top edge actually holds controls (judge per region — a pure canvas doesn't need the reserve).
- Nothing else in editor; no Panel edits.

## Fences

- **Minion E**: `ext/editor/page.js` (the class additions), `ext/editor/editor.css` only if a rule must accompany (expected: none). Returns a one-line Panel-readme delta as text (the Open bullet's "still collide" clause).
- **Orchestrator**: readme merge, landing.
- Everyone: back up and diff-restore `/data/editor-panels.json` + `/data/editor.json` if interacted with; Panel files read-only.
