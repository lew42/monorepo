# ai2-nested — preview → detail → sub-cards in the next column; per-card storage; the deferred AI 2 items

Minion: Sonnet, effort high (budget mode). Session id: minted at dispatch (tomorrow, 2026-09-23,
first thing — NOT tonight). You will be IN A WORKTREE. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then
`public/framework/ai2/readme.md` + `doc/`, `ai/2026-09-22/ai2-master-detail/task.jsonl` (both
landings), decision `card-storage` in `ai/2026-09-22/mastermind-servex/task.jsonl`, and
`core/Page`'s columns (`ai/2026-08-26/` column pages, `/imagine/paging/` — the owner remembers
those experiments and wants their lessons, not a new mechanism). Load `layout`, `css`, `code`,
`ui-test`, `new-page`.

## The owner's words (2026-09-22 19:58, verbatim excerpts)

> The card detail page has a footer "talk to this card" — way taller than it needs to be, grey
> background that abruptly stops with a border on top; it should be flush or bordered properly.
> We have two scrollbars (the framework page forces overflow-y scroll) — not urgent. We need to
> practice the sub-card routine. Remember /imagine/paging — how columns fill the space, split
> evenly or resizable, how many columns versus how much space; it gets tricky. Generally split
> the remaining area in two: the preview column resizable, the detail page taking the rest, with
> a measure; the sub-items within that card open to the right of it. Two columns for now,
> potentially three if there's space. Digging down and moving back up is important. The preview
> is just the title and a small status line; the detail is more of a full page with a table of
> contents or sub-cards, each a task or whatever. As I transcribe in real time those
> transcriptions turn into little UI widgets that can be clicked on and opened in a new column.

## Deliverables

1. **Storage first (decision `card-storage`).** `ai/board.jsonl` stays the index (one line per
   card: id, slug, title, icon, status, author, at). A card's events — its `prompt`s (talked
   into it), `refined`, `reply`, `name`, `task`, `proposal`, `flag`, `archive` — go to
   `ai/cards/<slug>.jsonl`, written ONLY through Servex's `Log` (`POST /log/cards/<slug>` — add
   the sub-path to `Log.js`/`Servex.js`, Edit, one route), created on the card's second event.
   Migrate today's data with a script (`Servex/proof/migrate-cards.mjs`): fold `board.jsonl`
   + Servex's prompts log by card id → per-card files; the index keeps only the index fields;
   two counts that must agree (events in, events out); the old files are left untouched (the
   script writes beside them, and AI 2 switches its reader; nothing deleted). The slug is the
   assistant's locked name, kebab-case, unique.
2. **Columns: preview → detail → sub-card.** The rail (resizable, `ext/grip`) + the detail
   column (`--measure` wide, the rest of the space) + a third column that opens to the right
   when a sub-card is clicked, and closes when the detail is clicked again (dig down, move
   back up; the URL carries the path `/framework/ai2/<slug>/<sub>/`). Use `core/Page`'s
   columns mechanism where it fits (say in a `decision` what you reused and what it lacked).
   At 400 each level is its own screen with a back link.
3. **Sub-cards.** On a card's detail page: a table of contents of its sub-cards — every
   `task`, `proposal`, `refined` section and each transcript paragraph is a sub-card row
   (title + status line); clicking opens it in the third column with its own transcript
   footer (talk into the sub-card: `re: <slug>/<sub>`).
4. **The footer and the two scrollbars.** The "talk to this card" footer is one control
   height + one rung of padding, its ground either flush with the page or separated by a
   consistent hairline on all sides — measure it; the double scrollbar (the page shell's
   `overflow-y: scroll` plus the column's own) becomes one: the columns scroll, the page does
   not.
5. **The deferred items from `ai2-master-detail`**: 7 (pinned medium topics by event count),
   13 (the dark session card), 14 (views: inbox · sessions · days · notes · archived), 16
   (promote ↑), 20 (sections as `re` targets — now sub-cards). Do 14 and 13 first; 7 and 16
   if the budget the mastermind gives you allows.
6. **Proof (ui-test), on your worktree server:** the migration counts; rail → detail → sub
   → back at 1280 and 400 with the URL at each step; a sentence talked into a sub-card lands
   in `ai/cards/<slug>.jsonl` with `re: <slug>/<sub>`; the footer and scrollbar measurements;
   nothing above the fold moves when a sub-card opens (measure the detail's top). Land by copy
   of `ai2/` + the two Servex edits by `git apply --3way`, hold `--paths`, seconds.

## Fence

`public/framework/ai2/**`, `Servex/Log.js` + `Servex/Servex.js` (the cards sub-path only,
Edit), `Servex/proof/migrate-cards.mjs` (new), `ai/cards/**` (new), your task dir,
`ai/2026-09-23/page.js` `children:` (the day page — create it as new-task says). Not `core/Page`
(a columns change there is sitewide — propose it), not `ux/Dictate`.

## Length

Aim for fewer lines than AI 2 has today plus the migration script. Landing report: six
sentences with the two migration counts and the URL path of one dig-down.

## Owner addendum (20:05, verbatim excerpts) — deliverable 0, BEFORE the storage work

> The data structures should be simple and clear and adapt to our paging structure and data
> loading — loading on demand is fine. Look at our paging system, how data is saved and loaded.
> UI cards should have persistence: click a button or type into a field and it saves to that
> page's page.json or whatever. Lean into the systems we have, so anything new that works with
> the page persistence system can be added to any of these AI-generated pages, and as we drill
> down we're creating a tree of design variations — each nested thing should use the same tech,
> the same persistence. Leaning on the file system to create directories is maybe the best
> way, so you don't have to decide how to break a JSONL log into separate files, what to name
> them, how to load them, and what happens another level deep.

0. **Survey the persistence we already have, then choose.** Read `ext/Saver/`
   (`Saver.js`, `FileSaver.js`, `LocalStorageSaver.js`, `MemorySaver.js`, its doc/), `core/Page`'s
   `page.json` children (`core/Page/readme.md:17`), `Page.Store`, `ext/files`, the fs-backed
   `Make` persistence (`ai/2026-09-13/`, "never persist silently"), the Item/List stack
   (`ai/2026-08-13/persistence/`), and `Server/plugins/SocketServer/Append.js`. Write one
   screen, `doc/persistence.md`: what each saves, where, how it loads on demand, and which one
   a nested card page should use. Then AMEND deliverable 1 accordingly — the owner's lean is:
   **a nested thing is a directory** (`ai/cards/<slug>/`, and `<slug>/<sub>/` a level deeper)
   whose page uses the same persistence as every other page (a `page.json` / FileSaver-backed
   store for its fields and sub-pages, loaded on demand), so no one ever decides how to split a
   JSONL or name its pieces. The append-only event stream (what was said, by whom, when) stays
   in Servex's single-writer log per card; the card's STATE (fields the owner edits, its
   sub-pages, its variations) lives in its directory through the page persistence system.
   If the survey shows a cleaner split, write the decision with the alternative and follow it.

## Follow-up from open-mic (20:45) — item 11, no split sentences, still open

The first attempt judged a sentence's end from the last PERIODIC whisper guess and merged three
sentences into one live, so it was reverted. Do it from whisper-server's FINAL text for a
segment (its trailing punctuation; `Dictate.js` `close_segment` / `transcribe`), joining
consecutive final segments until one ends in `.?!` or a silence longer than the pause window;
prove on the recordings workspace's raw-segments pane (build that pane first: each whisper
segment with its start/end and text, so the boundaries are visible) with the 33 s JFK clip
and the owner's `just_a_test.wav`: one line per sentence, none broken, none merged.
