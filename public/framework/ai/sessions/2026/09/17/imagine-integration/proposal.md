# Proposal — folding `/imagine/` into the framework

**One fact decides all of this: nothing imports across the boundary.** Not one `.js` file
outside `public/imagine/` imports a module from inside it — every outside reference is a link
written in prose. So no move here can break a page. The whole cost of any restructure is
rewriting 576 links, and every one of them is a string in a `md()` call. The single exception
is one line: `export const DIR = "/imagine/generated/"` in `core/Page/generator/export.js`.

**And `/imagine/` is not one thing.** It is four kinds of thing sharing one rail — six **tools**
you use, seven **worlds** you play with, seven **shapes** that say how to arrange a screen, and
four finished **studies** whose verdicts already shipped into the framework. That is why a
newcomer is lost: 24 identical cards for four unrelated kinds of thing. Each kind already has a
home. [`inventory.md`](./inventory.md) has the row for every realm.

## The three moves

### 1 · Sort the rail into four groups — **S**
One file (`/imagine/page.js`), one hour, **zero urls move and zero links break**. The rail says
Tools · Worlds · Shapes · Studies, and every card sits under one of them. This is the fix for
"I'm sort of lost" and it costs nothing; it is also the decision record for moves 2 and 3,
because a realm's group *is* its destination. Do this one tonight whatever happens to the rest.

### 2 · The design studies join the design system — **M**
`/imagine/design/` is 13 finished studies whose answers already shipped as `--size`, `--pad`,
`--gap`, `--flow` and the four rungs. Right now `framework/styles/system/readme.md` has to link
**out to a lab** to explain its own rule, which is backwards — the module should own its proof.
Nine studies move under `styles/system/studies/`, and four go to the module they actually
belong to. 59 files hold 138 links to rewrite; no core code changes. This is the most literal
version of "integrate with the core framework" on the list.

### 3 · The shape labs join `/layouts/`; `/imagine/layouts/` is deleted — **M**
`/layouts/` is the encyclopedia of page arrangements — and it links **into** `/imagine/` 187
times for its own evidence. The boundary is in the wrong place. Seven realms become
`/layouts/labs/<name>/`, and `/imagine/layouts/` is deleted outright: its own readme's first
line already concedes that `/layouts/` owns the names, and it numbers them `N.name` against the
standard's `N-name`, so today the site teaches two spellings of one idea. 68 files hold 402
links. `/layouts/` already serves an alias id as a working url, so the redirect pattern exists.

## What moves, and what it costs

Production is static, so a "redirect" is a six-line stub `page.js` left at the old address.
**Links** counts live links from outside `/imagine/`; `framework/ai/` logs are history and are
never rewritten.

| Old url | New url | Links | Move |
| --- | --- | --- | --- |
| `/imagine/design/{size,spacing,padding,scale,type,color,themes,system,vocabulary}/` | `/framework/styles/system/studies/<name>/` | 118 total for `design` | 2 |
| `/imagine/design/controls/` | `/framework/ui/controls/study/` | ” | 2 |
| `/imagine/design/layout/` | `/layouts/doc/studies/` | ” | 2 |
| `/imagine/design/navigation/` | `/web/nav/doc/study/` | ” | 2 |
| `/imagine/design/journey/` | `/framework/ext/DesignTool/journey/` | ” | 2 |
| `/imagine/layouts/` | **deleted** — stub points at `/layouts/` | 73 | 3 |
| `/imagine/shells/` | `/layouts/labs/shells/` | 36 | 3 |
| `/imagine/screens/` | `/layouts/labs/screens/` | 32 | 3 |
| `/imagine/sections/` | `/layouts/labs/sections/` | 28 | 3 |
| `/imagine/blogx/` | `/layouts/labs/blogx/` | 10 | 3 |
| `/imagine/mag/` | `/layouts/labs/mag/` | 5 | 3 |
| `/imagine/decks/` | `/layouts/labs/decks/` | 4 | 3 |
| `/imagine/review/` + `rethink/` | `/framework/ai/2026-09-04/` and `/2026-09-05/` | **0 — fail-safe** | 4 |
| `/imagine/vary/` | `/framework/core/Page/generator/doc/variations/` | 13 | 4 |
| `/imagine/cms/` | `/imagine/paging/make/doc/why/` — superseded by Make | 6 | 4 |
| `/imagine/platform/` | `/framework/ext/Research/programs/platform/` | 71 | 4 |
| `/imagine/paging/` | `/framework/ext/Paging/` (Make → `/framework/ext/Make/`) | 117 | **L — the owner's call** |
| `/imagine/importance/` | `/framework/ext/Importance/` | 5 | **L** |
| `/imagine/research/` | `/framework/ext/Research/programs/ancient/` | 12 | **L** |
| `/imagine/stream/` | `/framework/dev/Socket/demo/` | 6 | **L** |
| `/imagine/generated/` | stays — **do not move**, `export.js`'s `DIR` writes here | 16 | — |
| `/imagine/{game,scenes,team,gallery,codrops,youtube,feeds}/` | **stay. This is what `/imagine/` is.** | 24 | — |

**Fail-safe, nothing links there:** `review` and `codrops` (0 live links each). Everything else
needs a stub. **Cheapest first:** `decks` (4), `importance` (5), `mag` (5), `cms` (6),
`stream` (6). **Needs the owner:** anything in the L rows — `paging` alone is 9,055 lines and
117 links, and moving it renames the repo's biggest single thing.

**Why the L rows are L and not M.** They are the six tools people actually use. Moving a tool
changes what it *is* — `/imagine/paging/make/` becomes "the framework's page editor" rather
than "a lab experiment", and that is a positioning decision, not a refactor. The framework has
no `ext/` module today that keeps files on disk the way Make does, so `ext/` would gain a new
kind of member. Worth doing; not worth an agent deciding alone.

## After the three moves

`/imagine/` holds **seven worlds** — game, scenes, team, gallery, codrops, youtube, feeds —
which is what the name promised all along. Everything that was a shape is in the encyclopedia,
everything that was a study is beside what it produced, and the tools are queued for a
conversation.

## The front page a newcomer should see

One screen, nothing below the fold on a laptop. The rail keeps its four group headings, and
beside it the first thing on screen is **one live world running** — the game's arrival card or
the 3D foyer, playing, not a screenshot of one — under a single sentence that says *these are
small worlds built to try one idea each; click one and walk around in it*. Under that,
**seven cards in one row**, each showing a real picture of its own world rather than an icon,
because the review already measured that a thumbnail beats an icon-and-caption and lets core
drop the two-line description. Nothing on the page explains the framework, names a width word,
or reports how it was built — every one of those sentences moves one click down into the
realm's own readme, which is where the two reviews found they belonged. And the three sentences
that used to sit here — what a columns host is, what `depth: 1` does, where `page.store()`
went — become a single quiet link at the foot that reads *how this place is built*.
