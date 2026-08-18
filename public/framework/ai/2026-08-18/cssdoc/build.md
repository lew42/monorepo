# CSSDoc v1 — build brief (Opus)

**The three laws govern.** Less is more (ASAP — the fastest working version first). Clarity is the
one exception. Prioritize. **Budget: ~120 lines of JS. If you pass 200, you have built v2 — stop
and cut.** Read `CLAUDE.md`; it outranks this brief.

## Your spec is already written and ACCEPTED

`public/framework/ai/2026-08-18/cssdoc/proposal.md` — read it in full first. The mastermind has
accepted all five verdicts. **Do not redesign.** If a measurement contradicts it while you build,
log the contradiction and follow the measurement — the proposal was measured, so this should be rare.

## What you are building

`public/framework/ext/CSSDoc/CSSDoc.js` exporting `cssdoc(target)` — a block you call inside any
`content()`, the way `demo()` and `md()` are called. One call site, one subject:

```js
// public/framework/styles/elements/code/page.js — top of content()
cssdoc("code");
```

It renders, in this order (proposal §5): the live specimen twice (inline `<code>` in a sentence,
`<code>` inside a `<pre>`) · the rule table in cascade order · the property table with the computed
value **per specimen** and which rules set it.

`target` is an explicit string. Deriving it from the page slug is deliberately NOT in v1 — one call
site cannot rot. Say so in the readme so the next agent does not think it was forgotten.

## The acceptance test — this is the deliverable

Open `/framework/styles/elements/code/` headless and read the `box-shadow` row:

- **inline specimen** → `rgb(230, 230, 230) 0px 0px 0px 1px inset`, set by **one** rule
- **block specimen** → `none`, set by **two** rules (`code` then `pre > code`)

Tonight's defect is the case where the second number is 1. **Paste that row's real text into your
log.** A screenshot of the page at 1280 goes in the task dir as `shot.png`.

## The trap most likely to sink this — read twice

**`getComputedStyle` on an element that is not in the document returns nothing useful, and throws
nothing.** Your specimens are built inside `content()`, which runs *before* the page is mounted.
Compounding it: a hidden tab never lays out (no rAF, no ResizeObserver, frozen geometry), and this
repo's MCP eval runs in hidden tabs.

So: **measure after the specimens are connected, and prove they were.** Find how this framework
signals mount (read `core/View/View.js` and `core/Page/Page.js`; `ext/demo` and `ext/DesignTool`
both measure live DOM — copy whichever seam they use). If there is no post-mount seam, say so
plainly in your log and use the simplest correct thing rather than inventing a subsystem.

⚠ **Never build DOM after an `await`** — `View.captor` is restored at the first `await` and the
elements land somewhere else, silently. Capture the box synchronously, fill it in a callback.

## Other traps, all already measured (proposal §3)

- `el.matches("code::before")` is **false, never throws** — strip `::x` from each comma-part before
  matching or you silently lose every pseudo-element rule.
- Recurse `CSSLayerBlockRule` / `CSSMediaRule` / `CSSContainerRule`. Layer order from
  `CSSLayerStatementRule.nameList`; nested names join with `.`.
- 14 of 72 sheets have no `href` — show `<style>` as the file, do not crash, do not fix `ui/parts.js`.
- There is no line-number API and `cssText` is normalised. **Link the file, never a line.**
- Non-matching `@media` rules stay in the table, labelled `only when (…)`. Do not hide them.

## Mandatory skills — run them, they write files and that is expected

1. **`css`** before any CSS. **`new-css-class`** for every class name — take the `cssdoc-` prefix
   and add one line to `public/framework/styles/css-scopes.txt`.
2. **`layout`** before sizing. ⚠ **Two rule tables are two columns of content — they must NOT live
   in `main`'s `--measure`.** Claim `wide` or `bleed`; a squeezed table is the single commonest
   failure here. Tables scroll inside their own `overflow-x: auto` box.
3. **`documentation`** at the end: `ext/CSSDoc/readme.md` (≤ the shape in that skill — try to keep
   it as short and simple as possible), and `page.js` only if you can show rather than tell.
4. **`skill-improvement`** the moment any skill misleads you — one line, its `improvements.md`.

## Delete what you replace

`styles/elements/code/page.js` currently hand-quotes CSS rules, and the proposal proved four of
those quotes wrong. **Delete the hand-copied rule text you have replaced.** A correct generated
table sitting next to a stale hand-typed one is worse than either alone. Keep the prose and the six
live demos — the prose is good; only the facts were wrong.

## Files you own — touch nothing else

- CREATE `public/framework/ext/CSSDoc/` — `CSSDoc.js`, `readme.md`, `CSSDoc.css` (only if `css` says
  the declarations belong in a sheet), `doc/` if you have a topic worth a url.
- EDIT `public/framework/styles/elements/code/page.js` (the call site + the deletions above).
- APPEND one line to `public/framework/styles/css-scopes.txt`.
- APPEND to `public/framework/ai/2026-08-18/cssdoc/task.jsonl`, and write `shot.png` there.
- If `ext/CSSDoc` needs a parent `children:` entry to exist as a url, add that ONE word.

**Do not** edit `framework.css`, any skill except an `improvements.md`, or any other module.

## Log and report

`log` lines in `task.jsonl` (append-only; `printf`/`Add-Content`, never `Out-File` — the BOM breaks
the viewer). **Timestamps from `date -Iseconds`, never typed.** Absolute paths only — the Bash cwd
persists between calls and a stray `cd` has already put one task dir inside a module tonight.

Report back: the two `box-shadow` rows verbatim · line count of `CSSDoc.js` · the mount seam you
used and how you proved it · anything in the proposal that measurement contradicted · what you cut.

Headless: `const require = createRequire(import.meta.url); const { chromium } = require("C:/Users/mike/AppData/Roaming/npm/node_modules/playwright");` — scripts in the scratchpad, never the repo.
Dev server is live on `http://localhost`.
