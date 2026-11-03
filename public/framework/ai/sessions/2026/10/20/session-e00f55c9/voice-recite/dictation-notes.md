# Dictation notes for Recite

Notes from the dictation-map task ([../dictation-map/](../dictation-map/)), which owns Whisper and the chat views. Recite owns reading replies aloud. This file says where the two meet.

## For voice-recite (from dictation-map, 2026-11-01)

**Where a reply's text becomes available.** There are three places, in time order:

1. **While the reply is being written (partial text).** Servex streams the smart seat's reply on the session's live wire. `Sessions.streaming()` (`Servex/agents/Sessions.js:1506`) pushes `{kind:"stream", role:"smart", text}` every 80 ms, with the whole text so far, and an empty `text` when the reply ends. The page receives it in `ux/Dictate/chat.js:300` (`Session.stream(id, ev => …)`, an `EventSource`), which calls `panel.stream(role, text)`. The fast seat is never streamed.
2. **When the reply is settled (final text, today).** `Sessions.heard()` (`Sessions.js:1437`) writes `{chat:{from:{kind:"assistant", id:"smart"}, text, re}}` into `session.jsonl`. It reaches the page as `{kind:"line"}` on the same wire, and `chat.js` `draw_line()` draws it. This is 94% of replies today.
3. **When the reply is settled (final text, the plan).** A Prompt `replies.add` line, `{ "<p-id>": {replies:{add:{id, text, by:"smart"}}} }`. Chat V2 and V3 read it. Today only 6% of replies use it. [../dictation-map/plan.md](../dictation-map/plan.md) step 4 makes Servex write every reply this way.

**Where Recite should plug in: one event, not inside a view.**

- **Recommendation:** listen to the session's live wire (`ext/Session/Session.js` `stream()`), not to any chat view's DOM. All three views (V1, V2, V3) are fed by that one wire, so Recite works whichever chip is on and survives the move from V1 to V3.
- **Start reading on the partial:** `{kind:"stream", role:"smart"}`. Speak each sentence as it completes; the text only grows, so a sentence that has ended is safe to speak.
- **Confirm on the final line:** a `{chat}` line from the smart seat now, a Prompt `replies.add` once plan step 4 lands. Recite should accept both.
- **Skip a lone emoji.** It becomes a reaction, not a bubble (`LONE_EMOJI`, `Sessions.js:66`).

**Where a playback line can sit in the view.**

- **One bar for the session:** the `Recite.Bar` sits in the sheet's footer, directly above the mic (`ux/Dictate/DictationBar.js`, the phone sheet's one big mic). It is always visible, it is one line, and the mic button for barge-in is right beside it.
- **Per reply:** a small ▶ at the start of each reply. In V1 that is the reply bubble (`ux/Dictate/Widget.js`, drawn by `Thread.draw`; the live reply by `Widget.stream`). In V3 it is the reply row inside the Prompt card (`ext/Chat/v3/ChatV3.js`). Tapping it moves the bar's playhead to that reply.

**Barge-in and the mic.**

- **The mic level is already measured.** `ComposerMic.on_level()` (`ext/Chat/Mic.js`) measures it, and `ux/Dictate/floor.js` marks "speaking"/"done".
- **Recite can listen to the floor.** `floor` changing to "speaking" is the fast pause signal, so Recite does not need to open a second `MicStream`.
- **Whisper's silero VAD is the check.** Empty text means it was noise. This matches Recite's plan §3.

**One thing to agree on.** The plan above changes where a settled reply lives (`{chat}` becomes Prompt `replies`). If Recite reads the wire's partial stream first, that change does not affect it.
