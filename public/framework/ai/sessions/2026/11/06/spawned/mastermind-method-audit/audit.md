# The 149 methods the item tool printed for /live/

Measured 2026-11-06 with [probe.mjs](probe.mjs) (rerun it: `node public/framework/ai/sessions/2026/11/06/spawned/mastermind-method-audit/probe.mjs`; raw numbers in [usage.json](usage.json)). Nothing was deleted or moved. The tool's help now lists 9 methods for /live/ instead of 149 (section 5a).

## 1. Where the 149 come from

`LivePage.describe()` walks the whole prototype chain and returns every function on it. Split by the class that defines each:

| Class | Count | What it is |
|---|---|---|
| `LivePage` (public/live/LivePage.js, 225 lines) | 17 | 4 real delta verbs (`flash`, `alert`, `save`, `restore`); 13 screen plumbing (`render`, `draw_head`, `draw_cards`, `draw_card`, `draw_words`, `draw_foot`, `route`, `listen`, `voice_at`, `paint_voice`, `can_press`, `replaying`, `link_url`) |
| `Page` (core/Page/Page.class.js, 713 lines) | 97 | see below |
| `Item` (core/Item/Item.js, 854 lines) | 30 | persistence and replay machinery |
| `Events` mixin (core/Events/Events.js) | 5 | `on off emit once clear` |

`Page`'s 97, grouped by what they are:

- **24 one-line forwarders to `Jsonl.js`**: `tab`, `place`, `overlay`, `tab_state`, `tab_visible`, `tab_order`, `nav_ready`, `file`, `gone`, `child_file`, `link_child`, `unlink_child`, `take_words`, `log_view`, `log_draw`, `log_folder`, `log_redraw`, `draw_folder`, `draw_placed`, `draw_md`, `draw_module`, `listing`, `report_unknown`, `log_forget`.
- **12 column methods** (`columns`, `column_host`, `render_column`, `column`, `default_column`, `column_grab`, `resize_column`, `even_columns`, `settle_columns`, `column_slide`, `reveal_column`, `scroll_column`): 11 forward to `Columns.js`.
- **7 preview/wall methods** (`previews`, `walls`, `wall_rungs`, `preview`, `preview_card`, `preview_thumb`, `preview_link`): forwarders to `Previews.js`.
- **6 link/related/prefs forwarders** (`open_link`, `swap_link`, `swap_url`, `md_files`, `related_aside`, `prefs`).
- **20 tree/child-loading methods** (`declare`, `add`, `move`, `chain`, `nearest`, `topic`, `document`, `source_children`, `child`, `child_readme`, `child_md`, `tasks_folder`, `ai_page`, `md_folder`, `fs_folder`, `md_dir`, `load_all_children`, `naming`, `nav`, `nav_for`): how a page finds and loads its sub-pages and `.md` files. Note `Page.add` adds a child PAGE; it is not the list verb that adds a card.
- **14 render/mount methods** (`container`, `mounts_in`, `activate`, `deactivate`, `warn_if_hidden`, `in_doc`, `render_content`, `render_content_list`, `content_at`, `drew_content`, `link`, `crumbs`, `rerender`, `reshape`).
- **3 layout-word methods** (`words`, `word_classes`, `words_said`).
- **11 data/Item overrides** (`assign`, `replay_line`, `log_label`, `bubbles`, `set`, `hoist_content`, `has_content`, `take_content`, `get`, `lists`, `ext`).

`Item`'s 30: `set_one get_one put build_assign apply act batch as_call call_line call_marked hop_marked hook_for run_hook take unknown_key adopt_slot emit_safely member locate walk find contains remove move_to root unset toJSON wire delete snapshot_unsafe`. Their docs are all empty because `describe_class` only reads comments for Task, Session, Process and Improvements (`CLASS_SOURCES`, page_tools.js): a Page was never meant to be documented that way.

## 2. Who made them and when (git)

Not a single recent mess: it is a Page that grew for three months and was then split into helper files with the old method names left behind as forwarders.

