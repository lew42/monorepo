# Live — the screen voice Claude drives live: one item-tool call, every open tab changes, the phone included

Open [/live/](/live/) on the PC, or `https://monorepo.lew42.com/live/` on the phone (with the site key). It is `class LivePage extends Page` ([LivePage.js](LivePage.js)), built from [page.jsonl](page.jsonl): line 1 names the class (`"class":"./LivePage.js"`), and every later line is one `set()`. Voice Claude writes with the Servex `item` tool, `item({path: "/live/", delta})`. The tool appends one line, the dev server streams it, and every open tab applies it with no reload. Measured: 7–17 ms on the PC (`probe.mjs` in the [task folder](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/)), 82 ms over the tunnel.

**What you see:** a sticky header under 100 px at every depth (a tiny breadcrumb that is the url itself, "live / lab", with a small voice light and a settings icon, then the page icon and a small title, a version dropdown on /live/, and a row of tabs when the page has core sections), the content, and a footer (removed cards; on /live/ the old views). A **card** (`part-card`, or a `part-link` to a sub-page) is framed and opens a page when tapped; text, headings, checklists, lights and buttons draw with **no frame**. Buttons side by side sit in one row, and a card's own buttons sit inside it. Every title and text is markdown with mentions (`@Page`, `#Task`, `/live/lab/` become icon links), scrubbed so no script runs; a card whose title is only a mention (`"title":"@Page"`) is that thing's card and opens it. Spacing is one rhythm in [LivePage.css](LivePage.css) (`--live-gap` between things, `--live-step` inside one): no card sets its own. Light and dark follow the phone. The old page is kept at [/live/v1/](/live/v1/) ([v1/readme.md](v1/readme.md)).

## Start here (an agent with only this file)

1. **Look:** `page_read({path: "/live/"})` gives the title, every card with its id, and the sub-pages. `item({path: "/live/", read: "content"})` (or `"screens"`, `"removed"`) lists one list as `{total, rows: [{id, type, title}]}` and writes nothing. `item({path: "/live/", delta: {"help": {}}})` lists every verb and card type.
2. **New topic:** save what is there (`{"save": {"name": "…", "title": "…"}}`) or clear it (`{"content": {"clear": true}}`; nothing is lost, see *removed cards*).
3. **Show:** one `item({path: "/live/", delta})` call per change, with a delta from the table below. Every open tab, the phone included, redraws within a second.
4. **Hear taps:** `follow({path: "public/live/page.jsonl", agent: "<your id>"})` once, then `updates` each turn (*A tap reaches the agents*).

## Showing things

`item({path: "/live/", delta: {"help": {}}})` prints all of this in about 2 KB: the page's verbs, the `content` list verbs and every card type with an example (`static example` on each card class, `card_types` on LivePage).

