# Owner dictation, 2026-10-19 (second part): evolving compaction, and how the voice agent drives /live

Relayed by the voice agent, so these are its words, not the raw ones. Part one (sessions, verbatim logging, Item persistence, Inbox, context cards) is [owner-2026-10-19-sessions.md](owner-2026-10-19-sessions.md); the first build is [sessions.md](sessions.md).

## What was asked

- A fresh JSONL for a new live page is fine. The existing live content is a log and must not be clobbered.
- Rewriting a whole card to update it lost things last round. Pure append-only is not right either. The wish is **evolving compaction**: old things collapse, and what is being discussed now is on screen as fast as possible.
- The voice agent is the middleman. The owner dictates in the Claude app and watches `/live/`; the voice agent applies changes through Servex tools, leaning on `item`. Document how that coordination works.
- Assess two designs: (1) a server-side live instance behind a tool that takes a path and a value and calls `set()`; (2) a raw append-only JSONL tool with no server instance and a well-documented API. The owner leans to (1), because a live instance can filter, clean up and compact.
- Deltas the voice agent expects to need: clear page, new layout, full screen, vertically centred, lists of things, nested content cards, interactive state.
- Phase two (noted, not built): cards with buttons that write to the file system through the dev socket, so the owner's clicks reach agents.

## Design (1) vs design (2): what exists today (read from the code, not run)

- **Today the tool for a page is design (2).** `page_set`, `page_add`, `page_call`, `page_log` and `item` all end in `run_item()` ([Servex/agents/page_tools.js](../../../Servex/agents/page_tools.js)). For a `page.jsonl` the class has no `replay`, so there is no live instance: the tool stamps `id`, `by`, `ts`, works out the nesting, appends one line and returns. Nothing filters, dedupes or compacts. That is why a whole-card rewrite can lose things: nothing checks what it replaces.
- **Design (1) already exists, for Tasks.** A `task.jsonl` path gets `live_root()`: one live `Task` instance per file, advanced with every appended line, re-read if something else wrote the file, and a `validate()` step that can refuse a bad line before it is written. That is the same shape the owner leans to, working today ([Servex/doc/item-tool.md](../../../Servex/doc/item-tool.md)).
- **For Pages it is designed, not built:** `PageHost` / `LivePage` / `PageDoc extends Item` in [core/Page/doc/server-instance.md](../../framework/core/Page/doc/server-instance.md) (the real `Page` cannot run in node: it needs the DOM). `Item`, `List` and the `Store` do run in node, so a small `PageDoc` is the slice.

**Recommendation: design (1), but keep the log append-only underneath.** The instance does the thinking, the file stays the history:
1. The tool keeps one live `LivePage` for `/live/page.jsonl` (the Task mechanism, reused, not a second system).
2. A delta first goes through the instance: `set({"<id>":{"text":"new"}})` patches a field and appends one small line, never the whole card. The instance can refuse a line that names a missing id or that would blank a field by accident.
3. **Compaction is a view, not a rewrite.** The instance knows which cards are old (past a clear, or untouched for a while) and the page draws them collapsed (title only, one line, the session list). The full cards stay in the log, one click down. Nothing is deleted, and what was just said is the newest, fully open card.
4. Writing to a new file is fine for a new live page; the old `page.jsonl` is never edited, only followed (the archive does that today).

Design (2) alone keeps working for every page that nobody has built an instance for, so the instance is added behind the same `item` door, nothing the voice agent calls changes.

## How the voice agent coordinates /live (today)

- **Path:** the voice app calls Servex over `POST /mcp/remote` (caller `voice-app`, [RemoteMCP.js](../../../Servex/ext/remote/RemoteMCP.js), [remote-tools.md](../../../Servex/ext/remote/doc/remote-tools.md)). It gets the same registry as a local agent, plus `ask_mastermind` and the generic `call`. The one source of its standing rules is `RemoteMCP.INSTRUCTIONS`.
- **Tools for the page:** `page_set` (one delta), `page_add` (one card), `page_call` (one method at one target), `page_read` (current state), and `item` (the general door, the same line, class picked by the folder). All with `path: "/live/"`.
- **Latency:** the tool appends a line, the open tab's `JSONL.live` stream draws it. Measured 21 to 111 ms from write to screen ([core/Page/doc/ai-api.md](../../framework/core/Page/doc/ai-api.md)). The fallback is a short poll where the socket is refused (phones).
- **Rule order:** clear first when the topic changes (`{"content":{"clear":true}}`), then add. Never post "Heard" or summary cards. Update a card by its id, never by clearing and re-adding.

## The deltas the voice agent needs, mapped

| Need | Today |
|---|---|
| Clear the page | `{"content":{"clear":true}}` (exists) |
| New layout | page properties `navigation`, `width`, `arrangement`, `surface`, `background`, `type_size` (exist) |
| Lists of things | `content.add` several cards; `order [ids]`, `move {id,after}` (exist) |
| Nested content cards | a key naming a card id walks into it: `{"k2":{"answers":{"add":{...}}}}` (exists) |
| Edit without rewriting | `{"<id>":{"text":"..."}}` patches one field (exists) |
| Full screen, vertically centred | **not confirmed**; probably a layout word, to add beside the six above (the instance can map it) |
| Interactive state | **missing**: a card holds only what was written; no value the owner's tap can change and an agent can read (see phase two) |

## A short schematic of /live's page.jsonl

```
{"content":{"add":{"id":"k2","type":"part-card","title":"…","preview":"…","text":"…","after":"k1","by":"voice-app","ts":"…"}}}   a card, newest on top
{"k2":{"text":"new text"}}                                       patch one field of card k2
{"k2":{"answers":{"add":{"id":"a1","text":"…"}}}}                a child list inside k2 (nesting = nested keys)
{"content":{"remove":"k2"}}   {"content":{"order":["k3","k1"]}}   remove / reorder
{"content":{"clear":true}}                                       blank the screen = one session ends
{"background":"gray"}                                            a page property
```

Replayed in order by `LiveLog` ([Live.js](../Live.js)) into a Map of cards. **A session is the run of cards between two clears.** The old cards live in the archive's own log ([../archive/readme.md](../archive/readme.md)).

## Phase two (noted, not built)

Cards with buttons. A tap writes one line to a file through the dev socket (the same socket the page already streams over, in the other direction), an agent's inbox or a task log picks it up, and the answer comes back as a patch on the same card. The card then holds interactive state (the "missing" row above). It needs the dev backend only (production is static and read-only), and it is the natural first thing for a `LivePage` instance to own, since the instance can validate the tap before it is written.

## Not done

Nothing here is built: no `LivePage`, no collapse view, no layout words for full screen or centred, no buttons. Part one's first slice (sessions) is also not browser-checked.