- `Page.class.js` born 2026-07-26 ("page stuff"), 90 commits since. The page-rendering methods are old: `preview_card`/`walls` 2026-08-12, `declare` 08-04, `column_host`/`crumbs`/`reveal_column` 08-27, `nearest` 08-30 (columns program), `settle_columns`/`related_aside` 09-21, `words` 09-06 (the six layout words), `open_link` 09-24.
- 2026-10-03 "core/Page: fold PageLog away, Page extends Item directly" added the log/tab methods (`tab_state`, `log_view`, `draw_md`...).
- 2026-10-12 the **"Page.class.js split"** series (23ef8acf7d, e6a6597789, 1925996b0c, c054aba8e1, d81c0cd913, 9e9da48400, 87bf94aec5): `Columns.js`, `Previews.js`, `Links.js`, `Related.js`, `Listing.js`, `Reader.js`, `Prefs.js`, `Children.js`, `Jsonl.js` were cut out of Page. Each commit says "**facades stay**": the old method names were kept as one-line forwarders. That is where the 24 + 12 + 7 + 6 forwarders come from. 2026-10-24 (252ce850ac) `Load.js` did the same for statics.
- `Item` machinery: `toJSON`, `walk`, `contains` 2026-08-15; `locate`, `Events` 2026-10-02 (page-extends-item, commit e44930ad9d, "Page extends Item, one set(delta)"); `get_one` 10-03; `adopt_slot`, `member`, `move_to` 10-28; `as_call`, `hook_for`, `hop_marked`, `emit_safely`, `snapshot_unsafe` 10-31; `batch`, `unset`, `call_line` 11-02 (the Item/List Phase 1 work, [status](/framework/core/doc/status.md)). These were asked for as the save-and-stream plan.
- `LivePage.js` 2026-11-06, four commits today (5610b3015 "Live v2" first). Its header comment already says "METHODS A DELTA CAN CALL", so the author knew only four are verbs; nothing told the tool.
- Was the split asked for? The 2026-10-12 split was a deliberate refactor (a 2270-line file down to ~700) that the owner wanted; the forwarders were a safe-refactor choice, not asked for. Nobody ever asked for the methods to appear in an agent's help block: `Item.describe()` was written to feed that block for Tasks and Sessions (a few dozen task verbs) and was reused unchanged for Page.

## 3. Which are used

Call counts are a text scan of `.name(` and `"name"` across public/, Servex/ and Server/ (excluding session logs, archive, old). Generic names (`set`, `add`, `remove`, `save`, `render`) over-count. Treat as direction, not proof.

- **Real delta verbs (used):** `flash` (5 hits in 2 files), `alert`, `save`, `restore` on LivePage; `tab` (15) and `place` (30) on Page; `set`/`unset`/`remove` on Item. These are the only ones an agent calls through the tool.
- **Called, but only by render/replay plumbing, never by an agent:** all 13 LivePage `draw_*`/`route`/`listen`/... methods (each called once from `render`); the Item machinery (`apply`, `put`, `hook_for`, `adopt_slot`, `emit_safely`...) used by `set`; the 13 `render/mount` Page methods; the Jsonl/Columns/Previews/Links facades, called by the helper classes through `page.x()`.
- **Dead (zero callers found):** `Page.settle_columns`, `column_slide`, `scroll_column`, `resize_column`, `in_doc`; `Item.snapshot_unsafe` (only a flag name). The column facades were never called through the facade; `Columns.js` calls itself.
- **Duplicated:** the facade and its helper method are the same function twice (every `_helper("X").y(...)` forwarder). `Page.add`/`move` share names with `List.add`/`move` but mean "add a sub-page", an easy trap for an agent reading a flat list. `LivePage.can_press` re-implements, by regex, the idea of "which methods are public" that `callable` now states.
- **Internal that must never be shown to an agent:** everything above except the real delta verbs. About 140 of 149.

## 4. Why the tool dumps them

`Servex/agents/page_tools.js`:

- `instructions_for(kind, Class)` (about line 554) returns `{...describe_class(Class), task_keys, grammar, rules}`.
- `describe_class` calls `Class.describe()` (core/Item/Item.js:623). `describe()` walks `proto = proto.__proto__` from the class up to `Object.prototype` and takes **every** own function whose name does not start with `_`. It has no concept of "callable by a delta"; the only filter is the underscore.
- Docs were filled only from source comments for four named classes (`CLASS_SOURCES`), so a Page gets `doc: ""` for all.
- When it fires: `first_time()` (about line 1412) = once per `${caller}|${class}` (in-memory `told` map). So it fires on the **first call per agent per class**, whether read or write, and again on `{"help":{}}`. It also resets whenever Servex restarts, which is why you saw it on the first write per page and not later.
- The item tool also prints the Task grouping `rules` for a Page; they are about tasks and irrelevant to /live/ (left as is; see 6).

