# Live — the screen voice Claude drives live: one item-tool call, every open tab changes, the phone included

Open [/live/](/live/) on the PC, or `https://monorepo.lew42.com/live/` on the phone (with the site key). It is `class LivePage extends Page` ([LivePage.js](LivePage.js)), built from [page.jsonl](page.jsonl): line 1 names the class (`"class":"./LivePage.js"`), and every later line is one `set()`. Voice Claude writes with the Servex `item` tool, `item({path: "/live/", delta})`. The tool appends one line, the dev server streams it, and every open tab applies it with no reload. Measured: 7–17 ms on the PC (`probe.mjs` in the [task folder](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/)), 82 ms over the tunnel.

**What you see:** a header (a light that is on while voice is driving, the title, the last line's delay, a version dropdown on /live/ itself, a breadcrumb "Live › lab › foo" below it), the content, and a footer (every child page, saved screens, removed cards). A **card** (`part-card`, or a `part-link` to a sub-page) is framed and opens a page when tapped; text, headings, checklists, lights and buttons draw with **no frame**. Buttons side by side sit in one row. Spacing is one rhythm in [LivePage.css](LivePage.css) (`--live-gap` between things, `--live-step` inside one): no card sets its own. Light and dark follow the phone. The old page is kept at [/live/v1/](/live/v1/) ([v1/readme.md](v1/readme.md)).

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

## Going into a thing: sub-pages

1. **Make the sub-page:** `{"pages":{"add":{"name":"plan","title":"The plan","class":"/live/LivePage.js"}}}`. It gets its own folder and `plan/page.jsonl`, and it is a LivePage too. After the next Servex restart, `class` can be left out: a sub-page inherits it from `/live/` (`Servex/agents/Subpages.js`).
2. **Put its preview on /live/:** `{"content":{"add":{"type":"part-link","id":"plan","path":"./plan/","title":"The plan","text":"Three steps, one open question."}}}`. This is the card you tap.
3. **Write its detail:** the same deltas, with path `/live/plan/`. The page opens with a breadcrumb back (Live › plan).
4. **Edit either one:** the preview with `{"content":{"plan":{"title":"…","text":"…"}}}` on `/live/`; the detail with deltas on `/live/plan/`.

A card already on screen can become a sub-page (a link card stays in its place): `{"pages":{"promote":{"id":"<card id>","name":"plan"}}}` ([core/Page/doc/ai-api.md](/framework/core/Page/doc/ai-api.md)).

**Page features from voice** (tabs, columns, place, nav, previews — which ones actually draw, and why): [doc/page-features.md](doc/page-features.md).

## Nothing is lost: removed cards

A card removed, or taken by a clear, moves into the page's `removed` List ([LiveContent.js](LiveContent.js)); so does a saved screen that is removed or replaced. `removed` is part of the page's saved shape, so a snapshot keeps it too. It opens at `/live/removed/` (the footer's "Removed cards (N)"), and `{"restore":"<id>"}` puts one back at the end. Saving a screen does not fill it: those cards went into the screen.

## Every card is a page

Tap a card and it opens at `/live/<card id>/`. Voice writes there with the same deltas as on /live/: `item({path: "/live/foo/", delta: {"content": {"add": …}}})` puts a card **inside** foo, at any depth (`/live/foo/bar/`), also inside a saved screen (`/live/<screen>/<id>/`). It all stays in the one `page.jsonl`: every card on a LivePage gets its own `content` list ([LiveContent.js](LiveContent.js)), and the item tool turns a url with no folder into the hops to that card (`card_at` in [Servex/agents/page_tools.js](/Servex/agents/page_tools.js)). A sub-page folder of the same name wins. A card's id must not be a page word (`pages`, `content`, `screens`, `removed`): the list refuses it. Storage plan (embedded now, break out to a folder later): [core/Page/doc/recursive-pages.md](/framework/core/Page/doc/recursive-pages.md). Tests: [LivePage.test.mjs](LivePage.test.mjs) (through the real item tool). Battle-test results: [/live/lab/](/live/lab/).

## A tap reaches the agents

A button press (or any tap the page saves: a tick, a press) is one line in `page.jsonl` stamped `"by":"owner"`, e.g. `{"content":{"#cleanup-yes":{"press()":{}}},"by":"owner"}`. Servex already watches files for agents (`follow`, [Servex/Follow.js](/Servex/Follow.js)): voice-app follows `public/live/page.jsonl` (skipping the agents' own lines), so the press arrives in its `updates` within about a second. No new code: the browser writes through the dev server (or `/servex/api/item` behind the site key on the phone), and Servex sees the file change. Owner-only: the static site cannot write at all, and the phone needs the site key. ⚠ The dev server listens on every address, so a device on the home network could post a line too. Another agent that wants presses calls `follow({path: "public/live/page.jsonl", skip_by: [<its id>]})`. A sub-page with its own folder is its own file and needs its own follow.

## Keeping a screen: save, then restore

- `{"save":{"name":"plan-review","title":"Plan review"}}`: keeps every card on screen as a saved screen, then clears /live/. `{"save":"plan-review"}` and `{"save":{}}` (named `screen-N`) work too. Saving under a name that exists replaces it.
- The saved screen opens at `/live/plan-review/` and is listed in the footer under "Saved screens".
- `{"restore":"plan-review"}` puts its cards back on /live/; what was there moves to `removed`.
- `{"screens":{"remove":"plan-review"}}` drops a saved screen from the list into `removed`.

Saved screens live inside `/live/page.jsonl` (`LivePage.screens`, a List of [LiveScreen](LiveScreen.js)), so saving needs no folder and no Servex restart. A screen that should have a folder of its own is a sub-page (above).

## Files

- [LivePage.js](LivePage.js): the page, its methods, and how it draws. [LivePage.css](LivePage.css): the floor, blocks and cards, light and dark.
- [LiveLight.js](LiveLight.js), [LiveChecklist.js](LiveChecklist.js), [LiveButton.js](LiveButton.js), [LiveScreen.js](LiveScreen.js): one type each, `class … extends Item`, registered as `live-light`, `live-checklist`, `live-button`, `live-screen`.
- [page.jsonl](page.jsonl): the log. Write it only through the item tool (or the page tools), never by hand.
- [sessions/](sessions/) and [archive/](archive/): the old views of past screens, which read v1's log. [doc/](doc/): v1's notes.

**A new method:** add it to `LivePage.js` (see `flash`), reload /live/, and send `{"<name>": <argument>}`. A button can run it too. An effect starts with `if (this.replaying()) return;`, so reopening the page does not run it again for every old line.

## Watch out

- A data key that names a method calls the method: a drawing method called `header()` once swallowed `{"header":"…"}`, so drawing methods are named `draw_*`.
- The header light means only "an agent wrote here in the last 30 s". The old `{"light":…}` and `{"toggle":{}}` are gone; a light you control is a `live-light` card.
- Agent writes are stamped with the agent's id: the item tool does it. A script posting to `/api/item` sends raw `lines` with its own `by` (`probe.mjs`); a bare delta there is stamped `owner`.
- On the phone (the tunnel) the page streams and taps save, through `/servex/api/item` behind the site key. A bare LAN address (no key) streams but does not save.
