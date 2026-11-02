# ext/Chat/list — the simplest live view of a session's chat list

`ChatList` draws `session.messages` ([core/Session/Chat](/framework/core/Session/Chat/readme.md)) as bubbles, in the list's order: the owner's Prompts on the right (their words as said, or the refined title and text), replies on the left, Servex's notes small in the middle. It is the proof that the list alone is enough to draw the chat; Chat V3 ([../v3/](../v3/readme.md)) is the designed view.

## Use

```js
import ChatList from "/framework/ext/Chat/list/ChatList.js";
new ChatList({ url: "<a session.jsonl url>", $box: div.c("chatlist") }).live();
```

- It replays only the list lines (`messages`, `sentences`) into a `Session`, never V1's `{chat}` lines.
- Live: `ext/JSONL`'s `live()` streams new lines; the Session's `"delta"` event names the Message that changed, and only that bubble is refilled. A new message appears without a reload (29 ms in the headless check).
- Demo: [/framework/ext/Chat/list/](/framework/ext/Chat/list/) draws `fixture/session.jsonl`, a session written by Servex's real writer (`CHAT_FIXTURE=<path> node Servex/agents/chat-messages.test.mjs` rewrites it); `?src=<session.jsonl url>` draws any session.
- CSS prefix `chatlist-` (`.chat-list` is ext/Ask's).
