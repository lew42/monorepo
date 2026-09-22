# Make — the record: one selection, one filtered sidebar, and the tree handed to `ux/Tree`

Everything below was decided on **2026-09-18**, in the task at
[`/framework/ai/2026-09-17/editor-select/`](/framework/ai/2026-09-17/editor-select/). The
owner's sentence that started it, 2026-09-17:

> Look at the playground and panel exts. They were an attempt to make an editor… The problem
> is neither the panel nor playground system did a great job manipulating the elements in a
> simple intuitive way. The number of controls in the toolbar became way too many. Maybe we
> put everything in the right sidebar, and only have a selection scheme?

## The one number

**A control that is not about the thing you have selected is not on screen.** Counted live at
1600, as every visible `button` / `input` / `select` / `textarea` / `[role=button]` in the
right pane:

| what you are editing | before | after |
|---|---:|---:|
| a page with no blocks | 15 | **13** |
| a page with three blocks | 27 | **13** |
| one block | 27 — every control was always on screen | **5** |
| one run of text | not possible at all | **8** |
| nothing | not possible at all | **0**, and one sentence |

The page's own row set barely moved, and that is the honest result: a page's title, its
description, its icon and the realm's seven words really are all about the page. What left is
everything that was about something *else* — the blocks. Before, changing one word of one
paragraph meant reading past 27 controls; now it means reading 5.

## 1 · Selection: three kinds, one ring, one badge

Click anything in the middle and it gets **one outline and one name badge** — "page · Notes",
"block · prose", "element · h2". `select.js` is the whole of it, and `page.js` holds two
fields that are deliberately not the same thing:

- **`picked`** — which page the middle is drawing. It always has one.
- **`sel`** — what is selected inside that page, or `null` for nothing.

**Chosen:** reuse `ext/Panel`'s `panel-focus` contract — a document event carrying the target
or `null` — and `ext/Panel`'s focus ring, now `.panel-ring` in `ext/Panel/focus.css`.
**Rejected:** a `paging-make-focus` event and a ring of Make's own. Two editors on one site
would then have two slightly different ideas of what "selected" looks like, and the second one
always drifts. Sharing cost two guards in ext/Panel (`tools.js`, `focus.js`) for a `detail`
that has no `root()`, written where they are.

**A run needs two clicks**, and that is `ext/Panel`'s own `drill()` idea: the first click in a
block selects the *block*, the next one inside it goes in. Without it a prose block could never
be selected at all — its own paragraphs cover it edge to edge.

**Escape clears, and so does clicking off** anything that is not one of the three panes —
`ext/Panel`'s `OFF` rule, capture phase, for the reason that module records: a control that
redraws its own pane has detached the clicked button by the time a bubbling listener runs.

**A click on a link or a button inside the drawn page is left alone.** The page in the middle
is a real page; using it is not editing it.

## 2 · The sidebar shows the selected thing and nothing else

| selected | rows |
|---|---|
| a page | title · description · icon · the realm's seven words as the one labelled bar · content · delete |
| a block | kind · its own one or two words · where it sits |
| an element | tone · size · align |
| nothing | one sentence naming the three things you can click |

**"Add a block" is ONE button, not three.** It adds a paragraph and selects it; the block's own
first row is the three kinds, so making it a card wall is one more click, in the place the block
is. **Rejected:** keeping Prose / Card wall / Template side by side in the page's pane — three
controls for a choice you can make afterwards, on a pane that is supposed to be about the page.

**The bar's "Code" button is dropped and only that** (`MakeToolbar extends PagingToolbar`,
`settings.js`). The "More" button beside it opens the same drawer, with the code in it. Two
doors to one room on a 26rem rail is one door too many. Every other method of `PagingToolbar`
is untouched, which is what a subclass is for.

**Delete asks, in the sidebar, and there is one question.** The `×` on a tree row *selects*
that page and opens the same question rather than carrying a second one of its own — so the
one control whose job is to say what it is about to destroy exists once.
**Rejected:** the row turning into its own question, which is what Make did before. `ux/Tree`
has no such shape, and duplicating the question is how the two drift.

