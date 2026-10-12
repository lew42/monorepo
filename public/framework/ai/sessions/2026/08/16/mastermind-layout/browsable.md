# Browsable — is the prime objective true?

**The frontier is the Doc tab strip: everything on a module's Overview side is
cards, and the instant you click **API** or **Docs** you are in a flat vertical
list of up to 51 bare names with no description, no grouping and no picture —
435 of the site's 863 addressable things live behind that one click.**

The other half of the objective — *fewest possible clicks* — is **already met and
needs no change**. Nothing on the framework site is more than **4 clicks** from
`/framework/` through chrome alone (no prose links, no url typing), and 264 of
307 real content pages are ≤ 3.

## The numbers

Navigation graph built from source: `children:`, `overview:`, the Doc-derived
`api`/`docs`/`files` sections, `previews()`/`walls()`/`catalog()`/`demo.exhibit()`
walls, the `/framework/` Sidebar, and prose links. 140 `page.js` dirs expand to
**863 reachable urls** (each API member, note and inline demo is a real page).

| clicks from `/framework/` | any link | **visual only** (card→card→card) |
|---|---|---|
| 0 | 1 | 1 |
| 1 | 53 | 51 |
| 2 | 210 | 122 |
| 3 | 586 | 149 |
| 4 | 13 | 10 |
| never reachable visually | — | **530** |

Split by what the page *is*:

