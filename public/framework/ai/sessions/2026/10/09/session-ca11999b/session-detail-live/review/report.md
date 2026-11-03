verdict: fix
1. [fix] None of the screenshots show the session page. The six shot folders are old task pages (2026-10-02 page-extends-item, task-audit, 2026-10-03 data-grid, prompts-live, push-to-talk, sessions-tab-polish). They were picked only because the diff appended `{"gone":true}` lines to their `page.jsonl`. So asks 3 and 4 (the conversation starts within ~200 px at 1400; the body fills the width; checked at 1400 and 3440) have no proof. The work is also not on michael/dev yet: `AISessionConversation.js` is missing from the main tree, so a live shot can't stand in.
2. [fix] The "N tool calls" lines land in the wrong place. In `AISessionConversation.add` these entries have no `at`, and `ext/Chat`'s `sync` sorts each batch by `Date.parse(a.at ?? 0)`, which puts them before every message. On the first load, every tool-call line would pile up at the top of the history instead of sitting between turns (ask 2).
3. [fix] A reply that also calls tools has its tool calls counted twice. `run += m.tools` runs before `flush()`, so the reply's tools go into the line drawn above it, and then `run = m.tools` counts them again in the line below it (ask 2).
4. [fix] Ask 1 said "stream, never poll", but `AISessionFollow.EVERY_MS` went from 3000 to 250: a range-request poll every 250 ms. The reason is stated in code and in `doc/session-cards.md` (the transcript lives outside the repo, so the dev socket can't watch it). It is still a poll, and the per-line server push remains open.
5. [note] Cards may not show "at their time" (ask 5). `add_card` uses `c.ts` from the item, falling back to now, and each card is synced in its own batch, so it is drawn after whatever is already on screen, not at its place in the timeline. If the cards stream arrives before the first transcript pull, cards are drawn above the whole history.
6. [note] The diff carries about 45 unrelated `files.jsonl`/`page.jsonl` "gone" lines across old task folders, plus `ai/files.jsonl` marking `CLAUDE.md`, `usage.json` and `tasks.json` as gone. That is watcher noise. It misled the shot picker (finding 1) and should not land with this task.
7. [note] `ext/Chat/Chat.js` and `Chat.css` were edited outside the fence (a `recent` window plus a "show earlier" button). Reusing the one chat component is right under law 6. The change touches every chat surface, though, and no chat surface was shot.
8. [note] `this.cards` is assigned after several awaits. If the page is deactivated first, the `Cards` stream is never unsubscribed.

Widths given: 400, 1200, 1920, 3440, all of unrelated pages (finding 1). None show the changed page, so every layout question below is answered `not measured` from the code.

## Requirements
- 1 "new lines from the tail append to the conversation in about 100 ms (stream, never poll)" — no — `AISessionFollow` polls every 250 ms through `on_lines`. It appends live, but by polling (finding 4).
- 1b "Keep scroll position unless the reader is at the bottom" — yes — handled by `ext/Chat`'s `sticky_scroll`, and `load_earlier` keeps the offset. Not measured.
- 2 "show the assistant's text replies too … maybe a one-line collapsed '12 tool calls'" — partly — replies are drawn, but the tool-call lines are misplaced and double-counted (findings 2 and 3).
- 2b "reuse the existing chat/bubble component" — yes — `AISessionConversation` uses `ext/Chat`'s `chat()`.
- 3 "title not truncated" — yes — `title: id`, and the `slice(0, 8)` is gone.
- 3b "Template … moves inline into that header line as a small link to the source" — yes — `.sessions-detail-head` holds the back link, the id and the `AISessionDetail.js` link.
- 3c "conversation starts within the first ~200 px at 1400 wide" — not measured — no shot of the page (finding 1).
- 4 "the body fills the panel; side cards flow into columns … Shoot at 1400 and 3440" — not measured — `cols main-aside` is a real framework word (framework.css:972), but nothing was shot.
- 5 "a 10-line design note in doc/ … one card the mastermind can post that shows up live" — yes in code — `doc/session-cards.md` (13 lines) chooses `page_add` on the session's `page.jsonl`, which avoids a second card system. Timing is in doubt (finding 5), and there is no proof the card was posted and seen.
- "leave room for" a Refine button per prompt — n/a
## Page structure
- not measured — no shot of the session page. From the code: one header line, then the conversation in the main column and the cards in the aside.
## Navigation
- techniques — a back link ("← all sessions"); the page has its own route
- route — yes — `url: home.url + id + "/"`
## Layout
- not measured — `cols main-aside` (68/32) puts the conversation in the main column; unverified at any width.
## Sizing
- not measured — `.sessions-conv .chatbox-log { max-height: 80vh }` caps the conversation's height, which leaves a scroll box inside the page at 3440; unverified.
## Wrapping
- not measured — the header uses `wrap`, and the id uses `overflow-wrap: anywhere`, so a uuid can break at 400.
## Spacing and padding
- not measured — the code uses tokens only (`--gap-35`, `--gap`, `gap-50`), which is correct.
## Colour and contrast
- not measured — the template link is `muted` at 0.8em; check its contrast once the page is shot.
## Flow
- not measured — the cards in the aside (costs → session → spawn → trace → related) are reordered with costs first, which seems sensible.
## Words
- content — yes — `NO_TRANSCRIPT` is a plain full sentence that names the cause.
- doc — yes — `doc/session-cards.md` says what was chosen, why, and lists three open items; the readme links it in one line.
