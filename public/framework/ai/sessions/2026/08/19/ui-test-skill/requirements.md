# ui-test-skill — a `ui-test` skill: drive a page headless, screenshot after every gesture

Protocol: read `../playground-mastermind/protocol.md` first. Group `playground`. Model: Opus.
**Length budget:** `SKILL.md` ≤ 110 lines · `drive.mjs` ≤ 150 lines · your task report one screen.

## The ask (owner, verbatim)

> Try to make a ui-test skill, for things like drag and drop interactions. The basic gist is, get a
> minion to launch the page, give them the instructions, ask them to take screenshots after every
> ui command, etc. mousedown, mousemove, etc.. If that's not possible, at least force the app to
> whatever ui state would have happened, to test what the ui looks like, detect broken layouts, etc.

## Deliverable

`.claude/skills/ui-test/SKILL.md` (frontmatter `name: ui-test`, a `description:` that triggers on
"test the drag", "does the resize work", "ui-test this page", any drag/drop/resize/hover/keyboard
interaction a minion must prove, and on "force the state and shoot it") and
`.claude/skills/ui-test/drive.mjs` — a Playwright runner a minion copies to the scratchpad and
edits, or calls with a plan:

```
node drive.mjs plan.json        # plan = { url, viewport?, steps: [...] , out: "<dir>" }
```

Step verbs (keep the list short, name them in SKILL.md): `goto` · `move x y [steps]` · `down` ·
`up` · `click sel` · `hover sel` · `key "Shift+Tab"` · `type sel text` · `eval js` (force a state:
add a class, call a method, set a style) · `wait ms` · `shot` (every step shoots anyway; `shot`
names one). After EVERY step: a numbered png (`01-goto.png`, `02-move.png` …) and one line in
`steps.json` — the verb, the args, console errors since the last step, and for a `sel` named by
the step (or a `watch: [sel…]` list in the plan) its `getBoundingClientRect()` before and after.
That file is the evidence; the pngs are the picture.

SKILL.md says: when to drive vs when to force (a gesture that needs `setPointerCapture` or rAF
timing drives fine headless — prove it below; a state reached through an async chain you cannot
replay is forced with `eval`); the viewport set to use (400 / 1280 / 1920 / 3440 unless told); how
to read a drag (`move` with `steps`, then check the watched rect moved by the delta); how to detect
a broken layout from `steps.json` (overflow on `document.scrollingElement`, a rect outside the
viewport, a width of 0, two rects overlapping that should not); the `site` MCP tools (`shot` =
fresh headless png of a url, `eval` = DOM truth in a live tab — a hidden tab evaluates but does
not lay out; never the owner's own tabs); the `file:///C:/…` import; where output goes (scratchpad,
named after the task; the one png the report shows copied into the task dir). One short worked
example inline. Link, don't restate, anything already in `.claude/skills/code/SKILL.md`.

## Prove it — run the runner three times, keep the pngs in your task dir

1. `ext/grip` on `/framework/ext/drawer/` (the drawer's grip resizes it): drag the grip 150 px;
   `steps.json` shows the rail width changed by ≈150 (say the exact numbers).
2. `ext/Draggable` on `/framework/ext/Draggable/` (sortable): drag one row past another; the DOM
   order changed (eval it).
3. A forced state: on any page, `eval` adds a class / calls a method the gesture would have reached,
   then shoot — show the fallback path works and say in SKILL.md when it is the right call.

If a drive does not work headless, say exactly which event did not fire and what the fallback
showed — that is a finding, not a failure.

## Fence

Own: `.claude/skills/ui-test/**`, this task dir. Nothing under `public/` is edited (pngs for the
report go in this task dir). The skill must not tell a minion to touch the owner's tabs.
