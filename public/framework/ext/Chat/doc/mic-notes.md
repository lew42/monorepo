# Mic.js notes

The long comments pruned from `Mic.js` (2026-10-12), kept word for word, one heading each. The code points here with `// see doc/mic-notes.md#heading`.

## Overrides (why this is a Dictate subclass)


THE MICROPHONE of a composer: `ux/Dictate` with a few methods redirected, and
`ux/Dictate` itself untouched. Speech goes into the composer's own text box
(`field`); when the speaker has been quiet long enough the words go out as ONE
message through `deliver(entry)`.

⚠ `log_prompt()` — Dictate posts every finished utterance on its own. A composer
that also posted from its `on_text` callback would log every dictated sentence
twice; overriding the one method that builds the entry is how a sentence carries
`re` instead.
⚠ `draw_caption()` — Dictate's own grey caption strip is a row under the button,
which would grow the composer. It types into the box instead.


## Start and stop sounds

The two sounds: a rising pair when the mic starts, a falling pair when it stops


## Settings

EVERY KNOB OF THE WHISPER-TO-BOX FLOW lives in this one object (the owner, 2026-09-25); the gear on the


## Settings: manual send mode

"manual" (Send/Enter only, nothing ever auto-sent) still WORKS if something sets it directly,
but merge 11 ("one widget," 2026-10-01) removed every way to reach it: it is no longer a
`MODES` row (`ux/Dictate/Widget.js`) or a gear choice (`settings_panel()`, below) — autosend
is the default and the only behaviour a reader can pick, everywhere.

## Settings: paragraph_pause_ms history

2026-10-01 — the owner asked for "500 to 1000 milliseconds" so a finished sentence goes out quickly;
was 1500, then 2500 before that. `can_break()` still requires the sentence to actually END in
`. ! ?` first — a pause mid-sentence is only a breath, never a send.)

## Settings: box_lines history

mastermind's decided shape: a textarea, one line empty, 3 lines ceiling (the owner's 2026-10-04 cap kept),
`doc/one-input-2026-10-12.md`. Was 3, round 2, 2026-10-04 — the owner: "as I
hit transcribe, the text area grows… gets so big I can't read anything else"
— before that 7.)

## Settings: clean kill switch

on, a composer built with `revise:` set (`ai2/compose.js` turns it on by default)
actually runs the fast assistant's clean-up; off, every utterance stays raw, same
as before this task, with no model call at all. A composer that never asked for
`revise:` in the first place is unaffected either way.

## Settings: into

messages right in the chat window"): "chat" = a bubble in the chat log that grows as you speak
(only on a composer whose host can draw one, i.e. `on_live` is set: `ChatPanel`); "box" = the
text box first, the old way ("it's not a bad function to have"). Typing always uses the box.