## 5. What I changed (5a only) and the recommendation for (b)

### 5a. Done: the help lists only declared callable methods, each with a doc

`declare` (Page.declare) is about declaring sub-pages and `static queries` lists read-only getters; neither covers "which methods may a delta call", so I added one declaration:

- `static callable = {name: "one-line doc"}` on `Item` (set, unset, remove), `Page` (spreads Item's, adds tab, place) and `LivePage` (spreads Page's, adds flash, alert, save, restore).
- `surface_of(Class)` in page_tools.js: walk up the chain; the nearest class with its own `callable` supplies the list and the walk stops there; a class with none is listed by its own methods (so Task, Session, Process, and any plain Page subclass such as a test `Dummy.ping` still show what they define). `describe_class` now sets `d.methods = surface_of(Class)`, filling a doc from the declaration, else from source as before.
- `Item.describe()` is unchanged (it still returns everything); only the tool output changed.
- Result for `/live/`: methods 149 → 9 (`set unset remove tab place flash alert save restore`), the whole instructions block is 1.9 KB.
- Tests: `Servex/agents/item-read.test.mjs` now asserts the declared nine show, nine named plumbing methods (draw_card, render, column_host, preview_card, log_view, toJSON, emit, walk, paint_voice) do not, at most 12 are listed, and every one has a doc. item_tool, session_tasks, session-route-tasks, Session, Page, call tests still pass.
- Doc: [Servex/doc/item-tool.md](/Servex/doc/item-tool.md), the Instructions line.
- **Servex was not restarted.** The running Servex still has the old `page_tools.js`; the new help appears after `restart_servex` (owner's timing). Also: a page edit already loaded in a browser needs nothing; `LivePage.callable` is a static no browser reads.

Rule for the next person: a method an agent should call goes into its class's `callable` with a doc. A new LivePage verb that is not added there will be hidden from the help (it still works).

### 5b. Should Page be split? Recommendation, not done

Page is already split by file (Columns, Previews, Links, Jsonl, Related, Listing, Load, Prefs, Children, Content). What remains is the **facades**: ~49 one-line forwarders (24 + 12 + 7 + 6) plus the 14 render methods. Proposal, for the owner's yes:

1. Keep Page small: a page is a url, `content` (a List of cards), `pages` (a List of sub-pages), tabs and the six layout words. Everything else is an extension of Page that a page opts into (`Page.use(Columns)`, `Previews`, `Markdown`, `Links`...), called as `page.columns.settle()`, not `page.settle_columns()`. The extension would be one object with its own methods; none of them land on Page's prototype.
2. Delete the dead five (`settle_columns`, `column_slide`, `scroll_column`, `resize_column`, `in_doc`) and make helper-to-helper calls go through the helper, not the facade.
3. Rename `Page.add`/`Page.move` (sub-pages) to `add_page`/`move_page` so they stop shadowing the list verbs.
4. Minimal "cards on a screen" surface, what an agent needs to know: `Item` (set a field, unset, remove); `List` (the `content` list: add `{type, id?, title, text}`, remove id, move id after, order ids, clear); a card is an Item with fields `type`, `title`, `text` and a few verbs of its own (a LiveChecklist `check`, a LiveButton `press`); `Page` adds `tab` and `place`; LivePage adds `flash alert save restore`. That is the list now in the help (9 methods), plus the List verbs, which the help does NOT yet print for `content`. That is the next gap: the tool should describe the list verbs once (add/remove/move/order/clear) because that is the actual "cards on a screen" interface.

This is a refactor of a core API with many callers; per CLAUDE.md it needs the owner's yes, so nothing in it was started.

## 6. Left for later (proposed, not done)

- The `rules` block (task grouping) is printed for Pages; it should only be sent for task-family classes.
- `fields` for LivePage lists `cards, is_top, unknown, view, views`: accessors that are not data fields. Same fix idea: let a class declare its `fields`.
- The help should list the List verbs for `content`/`pages` (see 5b.4).
- `LivePage.can_press` could read `callable` instead of its own regex.
