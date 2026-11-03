# Routing: the sheet and the URL (findings and choice)

Read from the code by task-mastermind-2 (the minion pool was full, so no helper). Asked in [the handoff](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/handoff.md), "Routing".

## What exists

| Question | Answer (file) |
|---|---|
| Does the sheet persist its open state? | Yes, through the URL and history: a reload at `<page>/ai/` reopens it; its size lives in `history.state.sheet`. On the phone it opens in place (same url, size in history only). `ext/drawer/Sheet.js:57-77, 104-138`. So today the sheet DOES own the path (`<path>/ai/`), which is what the owner dislikes. |
| Is the session page's chat the same component as the sheet's? | The sheet's **v2** chip and the session page's "Chat v2" chip both draw `ChatV2` (`ext/drawer/ChatView.js`; `ai/AISession/AISessionDetail.js:33,268-285`). V1 is two different drawers. So V2 is already one component in both. |
| How does a session page keep a chat choice on reload? | A query variable: `?chat_view=v2`, written with `URLSearchParams` (`AISessionDetail.js:281`). A tab: `?tab=chat`. |
| A deeper subpath under a session? | `AISessionDetail.route(name)` passes names to `below()` (`AISessionDetail.js:49`) and `StoreFolder.child()` (`StoreFolder.js:100-108`) builds children from the folder. So `/…/<session>/<item id>` needs a `below` that returns an item-detail page: small, but it is real router work. |

## Options for the item detail ("click a card, open its detail, way back")

| | (a) UI state only | (b) a query variable, e.g. `?item=<id>` | (c) subpath `<session>/<item id>` |
|---|---|---|---|
| Survives reload | no | **yes** | yes |
| Reuses | nothing | `chat_view`'s pattern, one `URLSearchParams` helper | the router's `below`/`StoreFolder.child` |
| Cost | ~20 lines | ~40 lines, same code for the sheet and the page | ~120 lines, page only |
| Back button | needs history entries | `pushState` of the query = the browser's back works | free |
| Breaks | reload loses the spot | nothing; a stale id shows "gone" and the list | sheet cannot use it (it must not take the path) |

## Choice (built in step E, after the chat-live step)

- **Item detail = a query variable in BOTH places**: `?item=<prompt/task/question id>` (the way back is the browser's back, plus a visible "← chat" link). One small function in `ext/Chat/v2/` reads and writes it, so the sheet and the session page behave the same.
- **A session's own page also gets the dynamic subpath later** (`/…/<session>/<item id>`), only if the owner wants shareable item links; it is option (c) on top of (b) and is queued, not built.
- **The sheet keeps `<path>/ai/` for now.** Moving "sheet open" itself to a query variable (`?sheet=…`) means rewriting `Sheet.js` `arrive()`/`open_at()` and its readme (`ext/drawer/doc/sheet.md` records the `<path>/ai/` choice as deliberate on 2026-10-20). That is the page system's file, so it goes to its owner as a proposal, not an edit from here.
