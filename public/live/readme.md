# Live — the screen voice Claude drives live: one item-tool call, the open tab changes in about 10 ms

Open [/live/](/live/). It is `class LivePage extends Page` ([LivePage.js](LivePage.js)), built from [page.jsonl](page.jsonl): line 1 names the class (`"class":"./LivePage.js"`), and every later line is one `set()`. Voice Claude writes with the Servex `item` tool, `item({path: "/live/", delta})`. The tool appends one line, the dev server streams it, and every open tab applies it with no reload. On the PC it takes 7–17 ms (median 8) from the tool being asked to the screen changing. Measured by `probe.mjs` in the [task folder](/framework/ai/sessions/2026/11/06/spawned/mastermind-live-page/).

**Layout:** a header (title, a status light, the last line's latency, a version dropdown), the cards (the page's own `content` List, one white card each), and a footer. Light and dark follow the phone (`light-dark()` in [LivePage.css](LivePage.css)). The old page is kept at [/live/v1/](/live/v1/) ([v1/readme.md](v1/readme.md)).

## The deltas

| To… | delta |
|---|---|
| add a card | `{"content":{"add":{"type":"part-card","id":"c1","title":"Hi","text":"Some **markdown**."}}}` |
| edit a card | `{"content":{"c1":{"text":"New text"}}}` |
| remove a card / clear all | `{"content":{"remove":"c1"}}` · `{"content":{"clear":true}}` |
| header light | `{"light":true}` · `{"light":false}` · `{"light":{"on":true,"color":"green"}}` · `{"toggle":{}}` |
| a line under the title / at the bottom | `{"header":"text"}` · `{"footer":"text"}` (`null` hides it) |
| blink the screen | `{"flash":{}}` · `{"flash":"red"}` |
| a banner for 4 s | `{"alert":"Look at this"}` |
| a status light card | `{"content":{"add":{"type":"live-light","id":"build","label":"Build","on":true,"color":"green"}}}`, then `{"content":{"build":{"color":"red"}}}` or `{"on":false}` |
| a checklist card | `{"content":{"add":{"type":"live-checklist","id":"today","title":"Today","items":[{"id":"milk","text":"Buy milk"},{"id":"eggs","text":"Eggs","done":true}]}}}` |
| tick, untick, add an entry | `{"content":{"today":{"items":{"milk":{"done":true}}}}}` · `{"content":{"today":{"check":"milk"}}}` (flips it) · `{"content":{"today":{"items":{"add":{"id":"tea","text":"Tea"}}}}}` |
| a button card | `{"content":{"add":{"type":"live-button","id":"b1","label":"Flash red","method":"flash","args":"red"}}}` |
| press it | `{"content":{"b1":{"press":{}}}}` (a tap does the same and saves the press, so every tab sees it) |

**A new test method:** add it to `LivePage.js` (see `flash`), reload /live/, and send `{"<name>": <argument>}`. A button can run it too. An effect should start with `if (this.replaying()) return;`, so reopening the page does not run it again for every old line.

## Files

- [LivePage.js](LivePage.js): the page, its methods, and how it draws. [LivePage.css](LivePage.css): the floor, the cards, light and dark.
- [LiveLight.js](LiveLight.js), [LiveChecklist.js](LiveChecklist.js), [LiveButton.js](LiveButton.js): one content type each, `class … extends Item` with its own `View`, registered as `live-light`, `live-checklist`, `live-button`.
- [page.jsonl](page.jsonl): the log. Write it only through the item tool (or the page tools); never by hand.
- [sessions/](sessions/) and [archive/](archive/): the old views of past screens, which read v1's log. [doc/](doc/): v1's notes.

## Watch out

- A data key that names a method calls the method. A drawing method called `header()` once swallowed `{"header":"…"}`, so drawing methods are named `draw_*`.
- The item tool replays `/live/` in node as a plain `Page` (it does not load `LivePage.js`), so its `page_read` shows `toggle`, `flash` and `press` as stored data. The browser is right; only the tool's text view is not.
- The dev socket opens on localhost only. A phone on the LAN or the tunnel loads the page once and does not stream (open question: [v1's phone fix](v1/Live.js) polled; nothing does yet in v2). A tap on a phone also cannot save, because `/api/item` is loopback only.
