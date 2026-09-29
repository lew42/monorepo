# Prior work — every piece of layout and paging work found, in one table

Three read-only surveys went through `/imagine/` and `/layouts/`, through `framework/`, and
through two months of task logs (2026-09-29). This is their rows merged into one table:
duplicates folded together, keep first, then reference, then drop. **nav** marks work about
navigation; **decided** marks a question the owner already ruled on — reuse it, don't re-derive it.

Where two surveys disagreed, the file on disk decided (checked 2026-09-29): `/imagine/shells/`
and `/imagine/screens/` are 9-line redirect stubs, `ext/Playground` no longer exists,
`/imagine/paging/rightnav/` has no folder of its own any more (it points at
`/imagine/paging/library/settings/`), and `/layouts/explorer/` has landed.

The raw surveys: `public/framework/ai/2026-09-29/page-system/inventory/` (A, B and C).

| what | where | state | verdict | why |
|---|---|---|---|---|
| **This system's index** — core concepts, layout types, how to decide | [core/Page/layout](/framework/core/Page/layout/) | live | keep | the one place layout starts; v1 and v2 kept beside it |
| The layout encyclopedia — every page division named `N-name`, tagged, drawn at 3 widths | [/layouts/](/layouts/) | live | keep | the standard everything else points at; 12 layouts in 5 branches |
| **decided** The approved five — the closed set a new page picks from | [/layouts/doc/studies/approved/](/layouts/doc/studies/approved/) | live, decided | keep | a sixth is a proposal; moved here from `/imagine/design/layout/approved/` (now a stub) |
| Layout picker — the five questions, in order, with demos | [/layouts/decide/](/layouts/decide/) | live, decided | keep | "never a rule" (owner, 2026-09-28); the layout skill asks the same five |
| **decided** Layout naming — names not numbers, the id names the division, technique is a tag | [/layouts/doc/naming.md](/layouts/doc/naming.md) | decided | keep | a word describes many layouts; clicking a tag is the feature |
| Layout browser — every layout on the site, Approve / Improve, verdicts to jsonl | [/layouts/browse/](/layouts/browse/) · [task](/framework/ai/2026-09-17/mastermind-layout-browser/) | live | keep | the owner's own ask; its verdicts are real feedback data |
| core/Layout — 30 named arrangements, proven at seven widths, owning no content | [/framework/core/Layout/](/framework/core/Layout/) | live | keep | the name registry in code; old numbered layouts redirect here |
| The page grid — three tracks `main`, `wide`, `bleed`; the five shape words | [layout-system.md](/framework/styles/doc/layout-system.md) | live | keep | how one page divides its room |
| Column pages — `page.columns()`, width words, crumbs from `chain()`, scroll-snap | [overview/columns](/framework/core/Page/overview/columns/) · [task](/framework/ai/2026-08-26/column-pages/) | live, core | keep | the column paging system the owner named |
| Width words — six words for a column's own width | [overview/width](/framework/core/Page/overview/width/) · [doc/columns.md](/framework/core/Page/doc/columns.md) | live | keep | a different vocabulary from the page grid's `wide` |
| **nav decided** Open columns freeze their width when a sibling opens | [core-columns](/framework/ai/2026-09-24/core-columns/) · [nav-stability 09-17](/framework/ai/2026-09-17/nav-stability/) | live, decided | keep | 242px of jump fixed; `34cqi` basis, 0px shift on click |
| **decided** Spacing is a clamp; bleed is for paint | [spacing-clamp](/framework/ai/2026-09-01/spacing-clamp/) | live, decided | keep | root `--pad`/`--gap` tokens; cards and text never bleed |
| **decided** The gutter is padding, never grid columns | [padding-law](/framework/ai/2026-09-22/padding-law/) · [layout-analysis](/framework/ai/2026-09-22/layout-analysis/) | live, decided | keep | 133 pages at 4 widths; violations 6 → 1 |
| **decided** A region takes `.pad`, a framed box takes `.card` | [card-word](/framework/ai/2026-09-19/card-word/) | live, decided | keep | `.pad` on a card stayed at its 1em floor |
| **decided** A spacing ramp is never the size of a control | [nav-fat](/framework/ai/2026-09-06/nav-fat/) | live, decided | keep | 26 of 380 size declarations misused it; now in the css and layout skills |
| Spacing system — one knob, four gap rungs, painted live | [/framework/styles/system/](/framework/styles/system/) | live | keep | the numbers every layout's spacing comes from |
| **nav** Navigation — persistent vs switching, the levels, the go-to, the alternatives | [core/Page/navigation](/framework/core/Page/navigation/) | live | keep | level 1 of this system: start every layout here |
| **nav decided** Navigation stability — "does what you were reading move?", every mechanism measured in px | [/imagine/paging/navigation/](/imagine/paging/navigation/) · [nav-stability 09-05](/framework/ai/2026-09-05/nav-stability/) | live, decided | keep | the owner's "persistent vs switching" question, answered with numbers |
| **nav** Fixed columns — a columns host whose widths never renegotiate | [/imagine/paging/navigation/columns/](/imagine/paging/navigation/columns/) | live | keep | fix a column at its floor, never its ceiling |
| **nav** Reserved height and reserved tabs (`visibility: hidden` holds the space) | [reserved](/imagine/paging/navigation/reserved/) · [tabs](/imagine/paging/navigation/tabs/) | live | keep | makes a changing panel read as stable |
| **nav** Full-screen page with a left rail that never moves | [/imagine/paging/navigation/screen/](/imagine/paging/navigation/screen/) | live | keep | deep sub-pages with no jump |
| **nav decided** Persistent vs swap, the same four slides both ways | [persist](/imagine/decks/persist/) · [swap](/imagine/decks/swap/) | live, decided | keep | "kinds that scale want swap, kinds that cap want the rail" |
| **nav** The paging realm — one configurable page, six words, config in the url | [/imagine/paging/](/imagine/paging/) · [paging-core](/framework/ai/2026-09-04/paging-core/) | live | keep | the deepest cross of page, layout and nav; its words are core/Page's own now |
| **decided** The paging decisions log — dozens of dated owner rulings | [/imagine/paging/doc/decisions.md](/imagine/paging/doc/decisions.md) | live | keep | the primary source; read before re-deciding anything in paging |
| Paging templates — 11 whole-page shapes, each on real machinery | [/imagine/paging/templates/](/imagine/paging/templates/) · [task](/framework/ai/2026-09-05/paging-templates/) | live | keep | the "templates, previews" the owner asked for |
| Paging Make — the three-pane page editor, drag to reorder and nest, saves to `page.json` | [/imagine/paging/make/](/imagine/paging/make/) · [page-cms](/framework/ai/2026-09-13/page-cms/) | live | keep | the only thing that saves a layout choice to a real page |
| **nav** core/Sidebar — the site's one persistent nav: a tree, resizable, footer pinned | [/framework/core/Sidebar/](/framework/core/Sidebar/) · [site-sidebar-tree](/framework/ai/2026-09-18/site-sidebar-tree/) | live | keep | rewritten onto `ux/Tree`; 6 callers still pass `pages:` not `root:` |
| **nav** core/Router — url to `page.child(name)`, writes the active classes | [/framework/core/Router/](/framework/core/Router/) | live | keep | `page.open_link()` is the hook a custom click must call |
| **nav** ext/tabs — `this.tabs()`, flush by default, `vertical` for a left rail | [/framework/ext/tabs/](/framework/ext/tabs/) | live, decided | keep | the switching half: swaps content in place; flush is the owner's default (09-06) |
| **nav** ext/Doc top tabs — a module page whose children are a left rail of tabs | [/framework/ext/Doc/](/framework/ext/Doc/) | live | keep | the owner's go-to "until we get a better one" |
| **nav** ext/drawer — one right rail per document that pushes the page | [/framework/ext/drawer/](/framework/ext/drawer/) · [page-drawer](/framework/ai/2026-09-28/page-drawer/) | live | keep | the second, contextual nav surface |
| ux/Tree — the lazy, adaptive tree the Sidebar walks | [/framework/ux/Tree/](/framework/ux/Tree/) | live | keep | the engine under the nav tree |
| Sections — 15 content bands inside one page (hero, pricing, faq) | [/framework/styles/sections/](/framework/styles/sections/) | live | keep | level 3 of this system; not the same as the sections lab |
| Sections design log — band vs measure, the registry, why helpers were deleted | [decisions.md](/framework/styles/sections/doc/decisions.md) | live | keep | answers "should sections be in layout" |
| Layout study — the three real page shells the site is built from | [/imagine/design/layout/](/imagine/design/layout/) | live | keep | the shell taxonomy, counted on a 20-page sample |
| **nav decided** Navigation study — nav moved up to 242px; one rule moves 0 | [/imagine/design/navigation/](/imagine/design/navigation/) · [/web/nav/doc/study/](/web/nav/doc/study/) | live, decided | keep | 9 mechanisms walked headless; `toc()` had 23 callers and never painted |
| ext/DesignTool — measures a layout: broken, off, good | [/framework/ext/DesignTool/](/framework/ext/DesignTool/) | live | keep | the layout audit tool the owner asked about — it exists |
| Page generator — a spec string becomes a real page tree | [core/Page/generator](/framework/core/Page/generator/) · [task](/framework/ai/2026-08-26/page-generator/) | live | keep | five behavior words: wall list prose tabs vtabs |
| core/Page/overview — one picture card per page building block | [core/Page/overview](/framework/core/Page/overview/) | live | keep | the largest set of page-layout examples |
| Nested or full — a child inside its parent, or taking the screen | [doc/layout.md](/framework/core/Page/doc/layout.md) | open question | keep | the owner has not ruled; read as evidence |
| Where each layout part lives — grid, columns, containers, padding | [doc/layout-overview.md](/framework/core/Page/doc/layout-overview.md) | live | keep | the class-side pointer page |
| **decided** One panel open at a time; `.bleed` in a column is flush | [column-pages-2](/framework/ai/2026-08-27/column-pages-2/) | decided | keep | multi-panel rejected: the Router follows one chain |
| **decided** "The layout never jumps" | the `layout` skill (owner, 2026-09-22) | decided | keep | new items wait behind an "N new" pill; a selection opens its own column |
| **decided** Router walks declared `children:`; the old Pager is dead code | `core/legacy/` | decided | keep | don't resurrect the Pager |
| page.jsonl — a page described by log lines, no `page.js` | [core/Page/jsonl](/framework/core/Page/jsonl/) · [page-jsonl](/framework/ai/2026-09-24/page-jsonl/) | live, core | keep | nothing monitors its size yet (480 files, largest 257 KB) |
| Explorer — every layout as one tree, siblings / picked / variants | [/layouts/explorer/](/layouts/explorer/) | live | reference | the owner's "right sidebar becomes the left" navigation idea |
| Practice — a workbench, a reader, a catalog, built big from approved layouts | [/layouts/practice/](/layouts/practice/) | live | reference | proves the approved five at 400 and 3440 with real content |
| **nav** Shell — a fixed resizable sidebar beside a tree of homepage designs | [/layouts/shell/](/layouts/shell/) | live | reference | the persistent-sidebar exemplar |
| Labs — six shape experiments | [/layouts/labs/](/layouts/labs/) | live | reference | moved from `/imagine/` on 2026-09-18 |
| **nav** Shells lab — 10 app-chrome layouts | [/layouts/labs/shells/](/layouts/labs/shells/) | live | reference | nav-shell shapes |
| **nav** Screens lab — what "next" does to a screen: replace, split, layer | [/layouts/labs/screens/](/layouts/labs/screens/) | live | reference | switching and future transitions |
| Sections lab — one band cut into 2, 3 or 4 columns, framed or flush | [/layouts/labs/sections/](/layouts/labs/sections/) | live | reference | page-division bands, level 2 |
| Blog lab — 8 blog shells at 3440 | [/layouts/labs/blogx/](/layouts/labs/blogx/) | live | reference | content-layout variations |
| Magazine lab — a magazine from column words only | [/layouts/labs/mag/](/layouts/labs/mag/) | live | reference | width-word composition: full → % → measure |
| Decks lab — 9 ways to cut a screen into regions | [/layouts/labs/decks/](/layouts/labs/decks/) | live | reference | region sizing, one level below page layout |
| styles/layouts — whole-page layouts as class strings | [/framework/styles/layouts/](/framework/styles/layouts/) | live | reference | includes the `.basis + .flex-1` sidebar |
| ext/layout — a toolbar and push-drawer to arrange a demo live | [/framework/ext/layout/](/framework/ext/layout/) | live | reference | a tool, not a layout; see [names](/framework/core/Page/layout/doc/names.md) |
| Floating page — `floating()`, an inner left sidebar | [core/Page/layout/floating](/framework/core/Page/layout/floating/) | live | reference | one of the named shapes |
| **nav** Sidebar variants a–d, rail, walkthrough | [/framework/core/Sidebar/variants/](/framework/core/Sidebar/variants/) | live demo | reference | what was tried before the current Sidebar |
| **nav** Tabs and vertical tabs demo cards | [overview/tabs](/framework/core/Page/overview/tabs/) · [overview/vtabs](/framework/core/Page/overview/vtabs/) | live demo | reference | small concrete tab examples |
| **nav** web/nav — eleven navigation pattern pages | [/web/nav/](/web/nav/) | live | reference | a guide layer over the framework |
| Paging's other blocks — stage, content, room, arrangement, skin | [/imagine/paging/](/imagine/paging/) | live | reference | content, room and arrangement cross with layout |
| Paging cross and library — every pairing of two words; 12 presets | [cross](/imagine/paging/cross/) · [library](/imagine/paging/library/) | live | reference | regression-checking a page-system change; the settings preset has the right rail |
| Paging critique and inventory — earlier self-reviews | [critique](/imagine/paging/critique/) · [inventory](/imagine/paging/inventory/) | live | reference | read before redoing an audit |
| Paging audit loop — 8 rounds to 6/6 | [paging-audit-8b](/framework/ai/2026-09-05/paging-audit-8b/) | landed | reference | "fill" is for a leaf; it claims a child's leftover too |
| Paging types — a type is words, not CSS | `public/framework/ai/audits/paging/types.json` | data | reference | relevant to the page generator |
| Design realm — screenshot studies: padding, scale, color, type, controls | [/imagine/design/](/imagine/design/) | live | reference | built from one full-site crawl (2026-09-01) |
| DesignTool knowledge — what the tool learned, false positives included | [/framework/ext/DesignTool/knowledge/](/framework/ext/DesignTool/knowledge/) | live | reference | prior layout-audit writeups |
| **nav** `related:` aside — an auto-updating link list | [related-sidebar](/framework/ai/2026-09-18/related-sidebar/) | live | reference | two adjacent bracket groups in `grid-template-columns` drop the rule in Chromium |
| **nav** Card previews across pages — import cost, click ownership | [preview-nav](/framework/ai/2026-08-29/preview-nav/) · [/imagine/gallery/](/imagine/gallery/) | live | reference | how one page shows another's card |
| Gallery — cards built from other pages' `page.js`, previewed by path | [/imagine/gallery/](/imagine/gallery/) | live | reference | an index of things that are not real children |
| Generated — page trees exported from the generator | [/imagine/generated/](/imagine/generated/) | live | reference | `page.js` is rewritten on re-export |
| Team — a kanban with `page.store()` lane state | [/imagine/team/](/imagine/team/) | live | reference | persistent side selection + following board |
| Scenes — a 3D pager where the page tree is the scene graph | [/imagine/scenes/](/imagine/scenes/) | live | reference | navigation with side effects |
| Vary — four trees of column-page variations | [/imagine/vary/](/imagine/vary/) | live | reference | earlier column-page exploration |
| Page docs overhaul — Overview is a `browse()` wall | [page-docs-restructure](/framework/ai/2026-08-19/page-docs-restructure/) | shipped | reference | demos mark `.default`, never `.active-page` |
| `browse()` bands — no band under six | `core/Page/page.js` | live | reference | a band of two stretches its cards over the whole wall |
| Websites corpus — 47 real sites | [/websites/](/websites/) | paused | reference | external browsing paused |
| Platform program — nine graded topics → decisions → MVP | [/imagine/platform/](/imagine/platform/) | in progress | reference | check its decisions before re-deciding nav or layout |
| Playground — the old layout lab | `ai/2026-08-19/playground-*` | **gone** | drop | `ext/Playground` no longer exists; its ideas live in DesignTool and paging |
| Right nav — a persistent right tree beside a swapping centre | `/imagine/paging/rightnav/` → [library/settings](/imagine/paging/library/settings/) | folded in | drop | now a preset in the paging library |
| `/imagine/layouts/` — the old numbered lab | [/imagine/layouts/](/imagine/layouts/) | redirect | drop | rewrites to `/framework/core/Layout/<name>/` |
| `/imagine/shells/`, `/screens/`, `/sections/`, `/blogx/`, `/mag/`, `/decks/` index | `/imagine/…` | redirect stubs | drop | the real pages are under `/layouts/labs/` |
| `/imagine/design/layout/approved/` | old location | redirect stub | drop | now `/layouts/doc/studies/approved/` |
| core/Page/old — the first Page docs | [core/Page/old](/framework/core/Page/old/) | kept as reference | drop eventually | overview/ replaces it |
| Page columns, first scout; Miller-columns demo | [page-columns](/framework/ai/2026-08-18/page-columns/) | superseded | drop | now inside the shipped column system |
| **nav** Blank rail link on first click | [nav-rerender](/framework/ai/2026-09-22/nav-rerender/) | fixed | drop | a second try one rAF later, if it happens again |
| **nav** Dead top nav deleted; `ext/toc` re-enabled on 8 pages | [dead-nav](/framework/ai/2026-09-18/dead-nav/) | landed | drop | closed |
| **nav** Sidebar row pitch and icons | [sidebar-repair](/framework/ai/2026-09-19/sidebar-repair/) | landed | drop | the square-icon frame is still not `.icon`'s default |
| Feeds, stream, importance, CMS, review, game realms | `/imagine/…` | live | drop | real column work, not about layout decisions |