## 3 · An element's three words

A run can say three things about itself: **tone** (plain / muted), **size** (small / regular /
large) and **align** (left / centre / right). They are stored on the block that holds the run,
under `runs`, keyed by the run's position:

```json
{ "type": "prose", "text": "…", "runs": { "0": { "size": "large" } } }
```

`select.js`'s `dress()` turns them into classes, and it runs on **both** drawings — Make's
middle pane and the page at its own url — because both are built in `make/page.js`. So a word
you set in the editor is on the real page too.

**Rejected:** rewriting the markdown to carry the class (`<p class="muted">…</p>`). It needs no
applier at all and the printed `page.js` would be exactly right — but the source stops being
markdown, and a heading loses its `##`. These files are meant to be hand-edited.

Two things this costs, both real:

- **A `page.json` read by some OTHER reader shows the run undressed.** `?nest=` goes through
  core's `Page.from()`, which does not pass through `make/page.js`. The page still renders; the
  three words are simply not applied.
- **The Code tab's printed `page.js` does not carry them** — `code_for_node()` prints
  `md(text)`, and it lives in `build/words.js`, outside this task's fence.

**`zoom`, not `font-size`, and `@layer util`, not `theme`** — two separate measured fixes:

- `font-size: 1.3em` does not make a run *larger*; it *replaces* its size with 1.3 × its
  parent's, so "large" on an h2 shrank it from 34.9px to 20.2px. `zoom` scales the box the
  element already is. It is the same call `ext/Panel/tools.js` records for its magnifier.
- The skin styles every heading from `.theme-lew42 :is(h2, .h2)` at (0,2,0) inside
  `@layer theme`, so a single-class rule on an h2 loses — and loses **silently**: the class
  landed, the button lit, the heading did not move a pixel. A utility sits in `util`, which
  beats `theme` by layer order whatever the specificity.

`tone` uses framework.css's own `.muted`; the other four are `paging-make-run-*` in `make.css`,
because this site has no type-size and no text-align utility. A site-wide `.center` is a
proposal for whoever owns the framework, not a side effect of an editor task.

## 4 · The tree is `ux/Tree`

`tree.js` went from **343 lines to 233** and gained folding and a full keyboard. What it had —
rows, the grip, the three-target drop (edge / middle / edge), the descendant guard, the indent
— is `ux/Tree`'s now, and it was built *from* this file in the first place (`ux/Tree`'s own
record, 2026-09-17: "Make's model, lifted here so there is one of it"). Handing it back is the
whole change. What Make still owns is the only thing that was ever Make's: what a move, a star,
a `+` and a `×` *mean* to the pages on disk.

**Folding survives a redraw.** Every keystroke in the Title field rebuilds the left pane, and a
tree that re-opened every branch you had folded on every letter you typed would be worse than
one that could not fold. The set of folded rows is Make's (`page.shut`) and is handed in; the
Tree is thrown away and rebuilt, so it cannot be the one remembering.

**The Panel playground's document rail is a second group in this tree.** Its rows are links out
to `/framework/ext/Panel/playground/<name>/`, and `documents.js` is imported lazily because it
pulls the whole panel machine down with it.

## 5 · What `ext/Panel` lost

Its floating bar, entirely — `toolbar.js` deleted, `toolbar.css` renamed `controls.css`. The
record is [`/framework/ext/Panel/doc/decisions.md`](/framework/ext/Panel/doc/decisions.md).

## Layout — the five questions, unchanged

1. **Container** — the realm's middle (`.paging-app-centre`), a page grid; the screen claims `wide`.
2. **Size** — three tracks: the tree `min(24%, 26rem)`, the settings `min(30%, 30rem)`, the live
   page taking everything left. Under 54rem of *screen* width they stack, tree · page · settings.
