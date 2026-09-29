# Dictate handover — read this before the next round

## What it is and where the pieces live

[Dictate](/framework/ux/Dictate/) is a mic button that turns speech into text using a local Whisper server. Two files matter:

- [`ux/Dictate/Dictate.js`](/framework/ux/Dictate/Dictate.js) — the mic button itself: capture, resending the growing recording to Whisper, the grey guess, the settled sentence.
- [`ext/Chat/Mic.js`](/framework/ext/Chat/Mic.js) — `ComposerMic`, a subclass that types speech into a chat composer's box and sends it as messages. **It belongs to Dictate**, even though it sits in `ext/Chat`. The chat drawing next to it (bubbles, scrolling, `Chat.js`) belongs to manager-new-card; leave it alone.

Try it: [/framework/ux/Dictate/demo/](/framework/ux/Dictate/demo/).

## The settings

Every knob is one exported object, `SETTINGS`, at the top of `Mic.js`. The gear on the composer edits it, saves it in `localStorage` (key `chat.mic.settings.2`), and all the code reads it live.

| Setting | Default | Meaning |
|---|---|---|
| `send_mode` | `"pause"` | `"pause"` sends at natural pauses and after silence; `"sentences"` never sends on silence; `"manual"` only Send or Enter sends. |
| `sentences_per_send` | `0` | 0 is off. N means one message per N finished sentences (the old way). |
| `paragraph_pause_ms` | `2500` | Quiet after a finished sentence that sends everything said so far as one message (the natural pause). |
| `pause_send_ms` | `4000` | Quiet before everything left on screen is sent, even an unfinished sentence. |
| `break_pause_ms` | `1500` | Quiet before the next segment may start a new paragraph (blank line) in the box. It also needs a finished sentence before it. |
| `guess_ms` | `900` | How often the growing sentence is re-sent to Whisper. Read when the mic starts. |
| `chunk_chars` | `1200` | Safety: a message this long is cut at the next sentence end. |
| `chunk_ms` | `60000` | Safety: words waiting this long are cut at the next sentence end. |
| `box_lines` | `7` | The box grows to this many lines, pushing the chat up, then scrolls. |
| `fillers` | `ah uh um er erm hmm mm` | Words that never reach the box or the log. |

Other numbers: `CHECK_MS` (250) is how often "pause" mode checks for silence. There is no 20k-character cap in the code: `chunk_chars` (1200) is the only length limit, and the 20000 in `Dictate.js` is the Whisper request timeout in ms.

## Rules learned the hard way

Each one says what broke.

- **The box is always `base` + `tail`, replaced and never appended.** One prompt reached 121,604 characters because the old code guessed the owner's text with `endsWith`, missed, and wrote the transcript on top of itself. So never use `endsWith` to find the owner's text, and never append the transcript. `base` changes only on a real input event (our own dispatch is flagged `own` and ignored).
- **Send commits everything on screen, the interim guess included, and resets `base`, `tail`, `held` and the partial in the same tick.** Anything less lets the next check send the same words twice. See `consume_sent()` and `send_screen()`.
- **A late final must not restore sent words.** Whisper's final for a segment can arrive after Send. `dropped` and `pending[].sent` remember what already went out, and `strip_words()` removes it from the final.
- **A live reload must wait while a mic is busy.** `Mic.js` registers `Socket.singleton().add_busy(...)` and asks every mic (`active()`), counting the gaps a plain "listening" check misses: engine check, permission prompt, device reopen, a message still posting. Without it a reload ate spoken words.
- **The box pushes the chat up and caps at about 7 lines** (`box_lines`). It keeps the tallest height it reached until emptied, so a guess that shrinks a line for a moment does not make the page jump.
- **The mic beeps on every stop**, not only a press: leaving the card, a dead device, an error. Silent stops looked like the mic had died.
- **Do not blank the guess at a pause.** `close_segment()` keeps the guess in `pending` until its final arrives; blanking it made the box lose a line and grow it back.
- **One mic at a time.** A card's page stays mounted when a sub-card opens, so two mics ran and every sentence posted twice. `start()` stops the previous one.
- **`log_prompt()` is overridden** so a sentence is not logged twice; **`draw_caption()` is overridden** to type into the box instead of a caption strip.

## How to test

- **Fake clock and fake Whisper.** The logic reads `performance.now()` and `Dictate.transcribe`, so a test replaces both: advance the clock past `pause_send_ms`, feed scripted answers, and check what `deliver(entry)` received. No real microphone is needed.
- **Headless on a real card.** Load a chat card in headless Playwright (never the owner's tabs), press the mic with the fakes in place, and read the box's value and the delivered messages. Drive it twice as long as you think: most bugs were a second send of the same words.
- **The demo** at [/framework/ux/Dictate/demo/](/framework/ux/Dictate/demo/) is the quick look with a real microphone.
- After editing `Mic.js` run `node --check` on it; a syntax error blanks the composer.

## What is open next

1. **Curated bubbles.** An `amend_bubble` tool that lets an agent replace a raw dictated bubble with sections, each citing the raw pieces it came from, expanding in place. The chat side is manager-new-card's; the tool and the citations are Dictate's.
2. **Raw kept in the box, tidied in chat.** Decide whether the box keeps the raw transcript while the chat shows a cleaned version.
3. **Dictated text turned into structure.** Lists, headings and paragraphs from speech, instead of one block.
4. **The prompt-interpretation proposal.** Not decided; find it on the AI board before starting.

See also [decisions](/framework/ux/Dictate/doc/decisions/) and [silence](/framework/ux/Dictate/doc/silence/).