| To… | delta (path `/live/`, or a sub-page's path) |
|---|---|
| a line of text / a heading / a titled block | `{"content":{"add":{"type":"part-text","text":"**markdown**"}}}` · `"type":"part-heading"` · `"type":"part-card","title":"…","text":"…"` |
| edit / remove / clear | `{"content":{"<id>":{"text":"…"}}}` · `{"content":{"remove":"<id>"}}` · `{"content":{"clear":true}}` (both keep the cards: see below) |
| reorder | `{"content":{"move":{"id":"<id>","after":"<other id>"}}}` · `{"content":{"order":["c","a","b"]}}` |
| any other class | `{"content":{"add":{"type":"Task","id":"ship","title":"Ship it"}}}`, then its own methods: `{"content":{"ship":{"start":{}}}}`. It draws with its own View. A type no code imported yet loads first (`Item.modules` in core/Item/Item.js; add a line there for a new one) |
| a line under the title / at the bottom | `{"header":"text"}` · `{"footer":"text"}` (`null` hides it) |
| blink / a 4 s banner | `{"flash":{}}` · `{"flash":"red"}` · `{"alert":"Look at this"}` |
| a status light | `{"content":{"add":{"type":"live-light","id":"build","label":"Build","on":true,"color":"green"}}}`, then `{"content":{"build":{"color":"red"}}}` |
| a checklist | `{"content":{"add":{"type":"live-checklist","id":"today","title":"Today","items":[{"id":"milk","text":"Buy milk"}]}}}`; tick `{"content":{"today":{"items":{"milk":{"done":true}}}}}`; flip `{"content":{"today":{"check":"milk"}}}`; add `{"content":{"today":{"items":{"add":{"id":"tea","text":"Tea"}}}}}` |
| a button | `{"content":{"add":{"type":"live-button","id":"b1","label":"Flash red","method":"flash","args":"red"}}}`; press `{"content":{"b1":{"press":{}}}}` |
| buttons inside a card | add them to the card's own list: `{"content":{"<card>":{"content":{"add":{"type":"live-button","id":"yes","label":"Yes","method":"alert","args":"Yes"}}}}}` (or write to `/live/<card>/` with the plain `content.add`). They draw in one row on the card; tapping one presses it, tapping elsewhere opens the card |
| a code block | `{"content":{"add":{"type":"live-code","lang":"js","code":"const sum = (a, b) => a + b;"}}}`; `lang` is js, json, css, html or sh (default js), highlighted by `ext/highlight`; optional `title` and one-line `caption`. **Use it for any code in a card. Keep each line of an example under about 40 characters, because that is what fits on a phone, and put each chained call (`.map`, `.filter`, `.reduce`) on its own line.** A file view (settings → a file) can scroll; an example should fit |
| a plain element | `{"content":{"add":{"type":"View","content":"Hello world"}}}`: a div with that text (any registered class that is not an Item draws this way; `Item.foreign` in core/Item/Item.js). Demo: [/live/div-test/](/live/div-test/) |
| a titled block's preview (what its card shows) | `{"content":{"<card>":{"preview":{"add":{"type":"part-text","text":"One short line."}}}}}`. A card on its parent shows only its title and its `preview` list (anything can go in it); with an empty list, its `description`; else just the title. Its own page (`/live/<card>/`) shows the same preview first, then the full `text` and content. A page takes one too: `{"preview":{"add":…}}` on its own path shows at the top of that page. A link card shows its own preview, else its own `description`, else the `description` its page gives itself (`LivePage.Preview`). ⬜ A link card does not yet show its page's own `preview` list (it would have to replay that page's file) |
| a card for a thing on the site | `{"content":{"add":{"type":"part-card","id":"pg","title":"@Page"}}}`: its icon and name, and a tap opens it (ext/Mention) |
| an item in its own file | `{"items":{"add":{"file":"thing.jsonl"}}}`: its lines live in `thing.jsonl` beside this page's own, not here. Drawn after the content (title + its text, tailed live) and reachable as a full page at `/live/<folder>/thing` — its id defaults to the file name (core/Item/readme.md, "page.items") |

## Going into a thing: sub-pages

1. **Make the sub-page:** `{"pages":{"add":{"name":"plan","title":"The plan","class":"/live/LivePage.js"}}}`. It gets its own folder and `plan/page.jsonl`, and it is a LivePage too. After the next Servex restart, `class` can be left out: a sub-page inherits it from `/live/` (`Servex/agents/Subpages.js`).
2. **Put its preview on /live/:** `{"content":{"add":{"type":"part-link","id":"plan","path":"./plan/","title":"The plan","text":"Three steps, one open question."}}}`. This is the card you tap.
3. **Write its detail:** the same deltas, with path `/live/plan/`. The page opens with a breadcrumb back (Live › plan).
4. **Edit either one:** the preview with `{"content":{"plan":{"title":"…","text":"…"}}}` on `/live/`; the detail with deltas on `/live/plan/`.

A card already on screen can become a sub-page (a link card stays in its place): `{"pages":{"promote":{"id":"<card id>","name":"plan"}}}` ([core/Page/doc/ai-api.md](/framework/core/Page/doc/ai-api.md)).

**Page features from voice** (tabs, columns, place, nav, previews, tried live under [/live/demos/](/live/demos/): tabs works via real sub-pages, columns/nav/place do not draw under LivePage and previews has no delta — one table, the cause for each, and what is still missing): [doc/page-features.md](doc/page-features.md).

## Nothing is lost: removed cards

A card removed, or taken by a clear, moves into the page's `removed` List ([LiveContent.js](LiveContent.js)); so does a saved screen that is removed or replaced. `removed` is part of the page's saved shape, so a snapshot keeps it too. It opens at `/live/removed/` (the footer's "Removed cards (N)"), and `{"restore":"<id>"}` puts one back at the end. Saving a screen does not fill it: those cards went into the screen. `{"remove": ["a", "b"]}` removes each id in turn; an id that is not there (already removed, moved to another page) is skipped.

## Nothing blanks the page: errors

One bad line or one broken card never blanks a page. A line that throws (on load or arriving live, `LivePage.replay_line`) is skipped, the rest of the page still applies, and a small red card at the top says how many lines were skipped and why (`LivePage.Errors`). A card, or a part of the page (header, cards, footer), that throws while drawing becomes a one-line error card in its place (`LivePage.safely`, `LivePage.Broken`). Every caught error is one line in the shared error log, [ext/ErrorLog](/framework/ext/ErrorLog/readme.md): the day file `/framework/ai/errors/<date>.jsonl` (one file a day, so it never grows past a day) and `/live/failures.jsonl`, with the page, the message, the stack and the offending line (`LivePage.caught`). The agent owning /live/ follows `public/framework/ai/errors/` (Servex's `follow` refuses `public/live/`), so it hears of each one.

## Every card is a page

Tap a card and it opens at `/live/<card id>/`. Voice writes there with the same deltas as on /live/: `item({path: "/live/foo/", delta: {"content": {"add": …}}})` puts a card **inside** foo, at any depth (`/live/foo/bar/`), also inside a saved screen (`/live/<screen>/<id>/`). It all stays in the one `page.jsonl`: every card on a LivePage gets its own `content` list ([LiveContent.js](LiveContent.js)), and the item tool turns a url with no folder into the hops to that card (`card_at` in [Servex/agents/page_tools.js](/Servex/agents/page_tools.js)). A sub-page folder of the same name wins. A card's id must not be a page word (`pages`, `content`, `screens`, `removed`): the list refuses it. Storage plan (embedded now, break out to a folder later): [core/Page/doc/recursive-pages.md](/framework/core/Page/doc/recursive-pages.md). Tests: [LivePage.test.mjs](LivePage.test.mjs) (through the real item tool), [LiveCode.test.mjs](LiveCode.test.mjs) (the code card). Battle-test results: [/live/lab/](/live/lab/).

## A tap reaches the agents

A button press (or any tap the page saves: a tick, a press) is one line in `page.jsonl` stamped `"by":"owner"`, e.g. `{"content":{"#cleanup-yes":{"press()":{}}},"by":"owner"}`. Servex already watches files for agents (`follow`, [Servex/Follow.js](/Servex/Follow.js)): voice-app follows `public/live/page.jsonl` (skipping the agents' own lines), so the press arrives in its `updates` within about a second. No new code: the browser writes through the dev server (or `/servex/api/item` behind the site key on the phone), and Servex sees the file change. Owner-only: the static site cannot write at all, and the phone needs the site key. ⚠ The dev server listens on every address, so a device on the home network could post a line too. Another agent that wants presses calls `follow({path: "public/live/page.jsonl", skip_by: [<its id>]})`. A sub-page with its own folder is its own file and needs its own follow.

## Keeping a screen: save, then restore

- `{"save":{"name":"plan-review","title":"Plan review"}}`: keeps every card on screen as a saved screen, then clears /live/. `{"save":"plan-review"}` and `{"save":{}}` (named `screen-N`) work too. Saving under a name that exists replaces it.
- The saved screen opens at `/live/plan-review/` and is a link card under the content of /live/ (Saved screens).
- `{"restore":"plan-review"}` puts its cards back on /live/; what was there moves to `removed`.
- `{"screens":{"remove":"plan-review"}}` drops a saved screen from the list into `removed`.

Saved screens live inside `/live/page.jsonl` (`LivePage.screens`, a List of [LiveScreen](LiveScreen.js)), so saving needs no folder and no Servex restart. A screen that should have a folder of its own is a sub-page (above).

## Several agents may drive this page

The owner's voice agent in the browser, the voice app and any mastermind can all write to /live/ at the same time, so the screen is never only what you last wrote.

- **Read before you edit:** `item({path: "/live/", read: "content"})` right before a change to a card, and act on the ids it lists.
- **Use fresh ids:** give a new card an id nobody has used (`"<topic>-<n>"`), or leave `id` out and let the tool stamp one; reusing an id writes into someone else's card.
- **A refused or surprising answer means someone else moved:** read again, never retry blind. Clear or save only for a new topic of your own.

## Reading the screen (read mode)

Reading never writes a line. `page_read(path)` is the whole page as text. `item({path, read: "<dotted path>"})` reads one value: `read: "title"`, `read: "content"` (the cards), `read: "screens"` (saved screens: `nov6-scratch`, …), `read: "removed"`. `item({path})` with no delta answers the class's fields and verbs. A sub-page (a folder) is read at its own path, `/live/lab/`.

## What is stale (2026-11-06)

- **Writing into a card by url waits on a Servex restart.** `item({path: "/live/<card id>/", …})` is built (`card_at`), but the running Servex is older: today that path reads as an empty Page. Until the restart, write into a card through its parent: `{"content": {"<card>": {"content": {"add": …}}}}` on `/live/`. A sub-page that leaves out `"class"` also needs the restart. Only the owner picks the restart time; never call `restart_servex` during a call.
- [/live/sessions/](sessions/), [/live/archive/](archive/) and [/live/v1/](v1/) are the old version's views; they read v1's log and show nothing new.
- `{"light": …}` and `{"toggle": {}}` are gone (a `live-light` card replaces them).

## The header: tabs and settings

- **Every page under /live/ is a LivePage**, so it has this header: a sub-page whose `page.jsonl` names a plain Page (or no class) is built as a LivePage (`LivePage.child` and `LivePage.log_class`); a LivePage subclass such as DesignPage stays itself. A `page.js` page under /live/ is its own class, so make it extend LivePage.
- **The header runs the full width** of the page with its own padding and a bottom border, which is also the tab row's baseline; its text lines up with the column below.
- **A page is EITHER a tab OR a link card, never both.** A tab is a permanent core section of its page, one that becomes familiar (Live, Log, Settings), never a post or a temporary page. A new sub-page (`pages.add`) is never a tab: it is a tab only by an explicit opt-in, either the parent's line `{"tab": {"name": "next", "tab": true}}` (the last such line wins, so `"tab": false` takes it back; any other field in it, such as `title`, is ignored: the tab reads the sub-page's own title) or the sub-page's own `{"tab": true}` line, and draws as part of this page (a plain LivePage, not a `page.js` or a DesignPage). Switching tabs keeps the same tab row and the same h1 (the parent's title; the selected tab says which one). Everything else is a **link card** under the content (`LivePage.Pages`, drawn by code, never written into page.jsonl), in two groups, Pages then Saved screens; a page the content already links to (a `part-link` card) is not drawn twice. A tab row needs two tabs, so /live/ today shows none. More than five tabs would be a list, so then every sub-page is a card (`LivePage.tab_max`). /live/sessions/, /live/archive/ and /live/v1/ are neither (`LivePage.tab_skip`); the footer of /live/ links them. The rule is `LivePage.pages_of`. **Both stream:** a `{"tab": …}` or `{"file": …}` line on the page or its parent redraws the tab row and the Pages group at once, from a fresh folder listing, so a tab picked or dropped, or a sub-page just made, shows with no reload.
- **One title everywhere:** a tab label, a link card's title and the page's own h1 all read the sub-page's own `title` (the last `title` in its `page.jsonl`, else its `page.js`; `LivePage.title_of`). To rename a sub-page, set its title on its own path: `item({path: "/live/demos/", delta: {"title": "Feature demos"}})`. A link card's `title` shows only until the page's own one arrives.
- **The breadcrumb is the url** (`location.pathname`, word for word, every step a link): a phone hides the address bar, so this is where the owner reads it. It redraws on every url change, a tab switch included (`LivePage.on_url`), and the tab row lights the tab the url is in.
- **Settings** (the gear, `<page>/settings/`): first the class file that draws the page (`LivePage.js`, or `DesignPage.js` on /live/design/), a tap opens its code; then, for a card or a saved screen, which `page.jsonl` it is saved in; then the page's folder, labelled with its path ("/live"), one list top to bottom: folders, then files, `page.jsonl` included (`LivePage.Files`). A folder opens its own list (`/live/settings/doc/`); a file opens its code on its own page, the full width with no line numbers, highlighted by ext/highlight (`/live/settings/LivePage.js/`), and the header's small **raw** link is the file itself. Every settings page is a LivePage whose gear is an **X** back to the page (`/live/settings/` → `/live/`), so the same spot toggles settings; a settings page has no settings of its own. A folder or a saved screen named `settings` wins over it. Below the files: "What it is made of" and "How it got here", [ext/Inspect](/framework/ext/Inspect/readme.md)'s `ItemInspector` (its content, methods, fields) and `DeltaHistory` (a slider replaying the folder's `page.jsonl` in memory), both loaded only once settings opens.
- **The icon** is the page's own `{"icon": "⚡"}` (an emoji, or a Material name such as `"folder"`), shown in its header and on every card that links to it. A page that names none shows **where it is stored** (`LivePage.stored`): a small circle for an item inside its parent's `page.jsonl` (a card, a saved screen), a file for a loose `.jsonl` file of its own, a folder for a folder of its own (`folder/page.jsonl`); settings shows a gear (`LivePage.icon_name`, `LivePage.icon_of`). The voice light is a separate small dot beside the gear, never beside the title.
- **`header`** (`{"header": "text"}`) draws just below the sticky header, so the header keeps one size.

## Files

- [LivePage.js](LivePage.js): the page, its methods, and how it draws: View classes in the house style (core/View), as static parts a subclass can swap: `Head`, `Crumbs`, `Tabs`, `Settings`, `Files`, `Pages` (the link cards), `Focus`, `Main`, `Card`, `Block`, `Children` (a card's buttons), `Heading` and `Md` (markdown with mentions, `{ safe: true }`), `Foot`. Each takes `{page, item}` (or `{page, list}`); its CSS class comes from its name (`LiveCardView` draws `.live-card`). [DesignPage](design/DesignPage.js) extends `Card` and `Block`, so keep those names and args. [LivePage.css](LivePage.css): the floor, blocks and cards, light and dark.
- [LiveLight.js](LiveLight.js), [LiveChecklist.js](LiveChecklist.js), [LiveButton.js](LiveButton.js), [LiveScreen.js](LiveScreen.js), [LiveCode.js](LiveCode.js): one type each, `class … extends Item`, registered as `live-light`, `live-checklist`, `live-button`, `live-screen`, `live-code`.
- [page.jsonl](page.jsonl): the log. Write it only through the item tool (or the page tools), never by hand.
- [sessions/](sessions/) and [archive/](archive/): the old views of past screens, which read v1's log. [doc/](doc/): v1's notes.

**A new method:** add it to `LivePage.js` (see `flash`), reload /live/, and send `{"<name>": <argument>}`. A button can run it too. An effect starts with `if (this.replaying()) return;`, so reopening the page does not run it again for every old line.

## Watch out

- A data key that names a method calls the method: a method called `header()` on LivePage would swallow `{"header":"…"}`. Drawing lives in View classes (`LivePage.Head`, …, each with a `render()`), so the page itself has no method named after a field.
- The header light means only "an agent wrote here in the last 30 s". The old `{"light":…}` and `{"toggle":{}}` are gone; a light you control is a `live-light` card.
- Agent writes are stamped with the agent's id: the item tool does it. A script posting to `/api/item` sends raw `lines` with its own `by` (`probe.mjs`); a bare delta there is stamped `owner`.
- On the phone (the tunnel) the page streams and taps save, through `/servex/api/item` behind the site key. A bare LAN address (no key) streams but does not save.
