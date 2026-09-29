# Chat — a chat log that follows new messages only while you are at the bottom

## Use

```js
import { chat } from "/framework/ext/Chat/Chat.js";

const talk = chat({ source: () => entries, keep: e => true, answer: choice => send(choice) });
talk.view;    // the scrolling box — place it anywhere
talk.sync();  // draw whatever is new; call it whenever `entries` changes
```

Markdown is safe (`md.js`), role labels are coloured (`roles.js`), and `Composer.js` is the input.

## Watch out

- Smart scroll: at the bottom it follows; scroll up and it freezes; scroll back down and it follows again. [doc/scroll.md](./doc/scroll.md)
- One bubble per run: same sender, under `MERGE_GAP_MS` (10 s) apart, nobody between → one bubble, one paragraph per message; drawing only, the log stays separate. Every bubble is `--chat-bubble` wide.
- A `{type:"refined", of, sections:[{text, from}]}` line replaces a merged owner bubble's raw paragraphs with its sections; a section opens in place to the raw pieces it cites, and a click on the bubble opens all raw pieces.
- A line is drawn once and never moves, so call `sync()` as often as you like.
- Every class is `chatbox-*`.

## More

- Page: [/framework/ext/Chat/](/framework/ext/Chat/) · used by [AI 2](/framework/ai2/)
