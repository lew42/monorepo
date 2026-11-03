# Check 2 asks against the repo: ext/layout

You are a checker, not a builder. Do NOT edit any file in the repo. Read ONLY this brief and the repo files named below or found by searching. Write your answers to `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/38-ext-layout/results.json` and stop.

The owner asked for each thing below, and the record says it is still undone. Some are already built and nothing says so. For each ask decide:

- **done**: the thing exists now. Evidence = `path:line` of the code, doc or page that does it, plus the quoted line (under 25 words). A path that does not exist is a failure; open the file and confirm.
- **undone**: you looked and it is not there. Evidence = the three places you looked and what you searched for (the module's readme, its `doc/`, a `grep` for two or three key words, `git log --oneline -n 5 -S"<key word>" -- <dir>`). "I did not find it" with no places named is not allowed.
- **unclear**: the ask is a question, an opinion, a rule about how to work, or too vague to test. Say in one line why.

Be strict: "done" needs a file you opened. A related thing is not the thing. If it is partly built, say **undone** and name what is built and what is missing. Searching hard is cheap; guessing is wrong.

## Where to look

- Module: `ext/layout`, folder `public/framework/ext/layout` (the site serves `public/` as `/`).
- Readme chain, root to leaf: `readme.md`, `public/framework/readme.md`, `public/framework/ext/readme.md`, `public/framework/ext/layout/readme.md`. Also its `doc/`, `tasks/`, `inbox.jsonl`.
- `public/framework/ai/handover.md` and `CLAUDE.md` hold rules that count as "done" for asks about how agents work.
- Use Grep/Glob first; use `git log` sparingly (always with `-n 5` and a path).

## The module's readme (first 70 lines of `public/framework/ext/layout/readme.md`)

# Layout — a toolbar over anything, and a right-hand drawer that *pushes* the page over; for demo and guide pages that let the reader arrange things

## Use

```js
import layout from "/framework/ext/layout/layout.js";
import { knob } from "/framework/ext/layout/controls.js";

layout(() => { box("Alpha"); box("Beta"); })          // layout owns the box
layout.bar($box)                                       // …or steer a View, Element or Page you built
layout.bar($box, "mode gap column radius")            // …or name the controls yourself
layout.words.radius = $el => knob($el, "--radius", 0.25, 2, 0.05)
layout.context($box, $sel => …)                        // extra drawer content, for it or anything in it
```

## Watch out

- Register `layout.context()` once, on the region — the drawer draws the nearest registration at or above the selection, so a re-render can't strand it: [`doc/drawer.md`](./doc/drawer.md)
- `layout.bar()` returns an empty strip and fills it on the next microtask (`page.view` isn't set until `content()` returns): [`doc/decisions.md`](./doc/decisions.md)
- The `fill` page word pairs `.page.fill` with an inline `overflow: auto`, or everything below the fold is clipped: [`doc/decisions.md`](./doc/decisions.md)
- A `<select>` gets its value after its options exist; a knob reads at build and writes only on input: [`doc/controls.md`](./doc/controls.md)
- The outside-click listener runs in the capture phase, and `popstate` deselects outright: [`doc/decisions.md`](./doc/decisions.md)
- Selecting only *fills* an open rail now, it never opens one — `layout.bar()`'s sliders chip is the one explicit way in: [`doc/decisions.md`](./doc/decisions.md)
- The floating bar (`.layout > .layout-bar`) starts dimmed at rest (0.4), not invisible — a hover-only bar hid the whole "click a word on it" pitch: [`doc/decisions.md`](./doc/decisions.md)
- An unregistered word in a bar's list is skipped, never thrown — a misspelling draws one control short.
- `layout.selectable($el)` grants a region beyond the one `layout.bar()` already steers — the two-up's second pane is the one caller, and its own pane ends up region'd twice: [`doc/selection.md`](./doc/selection.md).

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why) · [Overview](/framework/ext/layout/) · [`doc/vocabulary.md`](./doc/vocabulary.md) (why `words` is a registry, one bar for three targets) · [`doc/drawer.md`](./doc/drawer.md) (why it pushes, the `--drawer` rail, width clamp) · [`doc/selection.md`](./doc/selection.md) (what's selectable, page vs container words) · [`doc/controls.md`](./doc/controls.md) (the primitives, reused directly by `ext/editor` and `ext/Panel`) · [`doc/decisions.md`](./doc/decisions.md) (callers, traps in full, open items, history)
- Files that matter: `layout.js` (box, bar, selectable), `panel.js` (selection and drawer), `words.js` (the control vocabulary), `controls.js` (chips, menu, knobs). Imports flow `layout` → `panel` → `body` → `words` → `controls`.


## Output: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/verify-undone/batches/38-ext-layout/results.json`

A JSON array, one object per ask below, same ids, nothing else in the file:

```json
[{"id":"abc1234567","verdict":"done|undone|unclear","evidence":"path:line - quoted line  /  or the places looked, one sentence","looked":["path or command", "path or command"]}]
```

## The 2 asks

1. `6c1e4bfbf3` (4 days old): Stop using the ext/layout tool approach to tune padding, and do not build more agent systems on it.
2. `6150f5753b` (4 days old): Do not continue the ext/layout tool approach of measuring absolute dimensions and having agents optimise padding and hierarchy.
