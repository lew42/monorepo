# Frame: the name, the home, the merge (card merge 8)

## What a frame is

A **frame** is a bordered box whose parts touch its edge: a head row, a body and a foot row (any of them optional). A card pads itself and spaces its children; a frame pads nothing itself, and each part pads its own inline edge by `--pad-card`, so the words in the head, the body and the foot line up.

## Home: `ui/panel` (existing), no new class

- **Where the rules already live:** `.ui-panel-head`, `.ui-panel-foot` and `.ui-panel.raised` are `ui/panel/panel.js`. `ui/dialog` only fixes three browser traps and wears the same `.surface`. The plan's own frame class list is `.surface` + `.ui-panel-head` / `-body` / `-foot`.
- **Class names:** the home's prefix stays. The frame is `.surface` (the box, owned by `framework.css`) with `.ui-panel-head`, `.ui-panel-body`, `.ui-panel-foot` (the parts, owned by `ui/panel`). `.ui-panel-body` is the one new class. The bare `.ui-panel` keeps meaning "a frame that wants the hairlines or `raised`".
- **What moves from `ux/Content/plan/plan.css`:** two rules, now in `ui/panel/panel.js`: `.ui-panel-body { padding: var(--pad-card); }` and `.ui-panel-head, .ui-panel-foot { padding: 0.6em var(--pad-card); }`. The plan page already imports `panel.js`, so its "after" boxes keep drawing.
- **Alternative rejected:** a new `ux/Frame` with `.ux-frame`. Every rule the frame needs already has an owner and a page in `ui/panel`; a second name for the same three rows would be two systems (law 6). If the owner prefers the word "frame" in code, it is one rename of `ui-panel-*`, done by script.
- Module shape: `ui/panel` already has `readme.md`, `page.js`, `doc/`; its readme and `doc/architecture.md` get the new rule, and `ui/readme.md` already indexes the module.

## The merge (what was found, and what lands)

| Kind (plan) | Real state in the code | Verdict |
|---|---|---|
| panel (dialog-look box) | `ui/panel/page.js` template wears `pad` on head, body, foot | lands: parts pad themselves |
| dialog | `dialog.ui-dialog.surface.pad` | lands: the dialog is `.surface`, its content `.ui-panel-body` |
| overview column | `.v2-panel` on `ai/v/2` (`ai2-ov-col` no longer exists) | lands if nobody is on `ai/v/2`; keeps its `--size` padding so the column does not grow |
| screenshot thumb | `.ai-shot` on the AI task page (renders only with logged shots) | decided after the probe |
| doc files browser | `.doc-files` / `.sources-files` are page sections around `ext/files`, which draws its own frame | see `task.jsonl` decision lines |