3. **Own layout** — every pane a `flex v gap` stack, tool rhythm (`--gap`), no `--measure` cap.
4. **Regions** — one, core's. The pages you make are real children of this page.
5. **Preview** — core's default card.

Nothing about the three panes changed in this pass; what changed is what is *in* the right one.

## Open

- The paging hub's Make card is unchanged: its line ("One screen for making pages: the tree, the
  page itself, and everything it says") is still exactly true, and the hub is outside this task's
  fence in any case.
- `code_for_node()` in `build/words.js` could print the run words. It is outside the fence.
- Blocks are still not draggable, which is the decision the file already recorded: a block list
  is two or three items in a 26rem column, where a grip and a drop target would be more
  machinery than the thing it moves. The page *tree* is the other story, and it is dragged.

---

# Real pages — dragging one moves its directory on disk

Decided on **2026-09-18**, in the task at
[`/framework/ai/2026-09-18/real-page-move/`](/framework/ai/2026-09-18/real-page-move/). The
owner's sentence that started it, 2026-09-17:

> Pages could be actual sub dir with sub page.js files, or could by dynamic, stored anywhere.
> However, we want to maintain file system simplicity when possible (portability of the dir,
> for example). Real pages could actually move the dir on the file system, when dragged and
> dropped?

They can, and now they do. Open Make with `?real=<url>`, drag a row in the **Real pages**
group onto another, say Move, and the directory is renamed on disk — one `fs.rename`, plus one
rewritten line in each of the two `page.js` files that name it.

## 1 · What a real page is, and why it is a second group rather than the same one

A **made** page is a `page.json` Make wrote and Make owns end to end: every field in it is a
control in the right pane. A **real** page is a directory somebody wrote a `page.js` in — the
shape every page on this site has. Make can move one. It cannot edit one, and pretending
otherwise would mean a sidebar full of controls that write nothing.

**Chosen:** a separate group in the left pane, `Tree.from(real_root)` over the real page, with
its own right-pane text that says what the screen can and cannot do with it.
**Rejected:** one merged tree. The two kinds of page answer different gestures, and a tree
where half the rows take an edit and half do not is a tree you have to remember the rules of.

## 2 · Why the rewrite only touches a plain string `children:`

A page names its children the way this whole site does:

```js
export default new Page({ meta: import.meta, title: "Alpha", children: "beta gamma" });
```

A move rewrites exactly that — the name out of one file's string, into the other's, at the
index you dropped it. `children: [...]`, `children: {…}` and `children(){…}` are all legal and
all mean something a text edit cannot safely express (a POJO declares by *title*; a function is
a data source that may not even mention the name). So a drop onto one of those **refuses,
names the file and what it found, and moves nothing** — checked before `rpc:move` runs, so the
disk is never left half-changed.

**Rejected:** parsing the module properly. There is no parser here and adding one is a
dependency; and a rewriter that can edit any declaration can also destroy any declaration.

**A list that goes empty loses the whole line** rather than becoming `children: ""`. Core's
`declare("")` splits an empty string into `[""]` and declares a child with no name, which then
shows up as a blank row in every nav that page has. The one-line fix is `.filter(Boolean)` on
that split in `core/Page/Page.class.js`; core was outside this task's fence, so this side works
around it instead. **Open, for whoever owns core.**

Symmetrically, a parent with **no** `children:` line gets one written after its `title:`, in
whichever form the title is in.

## 3 · Undo: one step, one minute, no history

`rpc:move` answers with the reverse move already worked out — `{ from: to, to: from }` — so an
undo is the same commit run backwards, with nothing to remember. The sidebar offers it for one
minute and then forgets; an undo offers no redo.

**Chosen** because the move is *already* confirmed before it happens: the question in the
sidebar is the safety net, and the minute is for the second thought. **Rejected:** a move
history. It would have to survive a reload to be worth anything, which means persisting a
journal of file operations whose world can change under it — the directory gets moved again
in an editor, the branch changes — and an undo that replays a stale journal is worse than no
undo at all.

