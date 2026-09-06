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

⚠ **A plan is JSON — write it with the Write tool (or `json.dumps`), never `cat <<EOF`.** A
heredoc eats one backslash layer, so an `eval` carrying `.split('\n')` or a `\s+` regex arrives
with one backslash and the runner reports `Bad escaped character in JSON at position N`, or
`SyntaxError: Invalid or unexpected token` **as that STEP's error** — which reads like a bug in
the page rather than in your quoting. Four runs lost to it across three tasks (2026-09-04/05);
`code/SKILL.md` §7 has the general form.
⚠ **`out` is not optional in practice.** `drive.mjs` resolves `plan.out ?? "ui-test-out"` against
the invoking cwd, so a plan without it writes a `ui-test-out/` dir into the REPO ROOT — outside
every stated fence, caught by `git status` noise rather than by any error. That dir is also
already git-TRACKED from an earlier agent's same mistake, so `rm -rf` on it shows as tracked
deletions: before deleting any out-of-fence dir you did not expect to exist, `git status` it —
it may be someone's committed mistake, not your scratch (recovered per file with
`git show HEAD:<path> > <path>`, never `checkout --`) (2026-09-05, twice).

## Verbs

`goto [url]` · `move x y [steps]` · `down` · `up` · `dblclick x y` · `click sel` · `hover sel` ·
`key "Shift+Tab"` · `type sel text` · `eval js` · `wait ms` · `viewport w h` (mid-run
resize — a breakpoint bug becomes a same-run before/after) · `shot` (every step shoots;
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
  `type input:focus <text>`. And it **APPENDS**: it does not select-all first, so typing into
  Build's Name field (prefilled "New page") produced "New pageBlock proof" and saved a page to a
  directory called `new-pageblock-proof` — nothing warned, the step read as a success. Clear the
  field first (`eval` its `.value = ""`, or `key "Control+a"` after the click) whenever it is not
  empty (2026-09-05).
- `dblclick x y` is a distinct gesture — `down`/`up` twice never synthesizes one (2026-08-29).
- `eval` runs as native `page.evaluate` — a Playwright-only selector engine (`text=`, `:has-text()`) inside its `document.querySelector` throws `not a valid selector`; plain CSS only there (2026-09-04).
- `eval` is ONE expression (`(() => { … })()` for statements); its value lands in `steps.json`,
  and a promise is awaited — `eval import('/app.js').then(m => m.drawer(…))`.
- **A synthetic `input`/`change` is not typing.** Setting `f.value` and dispatching `input`/
  `change` left a drawer field looking filled while nothing committed; `page.type()` plus
  `key "Enter"` committed it. If the claim is that a value reaches the url or a saved file,
  drive the real keys — the difference between the two IS the bug you are hunting (2026-09-05).

## Pick the root first — the DOM holds several of every selector

**Most matches on this site are hidden, and a hidden element answers with plausible numbers.**
A columns page keeps EVERY page on the path in the DOM (the hub that teaches a gesture and the
leaf that demonstrates it wear the same module classes), plus the sibling column marked
`classes: "default"`, plus the app shell's own home page — rebuilt on every cold load and hidden
with CSS — plus the persistent left rail, whose tiles carry the same titles as the panel you
meant. Measured on one realm: `.paging-row` returned 24 matches with 4 visible; a cold walk
querying `.paging-canvas` got an ANCESTOR's canvas and reported "no canvas" on 24 of 25 pages.

Two symptoms, and both read as a broken page: a bare 30 s `TimeoutError` (Playwright waited on a
hidden match, or the click landed on the hub three columns away and every rect read unchanged),
or numbers that look like a finding and belong to the wrong element.

- **Resolve the root, then query inside it** — for `click`, for `text=` and for an `eval` probe
  alike. The root is the deepest `.active-page` with `offsetWidth > 0` that is not inside the
  thing you are measuring, or the module's own class (`.yt-marks .yt-start`). Reach a page
  object by DOM containment, never `Foo.all.at(-1)` — construction order is import order.
- **`:visible` settles a duplicate in one token**: `click ".paging-more:not(.paging-more-quiet):visible"`.
- **Filter every structural sweep** through `e.checkVisibility()` (or `rect.width > 0`) — a
  zero-size sweep that skips it flags nearly every page in a realm, all of them `display: none`
  or `contents` and correct by design. For the same reason, `watch` a real box on a columns
  page: `.page-column-body`, never the `display: contents` wrapper `.page--<name>`, whose
  `getBoundingClientRect()` is legitimately `{0,0,0,0}` (core/Page `doc/columns.md`) and whose
  `zero-size`/`missing` flag is pure noise.
- **Read the class names before reporting a layout bug**: a "wider than the viewport" sweep
  flagged every page with `DIV.dev-bar` — the dev server's own drawer, parked past the right
  edge on purpose.
- **A label is not a scope, and neither is `[aria-pressed]`** — a drawer held the bar's chips
  AND the nest chips, so `find(e => /dashboard/i.test(e.innerText))` matched the CONTENT chip
  named "Dashboard" and produced a confident false finding. When two controls share a label,
  separate them by something structural.
- **A chip built as `icon(name) + span(label)` reads `textContent` `"layerscard-in"`** — the
  icon ligature IS text. Match with `.endsWith(label)`, never `=== label`.

(2026-08-31, then six more times on 2026-09-05 — the single most expensive trap in this skill.)

## A plain render check, no gesture

Playwright is a GLOBAL npm install, not a repo dependency, and the ESM resolver ignores `NODE_PATH` — the one import that works from a scratch script is
`import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";` (the `file:///` scheme is mandatory; a bare `C:/…` path and `import "playwright"` both fail). Three minions rediscovered this the slow way (2026-08-18, 2026-09-04). Run bash scripts with `MSYS_NO_PATHCONV=1` or Git Bash rewrites a `/imagine/x/` argument into a Windows path.

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

⚠ **Every path a Node process writes must be a real Windows path (`C:/Users/…`) — never the
`/c/…` bash form**, whether it arrives as argv, as the plan's `out:`, or as a string literal in
your own script. Node on Windows reads a leading `/` as "root of the current drive", so
`/c/Code/lew42/…` silently builds a stray `C:\c\Code\lew42\…` tree: no error, the script logs
success, and `steps.json` even prints the mangled path back at you. `MSYS_NO_PATHCONV=1` does not
help — the mangling is Node's, not bash's — and passing the PLAN itself at a `/c/…` path dies with
ENOENT before step 1. Three occurrences across two scripts and the runner (2026-09-04/05).
Cheapest guard: write to a bare filename in the scratchpad cwd and `cp` it afterward in bash,
where `/c/…` is native and safe.

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
  hover chain, even right after a `hover parent` step (2026-08-21, `.pg-add`). Best route,
  no coordinates: `hover ancestor-sel`, then `hover "ancestor-sel>.child"`, then `down`/`up` —
  the pointer is already inside the ancestor, so the reveal survives the actionability check
  (2026-08-27, proved on `.pg-add`). Fallback: coordinate `move cx cy` + `down` + `up` —
  **centres from a probe eval, never rect corners**: a corner lands on the boundary and clicks
  the neighbour, a real action on the wrong node, no error (2026-08-27, tree-row miss). Aim at
  a SHALLOW/leaf target: hovering an outer box whose center lands inside a nested child reveals
  both their hover-children, and the `move` toward the outer's can transit out of the nested
  hover zone, shifting the target before `down` lands — no error, nothing happens (2026-08-21,
  three silent misses on a root `.pg-add`; diagnosed via `elementFromPoint`).
- **A full-card `::after` overlay eats a `text=` click**, no hover involved. `.page-preview-link::after`
  (Page.css) is spread `position: absolute; inset: 0` over the whole card so the whole thing is
  clickable — Playwright's actionability check needs the element receiving the hit to be the target
  or a DESCENDANT of it, and here the hit resolves to the ANCESTOR `<a>`, which fails forever: a
  bare 30 s `TimeoutError` on a card that renders fine and is visible in the screenshot. Click the
  anchor itself by a stable attribute (`a[href='…']`), never the title text inside it, wherever a
  card uses an overlay pseudo-element as its hit area (2026-09-05).
- **A click auto-scrolls, and that scroll reads as a layout jump.** Playwright scrolls the target
  into view first, so a `watch` rect measured across a click on something below the fold reports
  the SCROLL, not the mechanism — no error, just a plausible number. `scrollIntoViewIfNeeded` the
  target BEFORE the "before" reading. Same lesson's other half: scroll anchoring can absorb a
  height change — when a box shrinks inside a scrolled container the browser may hold the content
  below it still and move the BOX instead, so the same swap measured 1px or 258px depending on
  where you happened to be scrolled. When the claim is about a component, measure offsets INSIDE
  that component's own box, never against the viewport (2026-09-05).
- A `hover` that TIMES OUT (30s, bare `TimeoutError`) on a hover-revealed element has two
  causes, same error: the reveal MOVES the target (put it in `watch`, read `moved` — 2026-08-27,
  an in-flow `.pg-add` slid out from under the pointer), or the target is COVERED by a sibling
  that takes the hit (2026-08-27, a full-width `.pg-add` over both edge chips). One diagnostic
  settles any hover/click that silently does nothing: `hover` the ancestor, then eval
  `document.elementFromPoint()` at the target's centre — present + opaque + `pointer-events:
  auto` but hit-testing to something else is occlusion, not movement.
- The dev server's LiveReload reloads every headless tab whenever ANY agent saves under
  `public/` (`Directory.js` calls `LiveReload.changed()` with no path = reload everything) —
  never park state on `window` across steps; re-acquire in each `eval`
  (`import('/mod/page.js').then(m => …)` — the module cache makes it free). A mid-step
  navigation now records a `navigated mid-step` flag and the run carries on (2026-08-27;
  three runs died to it before the fix). Surviving is not enough: a reload re-opens the SAVED
  document, so post-reload steps report real-looking numbers for the WRONG state — carry a
  stamp field you set at build time, so a silent reload shows up as `stamp: undefined`
  instead of a plausible measurement (2026-08-27, a run reported a height for a box that
  no longer existed). ⚠ Know the SYMPTOM: while sibling agents are saving under `public/`, the
  `goto` step reports `pageerror: TypeError: Chaining cycle detected for promise` on a
  brand-new page — which reads exactly like a static ESM import cycle in the module you just
  wrote. The tell is that it appears on `goto` only, is not reproducible, and every module
  imports fine under `import(…)`. A promise-cycle pageerror during load is a reload race, not
  your import graph; re-run on a quiet tree (2026-09-05, five bisecting probes lost to it).
- A state change that settles via `ResizeObserver`/transition/rAF reads STALE in the same
  `eval` that caused it — one expression is one synchronous tick. Split the action and the
  measurement into two steps (the runner's own `pause` lets the observer run), or you will
  report a bug that is already fixed (2026-08-27: 144px "offset" in-step, 0.01px one step
  later).
- `watch` reports the FIRST match of each selector, not all matches — a sweep of N elements
  needs one `eval` returning a `{path, centre, rect}` per match (structural paths, not
  `data-id`s — ids are minted fresh per fixture), with a `move` to a neutral point between
  gestures so every measurement shares one baseline (2026-08-27).
- **Headless Chromium has overlay scrollbars — no scrollbar-space bug is reproducible here.**
  A scrolling div reads `offsetWidth - clientWidth === 0` in bundled Chromium, with an
  injected `::-webkit-scrollbar`, and even in `channel: "chrome"` with overlay features
  disabled (2026-08-29: a rail that visibly jumped ~15px on desktop Chrome measured "stable
  to the third decimal" in two independent probes). Never conclude "stable" about a box with
  `overflow: auto` from a headless rect alone — measure the TOGGLE instead
  (`scrollHeight > clientHeight` per state), and reason the ~15px from there.
- Shoot into the session scratchpad, never into `public/` — the dev server watches the tree,
  so a png written under `public/` fires LiveReload and the NEXT step lands mid-reload:
  intermittent empty results, zero console errors, reads exactly like a page bug (2026-08-27).
  Copy the keeper pngs into the task dir at the END of the run.
- A speculative selector in a plan is a REAL gesture on real data. A throwaway
  `click "button:nth-of-type(1)"` in a tool that saves appended a box to the owner's document
  (2026-08-27) — and the step's own output only said the watch went `missing`. In a tool that
  writes, resolve the selector in an `eval` first and read back what it matched; "never gesture
  on the owner's document" covers smoke steps you did not think of as gestures.
- Restart nothing. The dev server stays up; you never touch it.

Improve this skill: append to `improvements.md`.
