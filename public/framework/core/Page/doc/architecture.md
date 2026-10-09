# Page system: class architecture and decisions

The page system is the site's **storage and streaming container**: a page is a folder, its state is an
append-only log (`page.jsonl`), and every open tab redraws as lines arrive. How a line travels is
[streaming.md](streaming.md); the owner's ask behind the page tool is [page-tool-2026-10-09.md](page-tool-2026-10-09.md).
Older history of individual choices: [decisions.md](decisions.md).

## The classes

```
Servex (node)                                   Browser
─────────────                                   ───────
page_tools.js  ── appends one line ──►  <folder>/page.jsonl  ── tailed live ──►  Page.Reader (extends Item.Store)
  page_set(path, delta)                                                             │ replays each line
  stamps by, ts, ids; answers the size                                              ▼
  resolves a ROUTE path to its file                                              Page (extends Item)
                                                                                   set(delta)  → words, tab(), content List
                                                                                   overlay()   → only the shape of a line
                                                                                   rerender()  → in place, no reload
                                                                                   │ draws
                                                                                   ▼
                                                                                 PageFrame (extends View) ── tabs ──► ext/tabs
                                                                                   the page's own content = the first ("home") tab

AISessionDetail (extends Page) — the default session template
  AISessionDetail.Log (extends ext/JSONL) streams the session folder's page.jsonl:
  content items → cards in the conversation; the shape of every line → page.overlay()
```

| Class | File | Job |
|---|---|---|
| `page_tools` | `Servex/agents/page_tools.js` | The agent's door: one validated, stamped line appended to the page's log. Never interprets the page. |
| `Page` | `core/Page/Page.class.js` | Applies a delta. The six page words (`navigation`, `width`, `arrangement`, `surface`, `background`, `type_size`) arrive as a delta and redraw the page; a `tab` line with a `title` or `content` builds that tab's page. |
| `Page.Reader` | same file | One per `page.jsonl`: tails it, hands each new line to `page.set()`. |
| `PageFrame` | `core/Page/Frame.js` | Draws the words. With `navigation: "tabs"`, the page's own content is the first tab. |
| `tabs()` | `ext/tabs/tabs.js` | The one tab strip, also inside a column page. `home` holds the page's own content. |
| `AISessionDetail` | `ai/AISession/AISessionDetail.js` | The session page; its folder's `page.jsonl` reshapes it on top of the template. |

Live demo: [/framework/core/Page/tool/](/framework/core/Page/tool/) (every line on it came from the tool).

## The delta language (one line each)

```jsonc
{"navigation": "tabs"}                                          // a layout word: any of the six
{"tab": {"name": "now", "title": "Now", "content": "…"}}        // a new tab, with its own page
{"now": {"content": {"add": {"title": "First item"}}}}          // an item inside that tab's live list
{"content": {"add": {"title": "Merge report", "text": "…"}}}    // an item on the page itself
```

`page_set(path, delta)` writes any of these; `path` is the url you see, omitted = your own session page.

## Decisions (2026-10-09, task `ai/2026-10-09/page-mastermind/`)

- **The tool appends; the page interprets.** The owner offered two options: a blind "append any delta" tool, or routing through a Page method. Both, split by side: the write is a blind, schema-checked append (stamped with `by`, `ts` and missing ids), and the browser's `Page.set()` is the one place a delta means something. No page parsing on the server; `page_read` only summarises.
- **Tabs are child pages.** A tab has its own url (`…/now/`), its own live content list, and the one tab strip (`ext/tabs`). No second tab system.
- **A tab line with no strip turns tabs on.** "Add a tab here" must show a tab.
- **Paths are route paths.** The agent names the page it sees (`/framework/ai/sessions/<id>/`); the tool finds the file, even when none exists yet. A session's file is its own dated folder (`AISession.locate()`).
- **A template page takes only the shape of its log** (`Page.overlay()`): words, `tab`, `title`, lines addressed to a tab. Other keys in such a log stay data, because a key can name a Page method (`add`, `move`).
- **Every agent knows its page.** Servex's first-turn line names `/framework/ai/sessions/<id>/`; a VS Code tab is told on its first prompt (`.claude/hooks/prompt-relay.mjs`).

## Log growth (the owner, 18:25): designed, size feedback built

A page log or chat can reach thousands of lines. **Built:** every page-tool write answers with the log's
new `{bytes, lines}`, and `large: true` past 1 MB. **Designed, not built:** past ~1 MB the log is
compacted — the old lines move, unchanged, to `page.<n>.jsonl` beside it (never deleted), and the live
file restarts with one **snapshot line** (the page's state at that moment) followed by new lines. A page
then loads its current state from one short file; history is one click down. The open question is the
snapshot: it needs a node-side replay that matches `Page.set()` exactly, which `page_read`'s partial
replay does not yet. Until that exists, nothing is compacted (a wrong snapshot would lose information).

## Many records (the owner, 18:25): the general rule

No file over ~1 MB, and never load all records at once. A collection that grows (7,000 sessions) is
**partitioned** by the window a reader looks at, usually time: one small index per day, listed by month
and year, loaded for the visible range only. Each index line is the record's current state, not its
events. The sessions system already follows this ([ai/sessions/doc/data-architecture-2026-10-08.md](../../../ai/sessions/doc/data-architecture-2026-10-08.md), sections 8–9); any page that lists a growing collection does the same.

## File today, database later

Production will likely add Cloudflare D1 or Durable Objects (the production-stack task inventories it);
the file system stays the local, always-working fallback. So the page log is defined as **an ordered,
append-only list of JSON lines per page path**, and nothing above the storage depends on files:
`page_tools` appends through one function (`write_line`), the browser reads through one class
(`Page.Reader`, an `Item.Store`). Moving a page log to a Durable Object (one per page: append + subscribe)
or a D1 table (`path, seq, line`) replaces those two seams only.

## Open

- A session that has no folder yet: the tool makes one, but a tab already open on that session is not
  subscribed to the new folder's file until a reload (an existing folder works live).
- The session page and prompt storage: `prompt-relay.mjs` still writes the owner's prompts into the old
  card folder (`ai/YYYY/MM/DD/session-<id8>/`); the session page reads both. One resolver for "a session's
  page file" is asked of `mastermind-ai-system`.
- The owner's session-page design ([ai/sessions/doc/session-page-2026-10-09.md](../../../ai/sessions/doc/session-page-2026-10-09.md)): the tabs (including an AI-filled **Now** tab) work through this tool today; the fixed header, dictation footer, cache timer and settings menu are not built.