WHERE DICTATION APPEARS (the owner, 2026-09-30: "the live whisper transcription creating the

## Settings migration

The gear saves EVERY key, so a box that ever saved a setting still holds an old default for


## Settings migration (manual send mode)

MERGE 11, "ONE WIDGET" (2026-10-01): "manual" send (only Send/Enter, nothing ever
auto-sent) used to be one of the gear's own choices — and a box that had it saved
would silently turn autosend off for good, which is exactly the "look alike but
behave differently" bug the owner hit. Autosend is the only behaviour now, so an
old saved "manual" is changed back to "pause" here, the same way a stale
`pause_send_ms`/`paragraph_pause_ms` default is dropped just above. The choice
itself is also gone from `settings_panel()`'s own `send_mode` row, below.

## Clean-changed event

Fired on `document` whenever the gear panel's "clean" checkbox changes (`detail` is the new
value) — the one way a DOM node outside this mic (Composer.js's own "raw" chip) can react to
the kill switch the instant it's flipped, review finding 7.

## Beep needs a running context

⚠ WAIT FOR THE CONTEXT TO ACTUALLY BE RUNNING BEFORE SCHEDULING A NOTE (dictate-stop-sound,
2026-10-01 — the owner: "I didn't get a sound to let me know it stopped… the sounds aren't
playing properly"). A brand-new `AudioContext` starts `"suspended"`; its own clock
(`currentTime`) is FROZEN at 0 until something actually resumes it. The old code called
`resume()` but never waited for it, then read `currentTime` and scheduled the notes
relative to that frozen instant anyway — so the very first beep on a page (or any beep
fired with no fresh click behind it, like the stop chime from a page-hidden mic release)
could be scheduled on a clock that was still stuck at 0 when the context woke up moments
later, coming out silent, clipped to a fraction of its length, or buried under whatever
else was scheduled by then. Awaiting `resume()` first means `currentTime` is always read
from a context that is genuinely ticking, so the two notes land exactly where they're meant
to. `beep()` is still called fire-and-forget everywhere (`on_listening()`, both `stop()`s) —
nothing needs its promise, this only delays WHEN the oscillators get scheduled, not whether
the caller waits.

## Reload guard

A live reload waits while a mic is recording or has words not yet sent.
It asks EVERY mic on the page, not just the last one started, and it counts the
gaps a plain state check missed: the moment between the press and "listening"
(engine check, permission prompt, a new card's 250 ms autostart), the 400 ms
while a dead device is reopened, and the sentence still being posted.

## strip_words (duplicate bubble)

`text` without the words `sent` already covers at its start. A guess that went out with Send is


## Paragraph gaps

PARAGRAPHS ON PAUSES. Whisper closes a segment after 0.7 s of quiet, so


## The guess stays on screen until its final arrives

One gap per segment that will really be sent, in order — commit() takes the next.
⚠ THE GUESS STAYS ON SCREEN UNTIL ITS FINAL ARRIVES. Dictate's own close_segment


## The box (base + dictated words) and clean mode

THE BOX IS WHERE THE WORDS APPEAR. Each Whisper update — the still-moving

⚠ THE BOX IS ALWAYS `base + dictated words`, REPLACED, NEVER APPENDED

CLEAN MODE (ai/sessions/2026/09/29/audio/audio/next-clean-transcription/a-clean-mode): each
`held` item is a finished Whisper utterance, `{text, raw, chunk_id, ready}`.
`text` starts out equal to `raw` and is swapped in place, by `on_revised()`
below, for the fast assistant's cleaned-up wording once it answers — so the
box shows raw words for a moment, then the same words tidied, never both at
once and never a flash of empty. `build_tail(use_raw)` reads either column,
so the "raw" dig-back toggle (`toggle_raw()`) and the real box share one
piece of paragraph-break logic instead of two that could disagree.

## Into the chat, not the box

INTO THE CHAT, NOT THE BOX (dictation-stream, 2026-09-30). With `SETTINGS.into === "chat"` and a


## Live refine

EVERY MIC REFINES LIVE (one-input, 2026-10-12, CLAUDE.md law 2/6): whatever is in the
box right now — raw while speaking, already true above — is also posted to
`/api/refine/live` (`RefineSystem.post_live()`, `ext/Refine/RefineSystem.js`) so the outline keeps
up underneath, debounced so a run of Whisper updates sends one batch, not one per
keystroke. Gated on `this.revise`, the same switch `clean_active()` already reads: a
composer that never asked for the dictation pipeline is untouched either way.
`doc/one-input-2026-10-12.md` has the decision; `contract.md` the wire shape. Fails
quietly — the route 404s until Servex restarts with `LiveRefine.js` wired in.

## Live refine (final)

THE SEND ITSELF closes the batch (`final: true`) — the contract's own "drains the queue,
logs the prompt, marks it done". A caller (`send_screen()`/`flush_held()`, below) awaits
this right before building the entry that actually posts, and swaps in the paragraphed
slots text when one comes back; `null` (today, before the route exists) means "keep doing
what you were already doing" — never a blocked or failed send.

## Box ceiling

THE BOX GROWS UP TO A CEILING, THEN SCROLLS (one-dictation, 2026-10-01 — the owner: "if


## Settings panel

THE SETTINGS GRID: one small input per setting in SETTINGS. A change writes the object at once, is


## One microphone at a time

ONE MICROPHONE AT A TIME. A card's page stays mounted while a sub-card


## Start sound

THE START SOUND — moved here from the end of `start()`. `Dictate` now calls this
the INSTANT the mic is genuinely open (whisper's own `capture.start()` resolved, or
the browser engine's `rec.onstart` fired), never merely because `start()` was asked
to run. Before this, `start()` returning was treated as "it's on" — but for the
browser engine `start()` returns before Chrome has done anything at all, and on an
insecure LAN page Chrome can go on "trying" for a long time with no error, so the
chime played while nothing was actually listening (the owner's own phone report,
`ai/sessions/2026/09/29/mobile-nav/mobile-nav/`, `doc/https-lan.md`). `Dictate.set_state()` also never
fires this twice for one press — Chrome's own silent mid-session restarts (still
"listening" throughout) do not replay the chime.

## Silent revival of a dead track

WHY THE MIC "TURNED ITSELF OFF": a Windows sleep, a Bluetooth switch or an

⚠ NO STOP/START BEEP FOR AN AUTOMATIC REVIVAL (round 2, 2026-10-04 — the owner, on the
phone: "it's bleeping twice… it seems like it's maybe turning off and then turning
back on after every pause"). The old code answered a dead track by running a FULL
`this.stop()` then, 400ms later, a full `this.start()` — two real state transitions,
one chime each, so a single revival sounded like two beeps. On a phone, a quiet
stretch in speech (exactly "every pause") is also the moment mobile Chrome/Android is
most likely to recycle or briefly suspend the mic track to save power — so this fired
on ordinary pauses almost every time, not on a real disconnect.

Fix: open a FRESH `Capture` directly and swap it in, with `this.state` left at
"listening" throughout. Nothing here is a state transition, so Dictate's own
beep-on-listen (`on_listening`) and beep-on-error never fire — from the owner's side
the mic never looked like it turned off at all, which is exactly "the mic stays on
until the owner stops it." A revival that genuinely fails (nothing left to reopen,
permission pulled) still calls `set_error()`, which DOES beep "stop" — that is a real,
owner-visible failure, not a false one.

## Send modes

WHEN WORDS GO OUT is `SETTINGS.send_mode`, one switch (a mic can override it with its own `send_mode`):


## Held items

EACH FINISHED UTTERANCE IS ITS OWN `held` ITEM (deliverable 1): `text` is what
the box shows and what a send actually reads; `raw` is what Whisper really
said, kept alongside forever, never overwritten (deliverable 3, the dig-back
toggle). `ready` resolves once this item can no longer change — instantly if
clean mode is off (nothing is ever coming), or when `on_revised()` below hears
back from the fast assistant, ok or not. A send that is about to go out awaits
every held item's `ready`, capped at ~5s (`await_clean()`), so it never sends
half of a clean-up and the raw rest (deliverable 2).

Deliverable 2 — "wait for it (at most ~5s), then fall back to raw for anything
unanswered": every held item not yet cleaned (`ready` unresolved) blocks a send
for up to `ms`; items answered already resolve instantly (`Promise.all` needs
no real wait for those), and items that time out simply keep the raw text
`log_prompt()` gave them — never a missing word, never a second wait later.

## on_revised and on_revise_failed

THE FAST ASSISTANT ANSWERED for one utterance — `Dictate.js`'s own `revise_chunk()`
calls this once `/api/tidy` says OK, never with a falsy `text` (a failure goes to
`on_revise_failed` below instead — two hooks, never one overloaded with `null`,
review finding 1: an existing caller like `ext/drawer/rail.js` that only ever
handled success must never be handed something to draw a blank card for). Find
the item that is STILL waiting (a send may already have cut it out of `held`,
raw and gone — nothing left to update, but the waiter still needs releasing so
`await_clean()` doesn't wait the full 5s for an answer nobody can use any more)
and swap its `text` for the clean version.

⚠ A CALLER'S OWN HOOK IS `on_clean`, NEVER `on_revised` (dictation-stream, 2026-09-30): View's


THE FAST ASSISTANT GAVE UP for one utterance (Servex down, or any other
failure) — `raw` stays showing in the box (`item.text` is never touched, it
was already the raw words); only `item.failed`/`item.fail_why` are stamped, so
a send about to go out can say so ONCE (`notify_if_failed()`, called by the
send paths right after `await_clean()`) instead of `Composer.js`'s hint firing
once per failed chunk — a string of failures used to repeat "sent raw" over
and over before anything had actually been sent (review finding 5).

## arm(): late answers

⚠ ONE MICROPHONE AT A TIME, STILL TRUE FOR A LATE ANSWER (review finding 1/2,
one-dictation, 2026-10-02 — the owner: "duplicate transcriptions on the same
card... it seemed to even chunk one into a new card"). `start()`'s own singleton
(`ComposerMic.on`) stops whichever mic was running before this one — but Whisper
is a network round trip: a segment already in flight on the OLD mic when it is
stolen from can still resolve AFTER `stop()`'s own final flush has already run,
landing in `commit()` -> `log_prompt()` -> here, on a mount nobody is looking at
any more (a card the reader has since navigated away from, its own composer kept
mounted — `ext/drawer/rail.js`'s and `ai2/card.js`'s own doc on why mounts are
never torn down on navigation). `auto_check()` already guards the exact same way
(`this.state !== "listening" && this.state !== "transcribing"`); this arms every
other autosend path (`log_prompt()`'s own segment-finished call, and the safety
chunk cut) the same way.

DISCARD, DON'T STRAND (re-review finding 4, 2026-10-02): leaving the late words
sitting in `held` used to mean the box kept showing them, unsent, until this
mount's mic started again — and then they would go out attached to whatever page
was current THEN, the very wrongly-attributed send this guard exists to stop.
Nothing is lost by discarding: `log_prompt()` above this call already drew them
in this mount's own thread (its chat log has them); only the still-live box and
the unsent `held` queue are stale. Mark every held item `gone` (`owner_edit()`'s
own pattern, above) and redraw the box so it empties instead of holding words
that will never be theirs to send.

## send_sentences

`composer({ per_sentence: true })` sets this mic's `sentences_per_send` to 1, apart from the gear panel: every finished sentence goes out at once while the next is still being heard (the Refine page; `ext/Refine/test/composer-flow.mjs`).

The finished sentences among the held words go out now, `sentences_per_send` to a message; the


## send_screen

Everything visible goes out as one message, the mic keeps recording, the box starts fresh.
This is the common case (the default "pause" send mode's own tail send, and every
natural-pause send) so it is the one place deliverable 2's wait really matters: if a
clean-up for something on screen is still in flight, WAIT for it (`await_clean`, capped
at ~5s) before reading the box, so the message sent is the clean text whenever it
arrived in time — raw otherwise, never a half-cleaned mix and never a lost word.
`this.sending_screen` stops a second call (another `auto_check` tick, `stop()`) from
reading and clearing the SAME box while the first is still waiting.

## Instant feedback

INSTANT FEEDBACK (the owner, 2026-10-04: "instead of putting it quickly into the
UI, it takes a minute… we always want that instant feedback"). `await_clean()`
below can wait up to 5s for the fast assistant's clean-up before the box even
clears — the exact "minute" the owner saw, since nothing reached the chat log
until AFTER that wait. `on_send_start(raw)` fires HERE, before any of that,
with whatever is on screen right now: the caller (`Composer.js` → the rail/card's
own chat) draws it at once via `Chat.js`'s own `live({text, sent:true})` — the
same fading "sent" bubble already built for the open-mic live stream, reused
rather than a second mechanism. Nothing about the clean-up wait itself changes.

## stop() beeps once

⚠ NOT when `set_error()` already beeped (dictate-stop-sound, 2026-10-01). Whisper
going unreachable while THIS stop is still sending its last segment
(`Dictate.close_segment()`'s own catch) calls `set_error()` while `this.state` is
still `"transcribing"` — and this class's own `set_error()` override (below) beeps
"stop" right there, on the spot. `super.stop()` then resolves normally (the error
is handled, not thrown), so without this check `was` (captured above, before any of
that ran) would still be true and this `finally` would beep "stop" a SECOND time —
two overlapping chimes landing as one garbled noise instead of one clean tone,
which read to the owner as "the sound isn't playing properly", not as two sounds.

## take_out and post_held

When words leave the caption, `take_out()` gives them an `at` and hands them to `on_out` in the same step, so the chat draws them where the draft was before any wait. `post_held()` then hands the same item, with the same `at`, to the caller's `deliver(entry)` (how a send is posted is the caller's business); if the clean-up changed the text, the chat swaps only that piece ([ux/Dictate/doc/flicker.md](/framework/ux/Dictate/doc/flicker.md)).


## Duplicate sends

⚠ NEVER SEND THE SAME SENTENCE TWICE IN A ROW (the owner, 2026-10-04: "I said
something and see it appear in the same chat bubble four times in a row"). Several
paths can hand a finished utterance to `post_held()` close together for the SAME
words — a pause-triggered `send_screen()` and a safety-chunk `check_chunk()` both
noticing the same held text within one 250ms tick, or a late Whisper final landing
right after its own guess was already sent — and each one is a genuinely separate,
correctly-built `entry`, so nothing upstream of this point is "wrong" to de-dupe.
This is the one seam every outgoing send already passes through, so it is the one
place that can catch all of them: the same text (case/space-insensitive), from the
SAME mic, within `DUP_WINDOW_MS`, is logged and dropped instead of posted again.
A real, separately-spoken repeat ("yes. yes.") is two SEGMENTS at least a pause
apart, almost always well outside this window — `pause_ms` (700ms) plus the time to
actually say the word.

## Settings: paragraph_pause_ms

quiet after a finished sentence that sends everything said so far as one message (one-dictation,

## Settings: pause_send_ms

quiet time before everything left on screen is sent (was 2500: the owner asked for a shorter delay, 2026-09-30; before that 4000, words without a closing full stop waited 4 s, the owner's "four or five seconds", 2026-09-29)

## Settings: box_lines

the box grows to this many lines, then scrolls (one-input, 2026-10-12 — the

## Settings: clean

KILL SWITCH (ai/sessions/2026/09/29/audio/audio/next-clean-transcription/a-clean-mode, deliverable 4):


## Whisper repeats (collapse_repeat)
`ComposerMic.collapse_repeat` runs on `text` and `raw` as words leave the draft. It collapses (1) a whole-text doubling of 2+ words to its first half and (2) a tail of 5 or more words that repeats the span just before it (Whisper looping inside one long reply; `ux/Dictate/repeat.js`, proof `ux/Dictate/test/repeat.mjs`). A repeat of fewer than 5 words inside the text ("no, no, no") is never touched. Dictate does not stitch overlapping windows: each segment is cut and sent once, so the loop is Whisper's own.
