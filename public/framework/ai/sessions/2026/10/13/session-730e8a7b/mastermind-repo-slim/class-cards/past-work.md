<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Class card views  a class is one icon card  its members are unboxed icon items  own methods first  the core API on top" (words: clas, card, view, one, icon, member, unboxed, item, own, method, first, core, api, top)

## Tasks (8, best first)
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-13 [Catalog: 228 page previews (33 new) and 55 class cards on one page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/catalog/) — /framework/catalog/ shows every page with a UI as a preview card, 33 marked NEW, and 55 class cards; committed c016e9e1a on michael/dev. Landed by the mastermind from the agent's own answer and the merge commit (the agent ended its turn without a landing line… · paths 1/1 exist
- 2026-10-12 [Owner inbox: one owner_note path pinned to the top](/framework/ai/sessions/2026/10/12/session-d2fd8fab/owner-inbox/) — owner_note landed. Agents now tell the owner through one tool; the note sits first in the AI Inbox until the owner opens it. note reaches the owner and stays: score 100, no decay, first row; headless at 400/1200/1920/3440, no errors ([STATE.md](/framework/ai/…
- 2026-10-12 [Page AI API: one tool writes pages, cards and subpages](/framework/ai/sessions/2026/10/12/session-cb7ffa45/page-ai-api/) — Agents now build pages with one tool, page_set, and a fresh Haiku did it first try. Model and table: [ai-api.md](/framework/core/Page/doc/ai-api.md). model + "to do X, send delta Z" table, linked from the core/Page and Servex agents readmes fewest tools: page…
- 2026-10-03 [Ref row: always dark, header-only link, body nested inside the card](/framework/ai/sessions/2026/10/03/list-events/ref-row-context-card/) — Landed: a ref row is now the inline #Page chip upgraded to a full-width card, per the owner's correction. whole row always dark (class-card look), never conditional on entry.class_card header links (icon+name chip, same as an inline mention); body does not li…
- 2026-10-03 [core/Item: a field colliding with a method now throws, not silently s…](/framework/ai/sessions/2026/10/03/list-events/field-collision-throw/) — Fields are code-only; a collision throws — [Item](/framework/core/Item/) static fields stays code-only — nothing at runtime adds an accessor (already true; confirmed by reading apply()/set_one()) a name check walks the WHOLE prototype chain (methods, accessor… · paths 3/3 exist
- 2026-10-03 [Content rows: a row can BE a page reference, drawn as its dark class …](/framework/ai/sessions/2026/10/03/list-events/ref-content-rows/) — Landed: a content row with ref draws as that page's own dark class card (#Mention's exact look, reused), linking to it, with the row's own text under it. the look + link: proven live on the Now card's new "Page" row text under the card: same row, same screens… · paths 1/1 exist
- 2026-10-02 [Framework home: sections from the sidebar's own tree, dark class card…](/framework/ai/sessions/2026/10/02/framework-home/) — Landed. /framework/ is a wall of sections, one per sidebar group, read from the sidebar's own tree. Classes get dark cards, columns balance by height, old page kept at /framework/old/. back up the old page — [/framework/old/](/framework/old/) sections in side… · paths 4/4 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 38 files
- [core/View](/framework/core/View/) — used by 299 files
- [ext/Classify](/framework/ext/Classify/) — used by 1 files
- [ext/Dropdown](/framework/ext/Dropdown/) — used by 5 files
- [ext/markdown](/framework/ext/markdown/) — used by 55 files
- [ui/card](/framework/ui/card/) — used by 23 files

## Docs and readmes
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/readme.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [Page overview — the palette: one card per building block, a…](/framework/core/Page/overview/readme.md) — Four bands, declared as BANDS in [page.js](../page.js) — the source of truth for what's on the wall and in what order. The first band is th…
- [Doc — a module documented as a page (Overview · API · Docs …](/framework/ext/Doc/readme.md) — ## Index [overview](./overview/) — the urls the Overview tab uses ## Use js export default new Doc({ meta: import.meta, title: "View", subj…
- [API — every method and property](/framework/core/Page/doc/api.md) — One page per member. The list is the same one page.js declares in methods: and properties:, in the order a reader meets them. ## Methods - …
- [Old — the first Page docs, moved out of the Overview tab an…](/framework/core/Page/old/readme.md) — ## Index [intro](./intro/), [nav](./nav/), [children](./children/), [previews](./previews/), [shell](./shell/), [flow](./flow/) — the six o…
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — When to reach for which: a List when something is ordered and needs watching (events are built in — there's no event-less variant any more)…
- [Item, List, Page: the class block](/framework/core/Page/doc/class-block.md) — This is one code block of the three classes, read from the source on 2026-10-15 (core/Item/Item.js, core/List/List.js, core/Page/Page.class…

## Sessions tagged with these words
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Live today voice feed](/framework/ai/sessions/2026/10/15/session-8f02ad12/) — kind/owner model/sonnet task/live-today page/live-cards · $1.20
- 2026/10/15 [Live-post helper agent](/framework/ai/sessions/2026/10/15/session-8853d8d6/) — kind/owner model/sonnet task/live-post page/live-cards · $0.98

## Owner asks
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, building)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Logs: unknown verbs on AI 2; the validator checks the schema; register experiment and rev… (mastermind-servex (10 PM task, item 12), queued)

## Commits
- 906777d43 catalog: a class card with no page of its own links its parent, not a 404
- 33068996e catalog: featured Refine card shows its page description; instance-tree: demo buttons never wrap their words
- c016e9e1a Catalog: every page with a demo as a live preview card, class cards, instance-tree verdict
- c054aba8e Page.class.js split 4/4: previews/walls move to Previews.js (PagePreviews), facades stay
- e9afc09d8 ai/v/3: prompts.js -> class Prompts (stream, base, view, board_cards); importers updated
- 9d840e80f ai: Session class card with live debug tree beside the rendered view
- 6584587e9 docs: show the class (class card + live debug view); refine vision addendum 2 (clarity, weight, alternates, n…
- 46883a909 ux/Card: fix the content()/content-List name collision; review fixes

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,762 tokens of reading, under the 100k limit).

Question: Class card views: a class is one icon card, its members are unboxed icon items, own methods first, the core API on top

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Class card views: a class is one icon card, its members are unboxed icon items, own methods first, the core API on top"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