| kind | count | reachable by cards | verdict |
|---|---|---|---|
| content page (a layout, section, element, component, demo, guide) | 307 | **299 (97%)** | ✅ objective met |
| overview demo (a Doc's catalog rail) | 25 | **25 (100%)** | ✅ |
| API member (`/View/api/append/`) | 343 | **0** | ❌ the frontier |
| doc note (`/Page/docs/declaring/`) | 92 | **4** | ❌ the frontier |
| section tab (`/View/api/`, `/View/files/`) | 99 | 5 | chrome — fine |

## Worst offenders

| thing | clicks | path | visual? | own docs? |
|---|---|---|---|---|
| `/framework/core/View/api/*` — 51 members | 3 | card › **tab** › **rail** | **no** | yes, excellent |
| `/framework/core/Page/api/*` — 43 members | 3 | card › **tab** › **rail** | **no** | yes |
| every `docs/<note>` — 88 notes over 26 modules | 3 | card › **tab** › **rail** | **no** | yes (it *is* the note) |
| `/framework/styles/layouts/space/doc/syntax/` | 4 | card › card › **tab** › **rail** | **no** | yes |
| ~33 utility classes (`pad`, `measure`, `checkered`, `zoom-*`, `all-1`, `mb`…) | **∞** | none — md tables inside `/styles/layers/util/` | **no** | one table row each |
| ~30 styled elements (`blockquote`, `hr`, `details`, `figure`…) | **∞** | none — `demo()` blocks inside 5 childless pages | **no** | a caption each |
| `/framework/start/example/` | url only | not in `children:` | no | prose only (scout's orphan) |
| `ext/editor`'s card on the `/framework/` wall | 1 | card | **renders broken** | yes |

The last row is an observed defect, not a structural one: `editor/page.js:335`
overrides `preview()` with a live fetch of the saved document, and on the
landing's Extensions wall it paints an empty box with a stray `<input>` and
throws its own label out of the grid. It is the only live thumb on the site's
front door and it is the one that fails.

## The deepest things — and yes, the depth is earned

The floor of the site is 4 clicks, and **10 of the 13 pages down there are fully
visual**: `/framework/ext/LayoutTool/library/bad/<trap>/` — framework → LayoutTool
→ library → bad → the trap, every step a live render of the layout it names. That
is exactly the depth a "ten ways to get this wrong" knowledge base should have.

The three that are *not* earned are the same failure as everything else:
`styles/layouts/space/doc/syntax/` and the two `theme/*/files/` tabs, all reached
by a tab plus a text rail.

## The widest fan-outs

| page | entries | shape | browsable? |
|---|---|---|---|
| `/framework/core/View/api/` | **51** | flat vertical text rail, no groups | **no — this is a list** |
| `/framework/core/Page/api/` | **43** | same | **no** |
| `/framework/core/Item/api/` | 25 | same | **no** |
| `/framework/` | 62 | `walls()` — 6 grouped card walls | ✅ the model answer |
| `/framework/styles/layouts/` | 23 | grouped cards + a live search box | ✅ |
| `/framework/ext/LayoutTool/tests/` | 23 | cards | ✅ |
| `/framework/ui/` | 22 | Doc `wall()` of live component cards | ✅ |

The natural grouping the objective wants already exists in the data and is thrown
away: `Doc.members()` emits **properties first, then methods** and `previews()`
already draws a `<h4>` per `group:` run — but the API rail is `ext/tabs`
(`this.tabs().ac("vertical")`), a flat `<a>` list, so both the split and every
member's `description` are dropped on the floor.

## Things with no `/path/` of their own

Two populations, ~46 things, both named explicitly in the objective:

1. **The utility vocabulary** — `/framework/styles/layers/util/` documents ~33
   classes as 16 `demo()` blocks and 3 markdown tables on one page, with **zero
   children**. RULE#7 names "the utility vocabulary" as one of the five demo
   blocks; it is the most-typed API on the site and it is the least browsable.
2. **The styled elements** — `/framework/styles/elements/{text,lists,code,media,misc}/`
   hold 32 `demo()` blocks across 23 `##` sections and declare **no children at
   all**. Only `table/` and `forms/` give their variants urls (7 pages).

Tokens (`--gap`, `--pad`, `--column`, `--measure`, `--basis`, `--gutter-x`) have no
page anywhere; they are prose inside whichever demo first needed them.

## The three changes, ranked

### 1. Turn the ~46 orphan `demo()` blocks into `demo.page()` children

`styles/layers/util/page.js` + the 7 `styles/elements/*/page.js`. Each
`demo(fn, note)` becomes `demo.page("name", fn, { note })` in `children:`, and the
inline call goes away. **The block already exists and is already the site's
answer** — `demo.page()` gives each word a url, a live half-size card on its
parent's wall, an `Overrides:` line read off the source, and a Variants wall of
its own, for one wrapper per demo. Nothing new is invented (RULE#7 satisfied by
naming the block, not extending it).

- **Buys:** ~46 things go from *no url at all* to **3 visual clicks** from
  `/framework/` (framework → Layers/Elements card → util/text card → the word).
- **Cost:** 8 files, mechanical, but 46 names have to be said out loud (RULE#3),
  and the pages get long. **Not RULE#1 surgery** — no API changes, no `children:`
  restructuring, no responsibility moves; it adds leaves to childless pages.
- **One question for Mike inside it**, see §3.

### 2. Give the API/Docs rail its description line and its two group headings

`ext/Doc/Doc.js` — `section()` renders `this.tabs().ac("vertical")`. The
information to fix it is already computed: `nav_for()` carries `description`, and
`members()` already knows which entries are properties and which are methods.

- **Buys:** 0 clicks. It converts **435 steps** — half the site's urls — from an
  unscannable name list into a labelled, grouped one. By the objective's own
  wording ("you find any thing by clicking through previews") this is the largest
  non-conforming population on the site, and the only reason it ranks second is
  that a method genuinely has no picture, so this can never become fully visual.
- **Cost: RULE#1 surgery — needs Mike.** It changes the page shape of all 37
  modules at once, and `ext/tabs` is shared with the top strip
  (`ext/Doc/readme.md` Traps: `bar()` and the mount region are the same list).
  **And the obvious version is probably wrong**: a 51-card `catalog()` rail would
  be a worse `/View/api/` than the text list is. The proposal is the small one —
  a second line and two `<h4>`s — not cards.

### 3. Decide where a layout word lives, once

Twelve words (`flex`, `v`, `gap`, `wrap`, `three`, `auto`, `basis`, `split`,
`v-center`, `stack`, …) have real urls under `/framework/styles/layouts/flex/`
and `/grid/`, drawn by `word()` as live cards. **The same twelve, plus twenty-one
more, are also markdown table rows on `/framework/styles/layers/util/`** — a
second address, a second shape, a second explanation, and neither list is
complete. Change 1 makes this worse before it makes it better: it would create a
third home unless the question is answered first.

- **Buys:** nothing measurable. It stops the vocabulary being documented twice.
- **Cost: RULE#1 — this is a paragraph, not a commit.** Deciding whether the
  vocabulary lives under `styles/layers/util/` (by cascade layer) or under
  `styles/layouts/` (by what it does) is a navigation decision with 33 urls
  attached. **Mike's call, and change 1 should wait on it for the util page**
  (the elements half of change 1 has no such conflict and can go first).

## What is already good — most of it

This is not a failing site. The objective is **met** for everything it was built
for, and the machinery is genuinely well made:

- **`walls()` on `/framework/` is the model answer to "an index of indexes".**
  Every one of the 62 grandchildren — every core class, every ext, every styles
  section, every util — is **one visual click** from the front door, in a grouped
  card wall with a one-line description. The `readme.md` record of why it is not
  ten icon cards in a 1080px column is worth reading on its own.
- **The `/framework/` Sidebar is a second, independent path to the same depth**,
  and it persists across every descendant — so nothing under `/framework/` is
  ever more than one click from any section or its children.
- **97% of real content pages are reachable by cards alone.** Only 8 of 307 are
  not, and they are strays (`ext/tabs/what|why/`, `Panel/full/`,
  `Page/children/guide|intro/`, `LayoutTool/audit/taste`, `taste/corpus`, one
  `bad/` entry reached only by prose).
- **Depth is not a problem anywhere.** 4 clicks maximum, and the pages at 4 are
  the ones that should be.
- **The card system is exactly one system.** `preview()` / `preview_card()` /
  `previews()` / `walls()` / `catalog()` / `demo.exhibit()`'s Variants wall all
  end in the same `div.page-preview`, which is why "is this step visual" was a
  question a script could answer at all.
- **`/framework/styles/layouts/` is what a 23-wide fan-out should look like** —
  grouped cards, live thumbs, and a search box over the wall.
- **Docs are strong where they exist.** All 37 Doc modules have the full six
  artifacts (readme + files tab + API + notes + prose), and a member page carries
  the real source, the patched-at-runtime banner, the `Overrides:` line and the
  prose. The failure is finding them, never what is there.

---

*Method: the graph is parsed from source, not crawled —
`children:`/`overview:`/`properties:`/`methods:`/`notes:`/`files:` per `page.js`,
plus which pages call a wall. A step counts as **visual** only when the parent
draws the child as a `.page-preview` card; a Doc top tab, a vertical member rail
and a Sidebar link count as steps but not visual ones. A Doc's Overview costs 0
clicks (`tabs()` gives the first tab the module's own url). Excluded:
`core/new/**` (308 sketch pages, deliberately undeclared — CLAUDE.md says don't
import them) and `framework/ai/<date>/` task dirs.*

*Where this should live permanently: `public/framework/audit/browsable/` — a
child of the existing `/framework/audit/` page, beside the other measured
verdicts, with the numbers regenerated rather than transcribed. It is a
measurement of the whole site, so it belongs to no single module's `doc/`.*
