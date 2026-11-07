# /live/: the stream reconnects by itself, and a new sub-page gets its card

@voice-app relayed the owner's report on 2026-11-06. The owner's words are in voice-app's session log. Branch: `worktree/live-r12`.

## Asks

- [x] **/live/ streams again without a reload.** The header showed about 1.4 million ms (23 minutes stale), and new lines appeared only after a refresh.
  - **Cause:** the dev socket was open but dead: a phone that slept, or a tunnel or proxy that lost one side. The browser never reports a `close` then, so the existing reconnect never ran.
  - **Fix:** `Socket.alive()` ([Socket.js](/framework/dev/Socket/Socket.js)). While the tab is visible, it pings every 30 s, and at once when the tab is shown again or comes back online. After 5 s with no answer, it opens a new connection, and ext/JSONL/live.js resubscribes each stream from its offset.
  - **Proof:** a headless probe made the socket swallow every frame and fired `visibilitychange`. The missed line drew about 5 s later, and the next line streamed normally.
- [x] **A sub-page made with `pages.add` gets a link card by itself.** On a LivePage parent, `Subpages.add` (Servex/agents/Subpages.js) also appends `{"content":{"add":{"type":"part-link","id":"link-<name>","path":"./<name>/","title":…}}}`.
  - **Proof:** Subpages.add was run on a scratch LivePage. The card drew with the sub-page's title and description, and there were no errors.
  - **Caveat:** this is Servex code, so it goes live at the next Servex restart (not mine to do). Until then, voice adds the card by hand, as it did for /live/item-read/.
- [x] **A link card shows its sub-page's description, even when that answer comes from the cache.** A cached answer came back before the card was on the page and was dropped (LivePage.Preview).

## Decisions

- **The card is data, written once by the tool.** It can be moved, edited or removed like any card.
  - **Alternative:** compute a card from each `file` line at replay. That would also be live without a restart, but every old sub-page of /live/ would jump from the Pages footer into the content.
  - **The Pages footer stays** for sub-pages that have no card.
- **A heartbeat, not polling:** no data rides the ping. The server's own 25 s protocol ping cannot tell the page anything, because the browser answers it on its own.
