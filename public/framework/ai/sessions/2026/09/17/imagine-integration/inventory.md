# Inventory — every realm under `/imagine/`, 2026-09-17

**24 directories**, not 27. The rail shows 25 columns because `Start` is written inside
`/imagine/page.js` and has no directory of its own. The brief's 27 reconciles as these 24 plus
the two top-level realms that grew out of here — [`/layouts/`](/layouts/) and
[`/websites/`](/websites/) — plus the second pass `review/rethink/`.

**Size.** 35,029 lines of JS and 8,752 of CSS. The whole framework is 77,038 lines of JS, so
`/imagine/` is 45% of the framework's size again, sitting beside it.

**The fact that decides every move: nothing imports across the boundary.** Not one `.js` file
outside `public/imagine/` imports a module from inside it. Every outside reference is a
hyperlink written in prose. There is exactly one hard code dependency in the whole repo —
`export const DIR = "/imagine/generated/"` in `framework/core/Page/generator/export.js`, one
line. So no move here can break a page by breaking an import; the entire cost of any
restructure is rewriting links.

**Links** below counts live hyperlinks into that realm from the rest of the site — `/framework/`,
`/layouts/`, `/notes/`, `/blog/` and sibling realms — and **excludes** `framework/ai/` task
logs, which are history and are never rewritten. 576 live links in total, and about 1,500 more
in the logs.

## The 24