## 4 · The alternative, and when it wins

Nothing in a real page's source needs rewriting if the parent reads its children from **data**:

```js
// page.js — nothing here ever changes
export default new Page({ meta: import.meta, title: "Alpha",
	children(){ return fetch("./tree.json").then(r => r.json()); } });
```

`children` may be a function returning a promise (`core/Page/doc/data-children.md`), so a
`tree.json` beside the page can name and order the children, and a move becomes one JSON write
plus the `fs.rename` — no source parsing, no refusals, any shape of tree.

**It wins when the ordering changes often, or by machine**, and when the pages are content
rather than code — a CMS, exactly what `made/` already is. **It loses what this task was for:**
the directory stops being portable on its own. Copy it somewhere else and its `tree.json` is
still pointing at the old arrangement, and reading a `page.js` no longer tells you what is
under that page. The owner asked for filesystem simplicity and directory portability; that is
the source-rewriting answer, and this is it.

## 5 · Two `ux/Tree` defects — fixed at the source, 2026-09-18

Both found by driving the real gesture, both first worked around in `real.js` because `ux/Tree`
was outside this task's own fence. `tree-fixes` (`ai/2026-09-18/tree-fixes/`) fixed both inside
`ux/Tree` itself and removed both guards here — **no longer open.**

- **A drop was followed by a click.** The pointer goes down on the grip and up on the row, so
  the browser fires `click` on the row *after* `release()` has reported the move — and a row's
  click handler is "select me". Every drop landed correctly, highlighted its target, and then
  replaced the confirm question with the selected-page pane. Make's own page tree never saw it
  because a move there already picks the moved page. **Fixed:** `Tree.Drag.release()` now
  swallows the click that follows a drop (a capturing listener on the tree's own root, removed
  the next tick either way) — `real.js`'s `move()`/`selected_change()` timing guard is deleted,
  dead now that the click never reaches `select()` at all.
- **An unopened branch counted as zero children.** `Tree.Drag.commit()` read `into.children` to
  say "as its last child", and a branch nobody had opened still held a *function* there — so a
  drop into a folded page landed first among its children instead of last. **Fixed:** every node
  `Tree.node_of()` builds now carries `count` — the live Page's real child count, known
  synchronously whether the branch has ever been opened or not — and `commit()` reads it when
  there is no loaded array to count instead. `plan_for()`'s own guess at "last" is deleted;
  `index` arrives already correct.

`Tree.node_of()` also gives every row an `href`, which is right for a navigation tree and wrong
for an editor: a click would leave the screen. The subclass drops it; the url rides on
`node.page`.

---

# Real pages — a move rewrites the links and imports too

Decided on **2026-09-18**, in the task at
[`/framework/ai/2026-09-18/link-tracking/`](/framework/ai/2026-09-18/link-tracking/). The
owner's words that started it, 2026-09-18:

> the path would break if we drag and drop a page from one place to another. Maybe we need an
> import tracking system so that for any page we track where that page is imported, so that
> when you drag and drop it, the AI or some node function can automatically update all the
> import paths so things don't break.

`rpc:move` already renamed the directory and rewrote the two `children:` lines (the section
above). It did not touch anything ELSE that pointed at the moved page — a `<a>`, a markdown
link, a `url:` field in a nav list, or another module's `import … from "…"`. Yesterday's Move 3
fixed ~400 of those by hand, counted with `rg`. This is the automatic version.

## 1 · The census lives in `core/Page`, not beside `importance.mjs`

[`core/Page/tools/links.mjs`](/framework/core/Page/tools/links.mjs) walks `public/` once and
writes `public/links.json` — for every page url, every file that links to it or imports a
file inside it, as `"file:line"`. **Chosen: `core/Page/tools/`,** a new sibling to
`generator/` — this is a **core/Page** concern (it walks every page, real or made) and
`Server/plugins/SocketServer/Runtime.js` imports it directly, both plain Node. **Rejected:
beside `importance.mjs`** — that file is `imagine/importance`'s own feature, and never runs
outside it.

