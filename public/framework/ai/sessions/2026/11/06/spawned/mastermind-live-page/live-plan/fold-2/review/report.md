verdict: fix
1. [fix] `Plugin.store` and `Plugin.hosts` no longer cover Page. `store` and `hosts` are statics inside the mixin, so every `Pluggable(...)` call makes its own copy (Plugin.js diff, `this.store.get`, `this.hosts.push`). `core/Plugin/page.js:6,151` still sets `Plugin.store = local` and lists `Plugin.hosts`, so Page's on/off state is never saved to localStorage and Page never shows on the Plugin page. Page.plugins' "class-wide off, per-page on" state is real but invisible there. Share one store and one hosts list across hosts (read them from `Plugin`), or say in the readme that each host has its own.
2. [fix] `core/Plugin/doc/design-notes.md` is stale: line 22 says `Page.use(Ext)` "is left alone… has no off switch… moving Page onto Plugin is a follow-up", and line 31 says "`Page.use` is not migrated". `core/Page/doc/classes.md:23,43` still says `class Page extends Item`. Neither file is in the diff.
3. [fix] `core/Page/ext/Inbox/Inbox.js:129` and `:144` were not touched. The requirement said to fix them "if they become wrong". They are still roughly true, but they say "calling this" and name no plugin path. Add one line saying the call comes from `Pluggable`, or note in the task log that you checked and left them.
4. [fix] The task folder can't be continued from alone. `shots/` holds only Chrome "This site can't be reached" pages (`layout.json` has `widest_text_sample` "This site can't be reached", `items 0`), because the review server was down. The `live-plan/fold-2` folder has no log of the name-collision overlap that requirement 2 asked for, and no before/after test counts file. The counts and the smoke result exist only as `log` lines in `session.jsonl`.
5. [note] `Pluggable` brings static `on`/`off`/`once`/`clear`/`emit` onto Page. Requirement 2 said "brings none of those names". There is no collision with Item today, since Item has no static `on` or `emit`, but a future one would break. Item's statics were grepped; the grep was not logged.
6. [note] The new `PluginsFixture` ext is indexed in `ext/readme.md` and `ext/page.jsonl`. That is correct, but it ships as a live site file that exists only for a test.
7. [note] Class page for the new class: Page's live plugin instances are viewable through `Page.plugins`, but nothing opens a page that shows them. Say where to look.

## Requirements
- 1 "add `Pluggable(Base)` to Plugin.js; `Plugin extends Pluggable(Events(Object))`" — yes — diff, Plugin.js
- 2 "name collisions: log the overlap; `plugged(inst)` replaces `emit("new")`" — partly — `plugged` is there; no overlap log in the folder (finding 4); statics on/emit are added (finding 5)
- 3 "`class Page extends Pluggable(Item)`; `_ext` read-only alias; `ext(name)` turns it on for this page only" — yes — Page.class.js diff
- 3a "an `Ext` with only `setup(page)` still works" — yes — `PluginsFixture` has only `setup` and the test passes
- Tests: Plugin block and Page block — yes — Plugin.test.mjs (31), Page.plugins.test.mjs (6 checks)
- Counts equal before and after; smoke clean — not shown in the folder, only in `session.jsonl` logs
- Docs: Plugin readme, Page readme, jsonl.md, ext readme — yes. design-notes and classes.md are stale (finding 2)
- Live instances page for the new class — n/a beyond finding 7
## Page structure
- page 1 — not measured — the shots are connection-error pages; no page was rendered. No visual evidence exists.
## Navigation
- n/a
## Layout
- not measured — shots/…/layout.json is the browser's error page (tab_rows 0, items 0)
## Sizing
- not measured — same reason
## Wrapping
- not measured — `wraps: []` on an error page proves nothing
## Spacing and padding
- not measured — same reason
## Colour and contrast
- not measured — same reason
## Flow
- n/a
## Words
- 1 — the new doc text is plain but long. `jsonl.md` keeps the original comment and adds a "Current" block rather than editing it, so a reader sees both. yes, acceptable.
- 2 — comments in Plugin.js run to several lines each, against the "one short line" rule. no — note only.
Widths given: all four (400, 1200, 1920, 3440) of one url, all error pages.
