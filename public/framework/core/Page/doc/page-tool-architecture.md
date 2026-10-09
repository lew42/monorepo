# Page tool: class architecture (2026-10-09)

An agent changes any page while the owner watches by sending **a path and a delta**.
The goal and the owner's words: [page-tool-2026-10-09.md](page-tool-2026-10-09.md).
Decided in the page-mastermind session (task `ai/2026-10-09/page-mastermind/`), with `mastermind-ai-system`.

## The classes

```
Servex (node)                                   Browser
─────────────                                   ───────
page_tools.js  ── appends one line ──►  <folder>/page.jsonl  ── tailed live ──►  Page.Reader (extends Item.Store)
  page_set(path, [], delta)                                                         │ replays each line
  stamps by, ts, ids                                                                ▼
  resolves a ROUTE path to its file                                              Page (extends Item)
                                                                                   set(delta)  → words, tab(), content List
                                                                                   redraw()    → re-renders in place, no reload
                                                                                   │ draws
                                                                                   ▼
                                                                                 PageFrame (extends View) ── tabs ──► ext/tabs
                                                                                   the page's own content = the first ("home") tab

AISessionDetail (extends Page) — the default session template
  owns AISessionDetail.Log (extends ext/JSONL): streams the session folder's page.jsonl;
  content items → chat cards (AISessionConversation); every other line → page.set()
```

| Class | File | Job |
|---|---|---|
| `page_tools` | `Servex/agents/page_tools.js` | The agent's door: one validated, stamped line appended to a page's `page.jsonl`. Never parses the page; the browser does. |
| `Page` | `core/Page/Page.class.js` | Applies a delta. New: the six page words (`navigation`, `width`, `arrangement`, `surface`, `background`, `type_size`) arrive as a delta and `redraw()` the page; a `tab` line that carries a `title` or `content` builds that tab's page in memory. |
| `Page.Reader` | same file | One per `page.jsonl`; tails it and hands each new line to `page.set()`. |
| `PageFrame` | `core/Page/Frame.js` | Draws the words. With `navigation: "tabs"` the page's own content becomes the first tab. |
| `tabs()` | `ext/tabs/tabs.js` | The one tab strip. New: the list of tabs follows the page's children live, and a `home` tab can hold the page's own content. |
| `AISessionDetail` | `ai/AISession/AISessionDetail.js` | The session page. Its folder's `page.jsonl` reshapes it on top of the template. |

## The delta language (one line each)

```jsonc
{"navigation": "tabs"}                                          // layout / navigation: any of the six words
{"tab": {"name": "notes", "title": "Notes", "content": "…"}}    // a new tab, with its own page
{"notes": {"content": {"add": {"title": "First note"}}}}        // an item inside that tab's live list
{"content": {"add": {"title": "Merge report", "text": "…"}}}    // an item on the page itself
```

## Decisions

- **The tool appends; the page interprets.** The write is a blind append of the delta (validated against the schema, stamped with `by`, `ts` and missing ids), so nothing on the server needs to understand a page. The browser's `Page.set()` is the single place a delta means something. A second interpreter on the server (`page_read`'s replay) only summarises.
- **Tabs are child pages.** A tab is a child of the page, so it has its own url (`…/notes/`), its own live content list, and the same tab strip every other tabbed page uses (`ext/tabs`). No second tab system.
- **A tab line with no strip turns tabs on.** "Add a tab here" must show a tab, so a `tab` line that brings page data to a page with no tab strip also sets `navigation: "tabs"`.
- **Paths are route paths.** An agent names the page it sees (`/framework/ai/sessions/<id>/`); the tool finds the file behind it, even when no `page.jsonl` exists yet.