Four literal shapes count, exactly what the owner asked for: `href="/x/"`, a markdown
`](/x/)`, `url: "/x/"`, and `import … from "/x/…"` (plus a bare `import "/x/…"` and a dynamic
`import("/x/…")`). **Left out, on purpose: a relative import** (`"../sibling.js"`) — a static
text search cannot resolve one without also knowing the importing file's own location, and a
directory that moves as a WHOLE keeps its own internal relative imports working regardless;
only one reaching OUTSIDE the moved directory, at a depth that changes, could break, and nothing
in this repo does that today. Measured on this repo (2026-09-18): 2,371 files scanned, 641
pages found (630 real + 12 made), 2,346 links + 1,060 imports recorded, **0.45 seconds**.

**For a MADE page, the same data is also written into its own `page.json`, under
`linked_from`** — the owner's own words: "put that kind of meta tracking data in the
page.json." Never invented for a real page, which has no `page.json` to hold it. Idempotent:
a second run with nothing changed writes nothing (verified by hand — a throwaway made page +
a referencing file, census, checked the `linked_from` it got, deleted both, census again, back
to the exact byte count as before).

## 2 · The rewrite runs INSIDE `rpc:move`, before the rename

`Runtime.js`'s `move()` calls `rewrite_links(from, to)` **before** `fs.renameSync`. **Chosen**
because the census was captured against the OLD tree, so `from` is still a page url it
recognizes — a file inside the page being moved that links to one of its own siblings by
absolute path gets fixed while it is still readable at the path the census recorded, and the
fix travels along a moment later when the directory physically moves.
**Rejected: rewrite after the rename** — by then `from` is no longer a known page url (the
page now answers as `to`), so a self-referencing file's old text would go unmatched and
unfixed, silently. `rewrite_links()` calls `ensure_fresh()` first, which only re-walks the
whole site if `links.json` is older than the newest `page.js` — cheap (§1's 0.45s) and correct
after every move, because a move always rewrites at least the two parents' `page.js` files,
which is what makes the NEXT move's staleness check true.

## 3 · Two bugs the proof itself caught

**Self-clobber, found and fixed.** `commit()` (`real.js`) used to read both parents' `page.js`
BEFORE calling `rpc:move`, then write that SAME pre-move text back in step 3 after adding the
`children:` line. A parent very often links to its own child in its content — the proof's
`alpha` links to `beta` — so `rpc:move`'s link rewrite landed inside `alpha/page.js`, and
step 3's write silently erased it one line later: the server answered "2 links … rewritten"
while `rg` still found one of the two links pointing at the OLD url. **Fixed** by re-reading
both sources AFTER `rpc:move` returns and writing THAT text; `with_children()` finds the
`children:` line fresh in whatever text it is given, so the re-read costs one more `fetch` and
changes nothing else about the format check, which still runs on the original early copy (so a
refusal still costs nothing).

**A stray `,` on undo, found and fixed — pre-existing, not this task's own change.**
`removed()`'s cleanup regexes assumed a removed declaration always leaves REAL content behind
or nothing at all; on a page whose `title:` sits mid-line (no line of its own), undoing an
insert left a line holding only a leading space and a lone comma, which `rest.trim()` read as
"real content" and kept — `alpha/page.js` came back with a stray `` ,`` line after undo.
**Fixed:** a line whose only non-whitespace is one or more commas is now treated as empty too.

## 4 · What the confirm row says, and what the answer carries

The confirm row grows one clause when there is anything to say: "…, and N links in M files are
rewritten." It is a **preview** — a client-side `fetch("/links.json")`, cached on the page and
forgotten after every move so the next preview is not yesterday's count — because the
CERTAIN number is the one `rpc:move` itself answers with (`links: { count, files }`), shown
after the fact in the undo row: "N links in M files were rewritten too." A same-parent reorder
never calls `rpc:move` at all, so it never shows either sentence — nothing about any url
changed, so there is nothing to rewrite.

**Undo reverses them, and it does not need its own code to do it.** Undo is `commit()` called
again with `from`/`to` swapped (§3 in the section above) — the same `rpc:move`, which freshens
the census (now against the POST-move tree, where the moved page currently answers as the new
url) and rewrites the same files back. Proved with `md5sum` on all three touched files:
byte-identical to the pre-move originals after drag → confirm → Move → Undo, driven headless
end to end.

## 5 · Proof

Scratch tree `/imagine/paging/made-real2/` (deleted at landing): a root and two real
children, `alpha` and `beta`; `alpha`'s content links to `beta`; a fourth file,
`importer.mjs`, imports `beta` by absolute path — one link, one import, in two files. Dragging
`beta` onto `alpha` in Make, driven headless:

| check | number |
|---|---|
| census, before the move | **2** references (1 link + 1 import) in **2** files |
| `rpc:move`'s own answer | **2** links in **2** files rewritten |
| `rg` after the move | **0** occurrences of the old url, **2** of the new, same two files |

All three agree. Undo restored the tree byte-for-byte (checksums, not just the on-screen text).

## Open

- Only a REAL page moves today (`?real=`); a MADE page has no move gesture yet, so
  `rewrite_links()` has never run against one in anger. The function does not care which kind
  moved — it only reads `links.json` and rewrites text — so wiring a made-page move through
  the same `rpc:move` is expected to need nothing new here, for whoever builds that gesture.
- A relative import that reaches outside the moved directory (§1) is a known gap; nothing in
  this repo does that today, so it was left rather than built for.


## Two files per page, and a made page is a core page (2026-09-18)

**The snapshot and the history.** Every page you make now keeps `page.jsonl` beside its
`page.json`: the snapshot is what everything reads, the log is what it cannot tell you —
what changed, when, and in what order. The right pane replays the log from nothing and says
whether it lands on the file beside it, which is the check the pair exists for.

The line shape is `/imagine/cms/json/`s contract to the character — `{at, op, path, value}`,
ops `set` `del` `append`. **The code is a copy, not an import.** Importing it would make this
realm depend on another realm experiment for its own file format; the contract is the half
worth sharing, and if a third page ever wants it, that is when it earns a home of its own.

Two rules that are not obvious:

- **The history is written BEFORE the snapshot.** A machine that dies between them leaves a
  log one edit ahead, which replays onto the snapshot. The other order leaves a snapshot with
  no line explaining it.
- **A page with no log yet gets its whole self as line one.** Every page that existed before
  this feature has a snapshot and no history, and a log that began halfway through a page life
  could never replay onto it — the check would call a good page broken.

**A made page is a core page carrying its own file.** `grow()` hands core `data: file_of(node)`
and copies nothing: the title, the icon and the description are read off the FILE by core own
reader. One function now answers three questions that were answered separately — what gets
written, what the drawer prints, and what the live page says about itself.

Two things core must deliberately NOT read off that file, and both are because **Make urls are
not its file paths** (`make/notes/` is the page, `made/notes/page.json` is the file):

- **the six page words** — this realm draws them through its own Stage, so letting core stamp
  them as well would put a second frame around every made page. `MadePage.props()` answers
  with the three labels and nothing else.
- **the children** — a name in a `page.json` resolves against that file own directory, so
  `MadePage.read_data()` answers with none and `grow()` builds them from the tree in memory.

**What was rejected:** deleting Make `children()` seam outright and letting core `page.json`
rung resolve made pages. It would move all nine made urls under `made/`, and those urls are
part of the standing 18-url proof. The same file opened at its FILE url IS an ordinary core
page today — [/imagine/paging/made/notes/](/imagine/paging/made/notes/) — so there are two
readers and one file, which is the merge that was actually available.

Task: `ai/2026-09-18/page-json-core/`. The core half:
[`core/Page/doc/data.md`](/framework/core/Page/doc/data.md).