| Realm | What it is | What it proved or built | Graduated to | Still used by | Status | JS / CSS |
| --- | --- | --- | --- | --- | --- | --- |
| **paging** | one configurable page, six blocks, twelve shapes; and **Make**, the three-pane page CMS | six page words any page can say, and the box they open | `core/Page` — `navigation` `width` `arrangement` `surface` `background` `type_size`, and **`Page.Frame`** (the graduated half of `stage.js`) | Make writes real `page.json` files; `notes/` cites it 68 times | **live app**, biggest realm | 9,055 / 2,197 |
| **design** | 13 design studies read off one overnight screenshot library | the size standard, the spacing rungs, the control-padding rule | `framework/styles/system` (`--size`, `--pad`, `--gap`, `--flow`, four rungs), `ui/controls` | `styles/system/readme.md` and `ui/controls` link **out** to it to explain themselves | **finished study** | 5,584 / 656 |
| **scenes** | a 3D pager — the page tree *is* the scene graph | navigating can swap a world, an object, a region or a light | nothing yet | nothing | lab, alive | 2,408 / 251 |
| **youtube** | six labs on the IFrame Player API | a shared timeline can drive real UI; `default` columns never get `activate()` | the `activate()` finding went to `core/Page` docs | nothing | lab, alive | 1,428 / 351 |
| **codrops** | twelve ported Codrops web effects | which effects survive this framework's own words | nothing | **nothing — 0 live links** | lab, alive, isolated | 1,332 / 876 |
| **platform** | a design lab for a community platform: 9 research verdicts, 5 decision records, an MVP slice | the research-program shape | `ext/Research` (`Program.js`, `entries.js`) | 69 of its 71 links are from `/notes/` essays | **finished study** | 1,291 / 0 |
| **importance** | pairwise judgment — "which of these two matters more?" over a typed JSONL graph | ranking falls out of comparisons; 9 ms cross-window updates | nothing | `layouts/browse/verdicts.js` follows its append-only rule | **live app** | 1,229 / 230 |
| **layouts** | the lab where arrangements are played with | the `N.name` numbering | **`/layouts/`** — the encyclopedia, which renamed it `N-name` and owns the names | 63 of its 73 links are `/layouts/` pointing back in | **superseded by `/layouts/`** — its own readme's first line says so | 1,207 / 424 |
| **blogx** | eight blog shells rendering the same eight posts at 3440 | a wide screen gets more columns, never a wider one | the winning shell became **`/blog/`** | `/blog/`'s readme and docs cite it 8 times | shape lab, spent | 1,116 / 528 |
| **sections** | one horizontal band cut into 2, 3 or 4 columns | the framed-middle section, sticky sides | `core/Page/words.js`, `styles/sections` | `/layouts/` cites it 13 times | shape lab, spent | 1,095 / 371 |
| **stream** | a page edited in one window, live in every other | a `.jsonl` the dev server watches is enough state; 2–3 ms | `ext/JSONL`, `dev/Socket`, `Server/plugins/SocketServer/Append.js` | the mechanism is core's; the page is the proof | **live demo** of a shipped seam | 1,046 / 137 |
| **cms** | a markdown file is a page, the dev socket writes files | a CMS needs no backend; the storage options matrix | `core/Page.file()`, `ext/Saver` | `core/Page/doc/data-children.md` cites it | **superseded by `paging/make/`**, which is the real CMS | 908 / 15 |
| **vary** | four trees of column-page variations — scroll, tone, place, colstyles | every variation is a page, not a config option | `core/Page/generator` (controls, CSS, the four looks) | the generator's readme cites it 13 times | lab, spent | 888 / 212 |
| **research** | four ancient-technology topics dug in parallel, every claim credence-rated | the live research program | **`ext/Research`** — the module | `ext/Research/page.js` and its readme link here as the example program | **live app** on a shipped module | 801 / 76 |
| **game** | a game whose only mechanic is navigation — 9 rooms, 4 things, 1 way out | `page.store()`, keyed on the page's own url | `core/Page.store()` | `store.md` cites it as one of two consumers | lab, alive, self-contained | 771 / 0 |
| **shells** | ten app-shell layouts, each at its own url | one grid makes all ten chrome arrangements | nothing | `/layouts/` cites it **33 times**, the most of any realm | shape lab, spent | 654 / 278 |
| **screens** | eight demos of what a click does to your screen | the two words `full` (replaces) and `fill` (joins) | `core/Page` width words, `doc/columns.md` | `/layouts/` cites it 26 times | shape lab, spent | 590 / 283 |
| **review** | the 2026-09-04 clarity pass (18 realms, 13 failed, 55 fixes) and the 2026-09-05 shape pass | the newcomer rule, and the "3-column card needs a live centre" rule | the rules reached `CLAUDE.md` and `/imagine/design/layout/approved/` | **nothing — 0 live links** | **finished report** | 580 / 130 |
| **mag** | *The Column*, issue 01 — six articles built only from column words | the vocabulary composes into something you read, not inspect | `core/Page/generator/specs.js`, `ext/tabs` decisions | the generator's readme cites it | shape lab, spent | 473 / 391 |
| **team** | a six-person roster, a drag-and-drop board, two controls | **`page.store()`**, and `Draggable.under()`'s filter argument | `core/Page.store()`, `ext/Draggable` | `store.md` and `core/Page/readme.md` cite it | lab, alive, self-contained | 471 / 58 |
| **feeds** | three labs — a lazy YouTube picker, one dataset three ways, a live weather API | a page that draws its own cards must say `index: true` | the `index:` finding went to core's docs | nothing | lab, spent | 462 / 179 |
| **gallery** | browsable lists whose every card is a foreign `page.js` imported by path | `previews()` on pages that are not your children | `core/Page/doc/previews.md` | core's `columns.md`, `findings.md`, `previews.md` cite it | lab, alive — a renderer other pages could use | 459 / 77 |
| **generated** | where the page generator lands an exported tree | an export is a scaffold you then edit by hand | the generator itself is `core/Page/generator` | **the one hard dependency** — `export.js`'s `DIR` constant writes here | **live output directory** | 286 / 46 |
| **decks** | nine ways to cut a screen into regions | which content kind survives which region shape | `styles/layouts/cols` words and adoption | `/layouts/` and `cols` docs cite it | shape lab, spent | 832 / 391 |

## Where the 576 live links come from

| Source | Links in | Reading |
| --- | --- | --- |
| `/notes/` | 213 | working notes citing a demo — prose, cheap to rewrite |
| `/layouts/` | 187 | **the encyclopedia reaching across the boundary for its own evidence** |
| `/framework/` | 166 | modules pointing at the lab that proved them |
| `/blog/` | 10 | the blog citing `blogx` |

## Four kinds of thing, sharing one rail

This is why a newcomer is lost: the rail gives 24 identical cards to four kinds of thing that
have nothing in common.

| Kind | Realms | Count | Where it belongs |
| --- | --- | --- | --- |
| **Tools** — things you use, that keep state or write files | paging · importance · research · stream · cms · generated | 6 | `framework/ext/`, or their own top-level url |
| **Worlds** — things you play with | game · scenes · team · gallery · codrops · youtube · feeds | 7 | here. **This is what `/imagine/` is.** |
| **Shapes** — ways to arrange a screen | layouts · sections · shells · screens · decks · blogx · mag | 7 | `/layouts/`, the encyclopedia that already cites them 187 times |
| **Studies** — finished, verdicts already shipped | design · platform · review · vary | 4 | `doc/` beside whatever they produced |
