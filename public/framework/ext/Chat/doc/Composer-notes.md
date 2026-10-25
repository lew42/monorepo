# Composer function: design, rationale, and decisions

## API and function signature (lines 6-36)

ONE BOX ON TOP, FULL WIDTH; the mic, Send and one ⚙ menu button sit in ONE ROW
below it (one-dictation, 2026-10-01 — the owner, on a phone: "the text area was
kind of partial width and would grow really tall and then create this big void
of empty space… if the text area is gonna grow, it needs to be like full
width… the send button could be below it"). This is the SAME layout
`ux/Dictate/Widget.js`'s own composer already used — every caller of this one
function gets it now, not just the Dictate widget.

IT NEVER GROWS BEYOND A CEILING, and that is a requirement, not a detail: rows
sit under it, so a composer that gains a line pushes everything down (`Chat.css`'s
`max-height` on the box itself now, not a row that has to match it). What
`ux/Dictate` draws that does not shrink — its engine name, its status, its
"stop after a pause" checkbox — USED to live in one small popover, and the
settings grid in a second, separate one behind its own gear button (two
buttons, two popovers). **Merged into ONE ⚙ button that opens ONE full-screen
menu** (chat-menu-merge, 2026-10-01 — the owner, looking at both: "I think the
gear and that more button should be merged together into one menu… it maybe
should swap out the entire UI, right? Like full screen") — see `build_menu()`
below, same full-screen shape as `Drill.js`'s own `.chatbox-drill`.

Function options:
- `deliver(entry)` is how a message leaves — the entry is
  `{ at, type: "prompt", by: "owner", text, via, re?, selected? }` and the answer
  is true when it went.
- `re()` is asked fresh on every send, never captured, so the target can change under a composer that stays put.
- `on_text(text)` is how a caller shows the words the instant they exist, before anything has logged them.
- `mic: false` makes a typed-only box.
- `autostart` opens the mic after a quarter second.
- `revise` option: "clean" | "edit" | "summary" | false (default) — forwarded to `ux/Dictate`'s own option.
- `on_revised` callback: (text, {raw, level}) => … — forwarded from `ux/Dictate`.
- `try_command(text)`: boolean — an HITL command ("rename this") the box swallows instead of sending.
- `on_live`: ({text, settled, guess, sent}) => … — dictation goes into a growing chat bubble.
- `on_out`: ({text, raw, at}) => … — dictated words just left the bubble or box to be sent: draw them in the chat now, at `at`. The send (`deliver`) follows later with the same `at`, after any clean-up wait, so nothing on screen vanishes in between ([ux/Dictate/doc/flicker.md](/framework/ux/Dictate/doc/flicker.md)).
- `on_send_start`: (raw_text) => … — a send just started, BEFORE the clean-up wait (deliverable 3).
- `on_meter`: (level) => … — forwarded to `ComposerMic`/`Dictate` for a caller's own level bar.
- `device_id`: forwarded to `Dictate` — a caller that already picked one mic by hand.
- `session`: this mount's own session id (string or function) — forwarded to `ComposerMic` so the outline lands in the right place.
- `on_refine_live`: (answer) => … — the live `/api/refine/live` answer for a host drawing the outline.

## Input box styling and behavior (lines 65-69)

`.auto` = `field-sizing: content` (framework.css, util layer): the box grows with the
text, full width, up to `Chat.css`'s own ceiling (`.chatbox-compose-input`'s `max-height`).

ONE LINE TALL WHEN EMPTY, UP TO 3 THEN SCROLLS (one-input, 2026-10-12 — decided over a
single-line `<input>` that scrolls sideways: it cannot show a paragraph of raw dictation,
which is the whole point of the raw reference while speaking. See `doc/one-input-2026-10-12.md`).

## Button row layout (lines 73-79)

ONE ROW, UNDER THE BOX: mic on the left, the gear next to it, Send pinned to the
right — same edges as the box above it (drawer-chat, one-dictation, 2026-10-02 —
the owner: "the microphone and send and settings buttons are kind of just
floating awkwardly down there"). The row used to read mic, Send, gear — Send sat
in the middle, at neither edge. `Chat.css`'s own `.chatbox-compose-send`
(`margin-inline-start: auto`) is what actually pushes it to the row's far end,
past whatever else is in the row (the gear, and the "raw" toggle when it shows).

## Error handling and diagnostic status line (lines 93-100)

ONE STATUS LINE REPLACES ERROR ROWS (round 2, 2026-10-04 — the owner: "an
error happens and that error doesn't get cleared out… wasting three more
lines of screen space"). An error is never ALSO pushed into `note()` (the
line below the row): `ux/Dictate`'s own `log_step()` already wrote a short
form of it into `$diag` (surfaced as `$status_line`) the moment it
happened, and the very next real stage change overwrites that text — so an
old error cannot outlive the thing that caused it. The console trail is
for devtools; nothing here draws a second row.

## Clean failure handling (lines 102-107)

Deliverable 2 - "if Servex/tidy fails, send raw and say so in the hint line":
ComposerMic calls `on_clean_failed` at most ONCE per send (`notify_if_failed()` - review
finding 5, a string of failed chunks used to repeat this line once each,
before anything had actually gone out), right before the message leaves -
"will send raw", not "sent raw".

## Menu button: merge of two controls (lines 110-114)

ONE MENU BUTTON (chat-menu-merge, 2026-10-01) — used to be TWO buttons here,
`⋯` (engine, microphone and status) and a separate gear (settings); see
`build_menu()` for the one full-screen panel this now opens.

A real gear (an SVG), not the ⚙ character: on a phone that glyph drew as a
ship's wheel (the owner, 2026-09-30).

## Raw button visibility and clean setting (lines 120-127)

Deliverable 3 - "dig back": one small toggle shows exactly what Whisper produced,
in place of the clean-up, for whatever is currently in the box. Only worth showing
on a composer that asked for a revise: level at all - a plain box has no raw/clean
split to dig into.

Review finding 7: it must also HIDE the instant the gear's "clean" kill switch is off,
since toggling it then would show raw = clean (nothing to dig into, nothing to show) - 
`SETTINGS.clean` decides its hidden state, both up front and live, via `CLEAN_CHANGED_EVENT`
(the one way a plain DOM node outside the mic hears that ONE setting change - 
`Mic.js`'s own settings_panel() fires it).

## Full-screen menu: composed from two popovers (lines 146-160)

ONE FULL-SCREEN MENU (chat-menu-merge, 2026-10-01 — the owner, looking at the
gear and the `⋯` button side by side: "I think the gear and that more button
should be merged together into one menu... it maybe should swap out the
entire UI, right? Like full screen"). It holds BOTH halves that used to be
two separate small popovers:
- Dictate's own info block — the engine, the status, the "stop after a
  pause" box. One node, moved here bodily (not copied), so it can never
  disagree with the microphone it describes.
- The settings grid, `Mic.js`'s own `settings_panel()` — it used to
  position ITSELF as a small floating popover with inline styles; now it
  is a plain in-flow grid (`Chat.css`'s `.chatbox-mic-settings`) and this
  full-screen panel decides where it sits.

Built once, on first open, and appended to <body> — the same full-screen
shape `Drill.js`'s own `.chatbox-drill` uses for its own full-screen shell,
so there is one way a chat surface goes full screen, not two.

## Diagnostic status line display (lines 162-167)

ONE STATUS LINE (round 2, 2026-10-04 — see error handling notes above): the
short "mic: … · socket: … · whisper: …" line `ux/Dictate` already keeps live
(`log_step()`/`draw_diag()`) used to sit buried inside the full-screen menu along with
the rest of `$info`. Pulled out and shown here, right above the send-flow `note()` line,
so the owner always sees current mic/connection/whisper health without opening the menu
— and it is never stale, because the next real stage change overwrites its own text.

## Send behavior: empty box with live dictation (line 208)

Dictating into the chat: an empty box + Send sends the growing bubble now, without waiting for the pause.

## Command handling (lines 212-216)

"rename this" on a selected card is a COMMAND, not a message (requirements.md
deliverable 3: "itself must not also be sent as a chat message"). `try_command`
only swallows it when it actually did something (something was selected) — with
nothing selected, "rename this" has no target, so it falls through and sends
as a plain line, same as any other typo'd command would.

## Note status feedback and timing (lines 232-244)

⚠ The status goes in the PLACEHOLDER as well as the small note under the row
(`$note`, a plain line now — chat-menu-merge, 2026-10-01 — it used to be
folded out of sight behind the `⋯` button, which is gone), because a note
nobody can see is not feedback. The placeholder is inside a fixed-height
box, so saying something there cannot move anything.

⚠ `$note`'s OWN TEXT NOW REVERTS TOO (round 2, 2026-10-04 — the owner: "an error
happens and that error doesn't get cleared out… wasting three more lines of screen
space for some old artifact error"). Only the placeholder used to be put back after
4s; `$note.text(...)` itself was left exactly as the last call set it, forever, so
a one-off "nothing to send" or a Send failure sat there until something else
happened to call `note()` again — which, on a quiet composer, could be never. A
later call (or the composer being torn down) cancels the pending revert so two
overlapping notes never fight over which one gets to clear last.
