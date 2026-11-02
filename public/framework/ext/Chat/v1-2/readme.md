# Chat V1.2: V1 drawn from `session.messages`, with a send cursor and one green check

V1.2 is V1 (`../Chat.js`, the bubbles you already know) fed from `session.messages` ([core/Session/Chat](/framework/core/Session/Chat/readme.md)) instead of `{chat}` lines, with one ✓ that shows how much of what you said the assistant has. The owner asked for it as "an additional version, add it to the list so we can try it out", to replace V1 once it works (2026-11-02). V1 itself is untouched.

Try it: [/framework/ext/Chat/v1-2/](/framework/ext/Chat/v1-2/) draws [fixture/session.jsonl](fixture/session.jsonl); `?src=<url of any session.jsonl>` draws that session, live. Live, with the mic: **V1.2** in the version dropdown of the ✦ sheet and the drawer's AI tab (`ext/drawer/ChatView.js`). On a session page, the Chat tab has a **Chat V1.2** chip (`?tab=chat&chat_view=v1-2`).

## What you see

- **The bubbles are V1's**, so the layout, links, read-aloud highlight and ordering rules are V1's, and `Server/ChatV1Compare.mjs` stays at 0 differing bubbles.
- **One ✓ after the last sentence the assistant has.** A sentence is "had" when it is not newer than the newest Prompt's `sent.fast.at`. Sentences after the ✓ are dimmed: they are said, but not sent yet. When a sentence goes out the ✓ moves forward to its end.
- **The ✓ is dim while words wait, and lit green (`--ok`) once it has caught up.** A slow CSS fade, no per-sentence grey/green flashing.
- **The words still being spoken** (the live Whisper guess, before any sentence ends) show as V1's own growing draft bubble, after the ✓: `ChatV1Dot2` listens for the composer's `chat-live` window event, the same one V3 uses, and passes it to V1's `live()`. Start the listener with `live()`; `listen(false)` or `unsubscribe()` stops it.
- **No 🧠.** One assistant, one mark. The `sent.smart` stamp is still written, just not drawn here.

## Files

- `ChatV1Dot2.js`: `class ChatV1Dot2 extends JSONL`. Replays every line into a real `Session`, turns `V1Bubbles.events(session)` into V1 `{chat}` entries (first sight of an id as is, a changed text again as a `fix`), and hands them to V1's `chat({source})`, then calls `send_cursor.mark()` after each `sync()` because V1 rebuilds its text nodes on every fill.
- `SendCursor.js`: the ✓ and the dimming, one class with `start()`/`stop()`, `static id = "send-cursor"`, `static defaults = {on: true}` so a settings list can switch it. `stop()` leaves plain V1.2. The ✓ element is the shared `../cursors.js` `cursor_el()`.
- `ChatV1Dot2.css`: the dim and lit states (`@layer site`; only `--ok` and `--draft-ink`). It restyles no bubble.
- `page.js`, `fixture/session.jsonl`: the demo.
- `ChatV1Dot2.test.mjs`: headless proof (below).

## Pictures

[Phone, test end state](doc/v1-2-360.png) · [demo at 360](doc/demo-360.png) · [demo at 1920](doc/demo-1920.png), with the shared Claude-style layout. The ✓ is the shared `.chat-cursor`; the assistant's round avatar on a Reply is V1's own role avatar, not the removed 🧠 mark.

## Test

`FENCE_SERVEX=1 node ChatV1Dot2.test.mjs [base-url] [shots-dir]` (default base `http://monorepo.localhost`; the fence keeps it off the live Servex). It drives `ChatV1Dot2.read()` at 360×740 with the phone UA: one bubble growing sentence by sentence, a live draft after the ✓, the ✓ after each `sent` mark, dimmed then lit green, no 🧠, a `clean` edit in place, a Reply as its own bubble, `stop()`/`start()`, no page errors. 18 checks, including the live draft bubble after the ✓ and the sheet/drawer dropdown mounting V1.2.

## Decisions

- **"Dim when sent" is read as "dim while words wait":** the ✓ is dim exactly while some ended sentence has not been received and lit when all are. Alternative: dim for a fixed time after each send, which would flash even when the assistant is instant. Revisit if the owner wants the other look.
- **Wrap V1, don't copy it** (law 6): V1.2 feeds V1's own `chat()` synthetic entries, so a V1 fix lands here too. Alternative: a subclass of V1's internals, which has none (it is a function bag).
