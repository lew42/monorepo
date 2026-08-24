---
name: ui-test
description: Prove a UI interaction instead of describing it — drive the page headless and screenshot after every gesture. Use for "test the drag", "does the resize work", "ui-test this page", any drag / drop / sort / resize / hover / keyboard / pointer gesture you must show working, a layout you suspect is broken at some size, and for "force the state and shoot it" when the state is easier to set than to reach.
---

# ui-test

A gesture you can't see is a gesture you haven't tested. `drive.mjs` runs a plan of pointer
steps against a real page and writes, after **every** step, a numbered png and one line of
`steps.json` — the verb, console errors since the last step, and the watched elements'
`getBoundingClientRect()` before and after. The json is the evidence; the pngs are the picture.

```bash
node C:/Code/lew42/monorepo/.claude/skills/ui-test/drive.mjs plan.json
```

Copy it to the scratchpad only if you need to change it. Nothing here restates
[`code/SKILL.md`](../code/SKILL.md) — that is still the law for anything you then edit.

## The plan

```json
{ "url": "http://localhost/framework/ext/drawer/",
  "viewport": { "width": 1280, "height": 900 },
  "watch": [".drawer"],
  "out": "<scratchpad>/<task>-grip",
  "steps": ["click \"text=Open the rail\"", "move 982 450", "down", "move 982 450 1",
            "move 832 450 20", "up"] }
```

`watch` is what you are asserting about — only those get layout flags. A leading `goto` is
added if you don't write one. `settle` (after goto, 700) and `pause` (after each step, 150)
are tunable. Viewports: **400 / 1280 / 1920 / 3440** unless the ask names one.

## Verbs

`goto [url]` · `move x y [steps]` · `down` · `up` · `click sel` · `hover sel` ·
`key "Shift+Tab"` · `type sel text` · `eval js` · `wait ms` · `shot` (every step shoots;
`shot` only names a moment).

- `move x y steps` is the drag — **steps ≥ 10**, or one jump lands where no handler expected it.
- `sel` is **CSS** for `watch`; Playwright engines (`"text=Open the rail"`, quoted) work for
  `click`/`hover` but read as `null` in the rects.
- **Quote any `click`/`hover` selector containing a space** (`click ".a .b"`), or glue the
  compound (`.a>.b:nth-of-type(1)`) — args split on bare whitespace and `click` silently uses
  only the first token, no error (2026-08-21: clicked the whole `.pg-viewport` instead of the
  intended child).
- `type sel text` — `sel` must be ONE bare token; quotes do NOT protect it (the first space
  splits selector from text, the rest lands in `text`, and the mangled selector's parse error
  hides in that step's `error` field). Focus first (`click "<compound sel>"`), then
  `type input:focus <text>`.
- `eval` is ONE expression (`(() => { … })()` for statements); its value lands in `steps.json`,
  and a promise is awaited — `eval import('/app.js').then(m => m.drawer(…))`.

## Drive, or force?

**Drive by default.** `setPointerCapture`, `pointermove` throttling and rAF all work headless —
proven below on `ext/grip` and `ext/Draggable`, which use nothing else.

**Force with `eval`** when the state sits behind a chain you cannot replay (a server round trip,
a timer, another page's selection), when the gesture is *clamped* out of the state you want to
inspect, or when you only care what it **looks** like: `eval import('/app.js').then(m => m.drawer(fn))`
opens the real rail with the real module API and no click. Forcing tests appearance, never behaviour —
if the report is "the drag works", drive it.

## Reading a drag

Watch the element that should move and read `moved` per step: `{dx,dy,dw,dh}`.

- **The first move can snap.** A sizer that writes an absolute width from the pointer jumps to
  the pointer on move 1 (grip: `dw -6`), then tracks 1:1 (`dw +150`). Insert a zero-distance
  `move` right after `down` and measure between the moves, not from before the gesture.
- **A drag moves the layout it is aiming at.** Probe first — a plan whose only step is an `eval`
  dumping the target rects — then aim. Re-probe if the first drop lands nowhere.
- A drop that commits nothing looks identical to a drop that commits a no-op. Assert the
  *content*: `eval [...box.children].map(e => e.innerText)` before and after.

## A broken layout, from `steps.json`

`flags` on every step, for the `watch` list: `overflow-x <n>px` (the document scrolls
sideways) · `zero-size <sel>` · `missing <sel>` · `offscreen-x <sel>`. `doc` carries
scroll/client width and height; `errors` carries the console since the last step.
Overlap is **not** flagged (a child overlaps its parent by design) — eval the two rects:
`b.right - a.left` positive means the rail is covering the page.

## The `site` MCP tools — and the one rule

`mcp__site__shot` is a fresh headless png of a url (no gestures); `mcp__site__eval` reads DOM
truth from a live tab, and a **hidden tab evaluates but does not lay out** — every rect is frozen.
**Never drive the owner's tabs.** This runner has its own browser; that is the whole point.

## Output

Plans and out dirs go in the session scratchpad, named after your task
(`<scratchpad>/<task>-grip.json`, `out: "<scratchpad>/<task>-grip"`) — it is shared with
sibling agents. Copy the one or two pngs the report shows into the task dir.

## Proven (2026-08-19, `ai/2026-08-19/ui-test-skill/`)

| case | result |
| --- | --- |
| `ext/grip` resizes the drawer | `.drawer` **304 → 448px**, the drag move exactly **+150**; `--drawer-w` persisted `448px` |
| `ext/Draggable` sortable | `["Hold","Filter","Box"]` → `["Filter","Hold","Box"]`, ghost + placeholder alive mid-drag |
| forced state | `import('/app.js')` opened the rail, `--drawer-w: 1100px` past the clamp → rail **covers 236px** of the page |

That third run also found the bug the first two hid: `.drag-source { display: none }` lives in
`@layer theme` and loses to `.flex { display: flex }` in `@layer util`, so the dragged card never
disappears (`getComputedStyle(…).display` → `"flex"` mid-drag). **A util-layer utility beats any
component rule** — check `display`, not just the class list.

## Traps

- The run does **not** stop on a step error — it records `error` and carries on. Read the field.
- `console` errors are per step, so the step that broke the page is the one that names them.
- No `move` after `down` = no drag at all: `pointerdown` alone commits nothing.
- `click sel` silently no-ops on an element revealed only by an ANCESTOR's `:hover`
  (`.parent:hover > .child { display: … }`) — Playwright's actionability re-check breaks the
  hover chain, even right after a `hover parent` step (2026-08-21, `.pg-add`). Drive it with
  `hover ancestor-sel`, then coordinate `move cx cy` + `down` + `up` (centers from a probe eval).
  And aim at a SHALLOW/leaf target: hovering an outer box whose center lands inside a nested
  child reveals both their hover-children, and the `move` toward the outer's can transit out of
  the nested hover zone, shifting the target before `down` lands — no error, nothing happens
  (2026-08-21, three silent misses on a root `.pg-add`; diagnosed via `elementFromPoint`).
- Restart nothing. The dev server stays up; you never touch it.

Improve this skill: append to `improvements.md`.
