# panel-insight — read `ext/Panel` (read-only) and report what to carry and what to avoid

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Opus.
**Length budget:** `insight.md` ≤ 110 lines. You are gathering, not designing — no proposals for
the new system beyond the two lists at the end.

## Why

The owner, today: *"We're not going to modify ext/Panel, we're going to try and create a simpler
version, because this one, while it's getting better, isn't quite there yet … The old one is a little
wonky, kind of broken, doesn't work as well as it should."* A fresh sibling (`playground-design`) is
designing `ext/Playground` WITHOUT reading Panel; your `insight.md` is the one thing it reads from
Panel, at its last step. Make every line earn that.

## Read

`public/framework/ext/Panel/` — `readme.md`, `doc/decisions.md`, `doc/sizing.md`, `doc/words.md`, then
the source: `Panel.js`, `workspace.js`, `persist.js`, `properties.js`, `size.js`/`size.css`, `split.js`,
`grip.js`, `focus.js`, `toolbar.js`, `tools.js`, `templates.js`, `flow.js`, `paint.js`, `Workspace/`,
`playground/`. Its base: `core/Item`, `core/List`, `ext/Saver` (readmes). Today's run-4 landing
reports (`ai/2026-08-19/workspace-*/task.jsonl` last line each) say what just changed.

## Answer, with file:line evidence (one section each, short)

1. **Item → DOM.** How a Panel tree becomes boxes; what re-renders on change (the one listener at the
   root? per-item?); where it is fragile.
2. **Persistence + documents.** Saver wiring, `/data/panels/*.json`, the index; what is clean enough
   to reuse by import (never by importing Panel itself).
3. **Sizing** after today's cq removal — the model in one paragraph; what the simplest version is.
4. **Properties panel.** How a control maps to `data`, how it repaints; what is wonky.
5. **Gestures** — split/add/focus/select/drag/grip/insert: list them, say which are over-built.
6. **The shell** — Workspace, playground page, viewports, drawer + grip: what is reusable as-is.
7. **Broken, measured.** Load `/framework/ext/Panel/`, `/playground/`, `/Workspace/`, `/demo/`
   headless at 1280 and 3440: console errors, overflow, anything that clips; try five gestures
   headless (click an edge, drag a seam, add, select, switch mode) and say which fail. Numbers.
8. **Carry / Avoid** — ten lines each at most, each a mechanism or a rule, each with its evidence
   line above. This is the section the designer reads first.

## Deliverable

`public/framework/ai/2026-08-19/panel-insight/insight.md` + your `task.jsonl`. Pngs of anything
broken in this dir. Nothing else is written anywhere.

## Fence

Own: this task dir only. `ext/Panel/**` is read-only for everyone this run.
