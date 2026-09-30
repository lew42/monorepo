# Chat — a chat log that follows new messages only while you are at the bottom

## Use

```js
import { chat } from "/framework/ext/Chat/Chat.js";

const talk = chat({ source: () => entries, keep: e => true, answer: choice => send(choice) });
talk.view;    // the scrolling box — place it anywhere
talk.sync();  // draw whatever is new; call it whenever `entries` changes
```

Markdown is safe (`md.js`), role labels are coloured (`roles.js`), and `Composer.js` is the input.

## ChatPanel — the log, the composer and the mic, as one widget

`ChatPanel.js` wraps `chat()` and `composer()` into one class, so a host — the
desktop drawer's AI tab, the mobile sheet, a card — builds the exact same
widget instead of its own hand-rolled copy. Its height starts small and grows
with what is said, up to `--chatbox-panel-max` (a CSS variable the host sets;
70vh by default), then only the log scrolls — no JS measures anything, see
`Chat.css`'s `.chatbox-panel`.

```js
import { ChatPanel } from "/framework/ext/Chat/ChatPanel.js";

const panel = new ChatPanel({ source: () => entries, deliver: async entry => post(entry) });
panel;          // a View — append it anywhere; it IS the widget
panel.sync();   // draw whatever is new in source() — call after entries change
```

With no `source`/`deliver`, the panel keeps its own list: `panel.say(entry)`
appends and draws — the whole API a first caller needs. `re`, `mic`,
`autostart`, `placeholder`, `hint`, `sent`, `failed`, `max`, `revise` pass straight
through to `composer()` (see `Composer.js`'s own doc comment for what each
does). Live, with v1 (the old, hand-wired assembly) beside it:
[/framework/ext/Chat/panel/](/framework/ext/Chat/panel/).

`revise: "clean" | "edit" | "summary" | false` (default `false` here; [AI 2](/framework/ai2/)
turns on `"clean"`) runs [`ux/Revise`](/framework/ux/Revise/) on this composer's mic — a
different pipeline from `Server/doc/refine.md`'s batch `clean`/`structured` rungs; same words,
unrelated systems. Only the `"clean"` level does anything special here — `"edit"` and
`"summary"` just run `on_revised`/`on_revise_failed` as `ux/Dictate/readme.md` describes, with
no box swap. With `"clean"`, `ComposerMic` (`Mic.js`) now swaps each finished utterance's raw
words for the fast assistant's clean-up IN PLACE, right in the box — raw shows first, clean
replaces it once `/api/tidy` answers, same idea as the still-moving Whisper guess it already
showed. A small **"raw" chip** beside ⋯/⚙ is a toggle button: click it and the whole box swaps,
in place, to exactly what Whisper heard; click again to swap back to clean — nothing opens in a
popover or separate panel. The composer's own gear (⚙) has a **"clean transcription"**
checkbox next to the other mic settings — this is `Mic.js`'s `SETTINGS.clean`, the kill
switch, on by default, remembered the same way as the other settings. Whichever text is in
the box when a message is sent is what goes out; the raw words still ride along on `entry.raw`
(`entry.level: "clean"`), and a pending clean-up is waited for at most ~5s
(`Mic.js`'s `await_clean()`) before falling back to raw, so nothing is ever lost and nothing
sends twice — that same wait is what `on_revise_failed` (see `ux/Dictate/readme.md`) resolves
early: a failed clean-up doesn't make `await_clean()` sit out the full 5s, it just leaves the
raw text showing. `ai/2026-09-29/audio/next-clean-transcription/a-clean-mode/`.

## The universal chat line — one shape for voice, typed, and an agent's own reply

`voice-sessions/design.md`'s one turn shape, logged by any surface:

```json
{"chat": {"at": "2026-09-29T19:00:00Z", "session": "s1", "path": "/framework/ext/Chat/",
  "from": {"kind": "owner", "id": "owner"}, "via": "voice", "text": "…", "re": "optional-card-id"}}
```

`chat()` maps it onto its own bubbles: `from.kind === "owner"` is your bubble
(right side); anything else — `"assistant"`, `"agent"` — is a reply (left
side), labelled by `from.id` if it has one, else `from.kind`. `via` ("voice"
or "text") draws a small 🎤/⌨ mark before the words. A LATER line with the
SAME `at` and `fix: true` replaces that piece's words in place — a
correction, not a second message. `place: {module, id, ...}` swaps the words
for that `ux/Content` module's own card (`new Module({ id, ... })`, the exact
contract `page.jsonl`'s own `"place"` lines already use) — e.g. a Question
card right there in the log.

The OLD shape (`{type, by, text, id}` — what AI 2 and the drawer still log)
keeps working exactly as before; a universal `{chat: {...}}` line is a
completely separate path through `chat()`, so nothing about the old one
changed. Demo, both shapes in one log: [/framework/ext/Chat/](/framework/ext/Chat/).

## Watch out

- Smart scroll: at the bottom it follows; scroll up and it freezes; scroll back down and it follows again. [doc/scroll.md](./doc/scroll.md)
- One bubble per run: same sender, under `MERGE_GAP_MS` (10 s) apart, nobody between → one bubble, one paragraph per message; drawing only, the log stays separate. Every bubble is `--chat-bubble` wide.
- A `{type:"refined", of, sections:[{text, from}]}` line replaces a merged owner bubble's raw paragraphs with its sections; a section opens in place to the raw pieces it cites, and a click on the bubble opens all raw pieces.
- A line is drawn once and never moves, so call `sync()` as often as you like.
- Every class is `chatbox-*`.

## More

- Page: [/framework/ext/Chat/](/framework/ext/Chat/) · used by [AI 2](/framework/ai2/)
- `ChatPanel` — v1 vs v2, small vs capped-and-scrolling: [/framework/ext/Chat/panel/](/framework/ext/Chat/panel/); wired into the desktop drawer's AI tab and the mobile ✦ sheet (`ext/drawer/tabs/ai.js`, `ext/drawer/rail.js`, `ai/2026-09-29/audio/c-chat/`) — the old, hand-wired builds stay reachable as `aiV1` and `DrawerRail.SheetV1`/`.SheetLinksV1`.
