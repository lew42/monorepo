# Weight — one number per page, 1 by default, that says how much it matters

Live: [`/framework/core/Page/weight/`](/framework/core/Page/weight/). Code: `weight.js` (~25
lines), `Server/page-refs.mjs` (the writer). Prior work checked first: [`doc/prior.md`](/framework/core/Page/weight/doc/prior.md).

## The formula: `weight = 1 + (distinct pages that reference it) + (a manual number)`

**Chosen: add, not multiply.** The owner's own words for the manual part were "*add* 10 to
important things," "*20 or 50*" for ultra-important — additive language throughout, and a
number that just adds on top is predictable: a page's own reference count never explodes just
because someone bumped a different page. **The alternative, multiplying** (`(1 + refs) ×
manual_factor`) **was rejected**: it makes the manual bump and the reference count fight each
other — a heavily-referenced page's manual bump would explode while a barely-referenced page's
barely moves, which is the opposite of "add 10 for important."

**Meaning varies by page type — not built, one line only.** The owner's own words: "familiarity
slash confidence slash stability slash all the things." One number can carry all of those
meanings depending on what kind of page it's attached to (a doc page's weight might mean
*familiarity*; a task card's might mean *confidence*), but that's a per-type decision for later
— today's weight is one plain number with one plain formula, nothing more.

## The two line kinds — for whoever documents `core/Page/doc/jsonl.md` next (not this task's fence)

```
{"referenced_by": "/framework/core/Page/layout/"}   accumulates — every distinct FROM url kept
{"weight": 10}                                       the manual number — LATEST line wins
```

`referenced_by` has to behave like `place()` in `Log.js` (every distinct value kept, nothing
overwritten), not like `file()` (one slot per key, latest wins) — see `doc/prior.md`. `weight.js`
doesn't go through `Page.set()` at all (it reads the raw log directly, described below), so it
implements that accumulation itself: collect every `referenced_by` value into a list, skipping
one already in it.

## Why a `page.jsonl` can sit next to a `page.js` and do nothing

Every demo page under `core/Page/` (`layout/`, `navigation/`, `make/`, …) is a `page.js` page,
not a `page.jsonl` one — so seeding real references into them means writing a `page.jsonl` file
into a folder that already has a `page.js`. Read closely before assuming that's dangerous:
**`Page.class.js`'s own loader (`Page.load()`, line ~394) only ever does one thing for a plain
declared child name — `import(url + "page.js")`.** It never even looks for a `page.jsonl` unless
a PARENT explicitly declared that child as `"name/page.jsonl"` (recorded in `child_kinds`,
`Log.js`), which none of these folders are. So a `page.jsonl` sitting beside a `page.js` is
inert to the page system — proven by reading the loader, not assumed — and `weight.js`'s own
plain `fetch()` reads it perfectly well anyway, since fetching a URL doesn't care what the page
router would have done with it. `Server/page-refs.mjs` creates this sidecar file when a target
has a `page.js`, and always PRINTS that it did, exactly because it's the one non-obvious step in
the whole design.

## The four mid-task additions — same formula, four different USES of it

The owner's own later words (owner-words.md, "Continued, about 4:55 PM"): weight should drive
**which pages show up in the main navigation**, a **quick-links row**, a **size upgrade** past
10, and it needs a **way to be SEEN** that the owner can pick between. All four are demonstrated
live on the weight page itself, reading the same eight numbers:

- **Main navigation — weight ≥ 1 is in, below 1 is out but still reachable.** Demonstrated by
  giving `old/` (the first Page docs, kept only as reference) a manual `-2`: real weight 1 base +
  1 real reference − 2 manual = **0**, so it drops off the main list and shows up in a small
  "also here" line instead — not deleted, not hidden, just not first.
- **Quick links — a flex-wrap row of pills, heaviest first.** The same eight pages, smaller and
  denser, because "the core things you might want to find on any page" (owner's words) doesn't
  need full icon cards.
- **Size upgrade above 10.** `layout/` gets a manual `+10` (it's where the owner's own
  `navigation/readme.md` already says to "start every layout here" — the most-pointed-to
  starting page in the whole set): 1 + 1 real reference + 10 manual = **12**, so it renders
  visibly bigger and sorts first, not just numerically highest.
- **A vs B — not decided, so both are built, side by side.** **A** is a small bar whose length
  scales with weight, the exact number only on hover (`title` attribute) — quieter, reads as
  "roughly how much," costs no label space. **B** is the plain number printed next to the name —
  louder, exact, and free to compare at a glance. The live page asks the owner to pick; nothing
  downstream depends on the answer yet.

**Not built: wiring weight into `Page`'s own real navigation menu.** That would mean editing
`Page.class.js` or `page.js` — a core API change with a dozen callers, which `CLAUDE.md`'s "Ask
before" rule reserves for the owner's own yes. The nav and quick-links sections on the weight
page are a working **preview** of the idea using real data, not the real menu.

## The rule that replaced the sidecar `page.jsonl` (2026-09-29 fix round, finding 2)

**A page.js folder's weight lines live in a sibling `weight.jsonl`, never a `page.jsonl`.**
Creating a `page.jsonl` beside a `page.js` — the design this doc used to recommend, in the
section above — turns out to subscribe that folder to the dev server's file watcher
(`Server/plugins/PageFiles.js` matches on the exact filename `page.jsonl`), which then fills the
"weight data only" file with `{"file": …}` lines every time something in the folder changes —
31 of 33 committed lines in `overview/page.jsonl` were exactly this churn, found in the
2026-09-29 review. `weight.js` and `Server/page-refs.mjs` both try `weight.jsonl` first and fall
back to `page.jsonl` only for a folder with no `page.js` of its own — a real page.jsonl PAGE
(`core/Page/jsonl/` itself) keeps its weight lines where its content already is.
