# Dictate architecture — two engines, one stream, live partials

[`Dictate.js`](../Dictate.js) is the main class, extending [`View`](/framework/core/View/). It opens a microphone, captures audio, sends segments to whisper-server (a local binary), transcribes live with grey partials, and commits finished utterances as log lines. Two engines: whisper first (private, fast), falling back to the browser's `SpeechRecognition` (Google's servers). Support modules: [`Capture`](../capture.js) (audio sampling), [`MicIndicator`](../MicIndicator.js) (state badge), [`floor.js`](../floor.js) (timestamp helper). Chat display: [`ux/Dictate/chat.js`](../chat.js), a factory function used by every surface (drawer, page, Refine).

## Two engines, whisper tried first

**Decided:** `Dictate.start()` checks whisper-server's health (timeout 2.5s on phone, 800ms on desktop); if unreachable, falls back to the browser engine. Once whisper has answered on a tab, `whisper_seen` localStorage flag prevents silent fallback on the next session.
**Why:** The browser engine sends audio to Google, is slow to start, and can finish a whole session with no result and no error — a 6-second watchdog and an explicit "has gone quiet" message fix the silent failure. Whisper is measurably faster (89–98ms for live partials) and private.
**Instead:** Browser engine only (no extra install); whisper only (fails gracefully on non-Windows); always retry whisper (noisy, wastes time when truly unreachable).
**Detail:** [`doc/decisions.md`](./decisions.md#why-the-browser-engine-was-silent-for-the-owner)

## Segments, not whole-session re-sends

**Decided:** Audio is split into segments (closed by ~700ms pause or 15s cap). Each partial resend transcribes only the current segment's growing buffer; closing a segment transcribes it once more (final), appends the result, and opens a new segment.
**Why:** Cost per resend stays O(segment length), not O(total time). A live partial is a guess before a pause; closing a segment is "I heard a sentence" — two different points.
**Instead:** Re-send the whole session every tick (cost grows with time); batch segments without live feedback (no grey text).
**Detail:** [`doc/decisions.md`](./decisions.md#why-whisper-isnt-wired-as-one-request-per-keystroke-of-silence)

## Epoch and sequence tickets, not locks

**Decided:** Partial resends and segment closes both call `transcribe()`. A `req_seq` ticket and a `segment_epoch` on each response catch races: if a newer request landed, or the segment closed while the old request was in flight, the answer is dropped.
**Why:** `close_segment()` can fire from both a heartbeat pause AND a manual stop press. Two requests both succeed independently; only the newest wins.
**Instead:** A lock (slower, complex); retry/queue logic (falls behind live audio).
**Detail:** [`doc/decisions.md`](./decisions.md#the-epoch-guard--the-one-real-concurrency-trap-here)

## Grey partials in a separate caption, not the target textarea

**Decided:** A live grey guess is drawn in `Dictate`'s own caption element (CSS `.muted`). The target textarea is only touched once a segment is final — always an append, never a rewrite.
**Why:** A textarea's `.value` rewrite every ~1.5s clobbers an edit in progress. The caption can style grey/settled without fighting the DOM.
**Instead:** Simulate grey in the textarea (overwrite on every tick); grey in a hidden `<pre>` below the textarea (awkward positioning).
**Detail:** [`doc/decisions.md`](./decisions.md#why-the-grey-partial-text-never-touches-the-real-textarea)

## One microphone at a time

**Decided:** `Dictate.start()` stops every other live mic on the page first. Tracked in a module-level `LIVE` set; every Dictate instance registers itself.
**Why:** A page can mount the mic in six places: the Dictate demo, the ✦ sheet, the drawer's AI tab, push-to-talk hidden, Refine. Pressing one should stop all others.
**Instead:** One mic per surface, each surface syncs with others (complex); desktop only (breaks phone).
**Detail:** [`doc/decisions.md`](./decisions.md#one-engine-per-tab-not-one-per-mic-button)

## Send on pause: explicit default, opt-in countdown

**Decided:** Pressing the button or shortcut stops; pressing again starts. A checkbox ("stop after a pause," off by default) adds 2.5s silence detection with a visible countdown ("stopping in 1.8s…").
**Why:** A transcript that auto-submits on a pause with no warning loses trust. Explicit send is safe; a visible countdown makes the automatic mode discoverable.
**Instead:** Make pause configurable to end the session (700ms and 2.5s are different: one closes a segment for transcription, the other should end a whole turn); always auto-submit (silent).
**Detail:** [`doc/decisions.md`](./decisions.md#send_on_pause-explicit-by-default-an-opt-in-countdown-never-a-silent-auto-submit)

## Keyboard shortcut Ctrl+Shift+M routed by focus

**Decided:** The same hotkey starts/stops the mic on whichever `Dictate` instance has focus (e.g., a specific reply box), or whichever one is already listening (to stop what's running). Never a global target.
**Why:** A page can have many mics; one global shortcut would be ambiguous.
**Instead:** Alt key, global target, settings page to find it.
**Detail:** [`doc/decisions.md`](./decisions.md#the-keyboard-shortcut-ctrl%2Bshift%2Bm-and-why-not-the-obvious-ones)

## Logs via Servex, fallback to dev server

**Decided:** Each finished utterance (segment or `isFinal` browser result) calls `post_prompt()`: POST to Servex's `/log/prompts` with 1.2s timeout. On failure, falls back to the dev server's `Server/plugins/SocketServer/Append.js` (writes `framework/ai/prompts.jsonl`).
**Why:** Servex is the single writer for all logs. Fallback ensures dictations are never lost even if Servex is down.
**Instead:** Servex only (log lost on downtime); dev server only (no integration with task system).
**Detail:** [`doc/decisions.md`](./decisions.md#voice--log-added-2026-09-22)

## Whisper started lazily by dev server

**Decided:** `Server/plugins/Whisper.js` checks if whisper-server is already running, starts it on first `Dictate` use if installed, kills it with the dev server, restarts it up to 3 times on crash.
**Why:** Zero setup for the user; no separate terminal window or manual step.
**Instead:** The user double-clicks `whisper.cmd` each session (manual); Windows scheduled task at login (GPU idle cost).
**Detail:** [`doc/decisions.md`](./decisions.md#who-starts-whisper-server)

## Unfenced despite "imports flow down" — one real direction, not a cycle

**Decided:** `ext/Ask/reply.js` imports `ux/Dictate/Dictate.js` (ux imports ext). No imports from `ux/Dictate` reach back to `ext/Ask`.
**Why:** The CLAUDE.md rule guards against cycles; this has none. `Dictate` is an assembled system (not a foundational utility like `ext/Draggable`), and a UI component consuming another UI component is normal.
**Instead:** Move `Dictate` to `ext/` (renames ~30 files); add a second channel for ext→ux (duplicate wiring).
**Detail:** [`doc/decisions.md`](./decisions.md#ext%2FAsk-importing-ux%2FDictate--checked-against-%22imports-flow-down%22)

## The phone sheet is the sidebar's collapsed form

**Decided:** on a phone, one sheet holds the mic and the text; open to full, it becomes the whole sidebar (chat plus the tab row) rather than a second, separate UI.
**Why:** two surfaces drift apart; one component in two sizes means a fix lands on both.
**Instead:** a phone-only chat sheet with link buttons into the sidebar (the pair diverges).
**Detail:** [`doc/next.md`](./next.md), [surfaces](/framework/ux/Dictate/surfaces/)

## Bubbles are placed by time, and one mic feeds every result

**Decided:** a drawn bubble is inserted before the first bubble with a later `at` (`Chat.js` `place()`); Refine takes its raw text from the `chat()` session, not from a mic of its own.
**Why:** replies arrive out of order, and two mics in one page give two different results for the same speech.
**Instead:** append in arrival order (a late reply lands under the wrong sentence); a second mic for Refine.
**Detail:** [`doc/next.md`](./next.md), [asks.md](./asks.md)

## Reach the mastermind through a tool, not by automating the Claude app

**Decided:** the voice-chat bridge could be a small read-mostly connector over Servex's `send_to_agent`/`read_card` tools (test with one `ask_mastermind` tool first); the fallback is a spoken reply in our own sheet via `speechSynthesis`. A browser tab driving claude.ai is not built.
**Why:** tab automation is fragile, replies arrive a turn late, and it runs against the consumer terms; a tool call keeps the speaker's voice and the agent's answer separate.
**Instead:** the browser bridge (fragile, terms risk); speech only (robotic voice, no interruption handling).
**Detail:** [`doc/voice-bridge.md`](./voice-bridge.md)

## The fast assistant answers only when addressed by name

**Decided:** the fast assistant replies when a sentence names "fast"; a sentence that names "smart" is a skip.
**Why:** measured, it answered about half of the sentences addressed to the smart one, with guesses the smart one then corrected.
**Instead:** reply to everything (noise, wrong guesses).
**Detail:** [`doc/next.md`](./next.md) (Next 4, item 1)
