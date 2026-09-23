# Reduction 1 — one `fits()`, not two

Load the `minion` skill first. This is a **small, surgical code change** in `public/framework/core/`,
which every page on the site loads. Read all of this before you touch anything.

## The duplicate

`public/framework/core/Section/Section.js:261` exports this:

```js
export const fits = (layout, room) => !room || room >= (layout.widths?.[0] ?? 0) - 1;
```

The comment above it (Section.js:252-260) says so itself, in its own words: *"THIS BELONGS TO
`core/Layout`. It is `rules.js`'s first rule with the reporting taken off, and a second copy of a
rule is one edit from disagreeing with the first — `Layout.fits(width)` is where it should live.
`core/Layout/` was outside this task's write fence; logged in the task log for whoever owns it next."*

You are whoever owns it next. `core/Layout/` is inside your fence.

The original is `public/framework/core/Layout/rules.js:51-53`:

```js
const floor = layout.widths?.[0] ?? 0;
...
if (room && floor && room < floor - 1)
```

Same question — does this layout's floor fit in this much room — asked twice, in two files, with
two slightly different spellings of the same arithmetic. That is the exact shape the owner asked
this audit to find.

## What to do

1. **Put the one answer in `core/Layout/rules.js`**, beside the rule that already asks it. Export
   a small function — `fits(layout, room)` — carrying the two real caveats that live in
   Section.js's comment today, because they are the reason the function is written the way it is:
   only the FLOOR is asked (a ceiling can never make a layout unfit), and a box that has not been
   laid out yet measures `0`, so `!room` must answer `true` rather than greying out the whole
   catalogue.
2. **Make `rules.js`'s own width rule use it**, so the two can never disagree again. This is the
   whole point of the merge — if you leave `rules.js` computing the floor inline, you have three
   copies instead of one.
3. **`Section.js` imports it** from `core/Layout/rules.js` and its local copy goes away. Keep
   `Section.js`'s export name working if anything outside imports it — check first with
   `grep -rn "from.*Section.js" public --include=*.js`; nothing did when this brief was written,
   so a plain `export { fits } from "../Layout/rules.js"` re-export is likely the smallest
   correct thing, or drop the export entirely if truly nothing reads it.
4. Leave the two caveat comments somewhere a reader will find them — they are measured facts, not
   decoration. Move them with the function; do not delete them.

**Keep it tiny.** This is a few lines moving one directory. Do not restructure `rules.js`, do not
rename anything, do not touch `Layout.js` unless step 2 genuinely needs it.

## How to prove it, and it is not optional

`core/` is loaded by every page. A file that parses can still blank the whole site.

1. **Take the reload hold first:** `node Server/hold.mjs on "reduce-fits — core/Layout + core/Section"`.
2. Make the edits.
3. `node --check` **every `.js` file you touched**, one by one. This proves it parses, nothing more.
4. **Start your own private server and load the real pages through it** — never the owner's:
   `PORT=8095 node server.js` from the repo root, in the background. Then load these two urls
   headless and confirm each renders with **zero failed requests and zero console errors**:
   - `http://localhost:8095/framework/core/Section/`
   - `http://localhost:8095/framework/core/Layout/`
   The `ui-test` skill has the headless recipe. A screenshot of each into
   `public/framework/ai/2026-09-22/reuse-audit/shots/` is the proof; name them `fits-section.png`
   and `fits-layout.png`.
5. **Kill your server by its real PID** — read it from `netstat -ano | grep 8095`, never by name
   and never by matching `node server.js` (that has killed a sibling's server before).
6. `node Server/hold.mjs off "reduce-fits"`.

**If the pages do not render cleanly, put the files back the way you found them** (you read them,
so you have them) and say so in your log line. A broken `core/` is far worse than an unlanded
merge. Never `git checkout --`, never `git stash`, never `git reset` — the tree is shared with
other agents working right now.

## Your fence

Exactly three files: `public/framework/core/Layout/rules.js`,
`public/framework/core/Layout/Layout.js` (only if step 2 needs it), and
`public/framework/core/Section/Section.js`. Plus your screenshots in the `shots/` dir named above.
Nothing else, anywhere.

## What you write back

One `log` line appended to `public/framework/ai/2026-09-22/reuse-audit/task.jsonl` with
`node .claude/hooks/append.mjs <that file> <your-lines.json>` (write the JSON array with the
**Write tool**, into your scratchpad, never a heredoc; `"NOW"` becomes the clock). Start the `msg`
with `[R1] `. Say: what moved, the exact line count removed, the two urls you loaded and what the
console said, and — plainly — whether it worked or whether you put it back. No `findings.md`, no
page, no `finish-task`. The parent lands this task.
