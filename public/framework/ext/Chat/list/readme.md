# ext/Chat/list — the simplest live view of a session's chat list

`ChatList` draws `session.messages` ([core/Session/Chat](/framework/core/Session/Chat/readme.md)) as bubbles, in the list's order: the owner's Prompts on the right (their words as said, or the refined title and text), replies on the left, Servex's notes small in the middle. It is the proof that the list alone is enough to draw the chat; Chat V3 ([../v3/](../v3/readme.md)) is the designed view.

## Use

```js
import ChatList from "/framework/ext/Chat/list/ChatList.js";
new ChatList({ url: "<a session.jsonl url>", $box: div.c("chatlist") }).live();
```

- It replays the list lines (`messages`, `sentences`) plus `tasks` (so a same-file Ref can find its target) into a `Session`, never V1's `{chat}` lines.
- A `Ref` member (a root task, or a spawned child session, step 3) draws as `RefView` (`DefaultView.ref_view()`, `ux/Content/Object/DefaultView.js`), not a chat bubble — a `.chatlist-msg.is-ref` row showing the target's own live state, since `ChatList` holds none of its data. `paint()` keys every row, Ref included, through the shared `DefaultView.place()` loop (one placement loop, Law 6) — see [core/List/readme.md](/framework/core/List/readme.md#watch-out).
- A card's `icon`, `title` and `content` lines (`fill()`) are drawn through `note_view`, imported from `../v3/placement.js` — the one DOM-free decision shared with Chat v3, so the two views never drift (a `{type:"Ref"}` content line gets the same label either view would show it).
- Live: `ext/JSONL`'s `live()` streams new lines; the Session's `"delta"` event names the Message that changed (`owning_message()` walks a changed `content` member's `.parent` up to the Message that owns it, the same way `ChatV3.card_for()` does), and only that bubble is refilled. A new message, or new content on an existing card, appears without a reload (29 ms in the headless check).
- Demo: [/framework/ext/Chat/list/](/framework/ext/Chat/list/) draws `fixture/session.jsonl`, a session written by Servex's real writer, with one root task's Ref at the bottom (`CHAT_FIXTURE=<path> node Servex/agents/chat-messages.test.mjs` rewrites it); `?src=<session.jsonl url>` draws any session.
- CSS prefix `chatlist-` (`.chat-list` is ext/Ask's).

## Test

`node ChatList.test.mjs [base-url]` (headless Playwright, 6 checks): a note upgraded with a title/icon, then content appended to it, both redraw live without a reload; the icon draws inline with the title; no page errors.
