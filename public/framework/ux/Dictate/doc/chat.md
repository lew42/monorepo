# chat.js — one chat box, one conversation, every surface

Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the
desktop ☰ drawer's AI tab, a card's own sidebar, the dev bar — built its own copy, with its
own session logic. `ux/Dictate/chat.js` (built 2026-09-30, "one-dictation") is now the ONE
function all of them call. Change it once, and every surface changes.

## The call

```js
import chat, { new_session_button } from "/framework/ux/Dictate/chat.js";

const mount = chat(el, { path: "/framework/", card: undefined, placeholder: "say something",
	keep: true, level: false, source: false, debug: false });

mount.panel;         // the Widget this mount drew, if a caller needs it directly
mount.session();     // the live session id, or null if nothing has been said yet
mount.nav(path, card);  // this mount's page (and, maybe, its card) changed
mount.reset();        // drop THIS mount's own conversation; the next sentence starts fresh
mount.remove();      // this ONE mount is gone; the conversation itself keeps going

new_session_button(mount);  // the one "New session" button every surface shares (below)
```

`chat(el, opts)` draws a chat [`Widget`](/framework/ux/Dictate/) into `el` and wires it up so
typing or talking into it sends a real message and real replies come back. `path` is the page
this mount is on right now; `card` is explained below. `level`, `source` and `debug` are passed
straight through to the `Widget` this draws (a bigger level meter, the mic picker, the "Debug ▾"
bar) — real `Widget` options, there for a caller that wants them, but no surface turns any of
them on today: the debug views already live one click away at
[playground](/framework/ux/Dictate/playground/), and the level bars are being replaced
everywhere by the pulsing dot (merge 12, "the dot").

## Modes, and where the Dictate box sits

The Dictate box — entry, Whisper, correction, Send — is not its own thing. It sits *inside*
the Chat widget (`Widget.js`), which owns the bubbles above it. Every sentence becomes one more
line in the same conversation a typed message would.

**One chat, everywhere, and it always autosends.** Say a sentence and it goes out by itself a
short pause after it ends — no button needed. Sentences said close together join the same
bubble, like a paragraph. Typing still works exactly as you'd expect: press Enter, or the Send
button, and your typed line goes out. This is true on every surface — the Dictate page's own
demo, the ✦ sheet, a card's sidebar — because they all build the exact same `Widget`, the exact
same way.

It wasn't always this way. Until 2026-10-01 there was a second mode, `"chat"` (typed first,
Send only, nothing auto-sent), picked with a Dictate | Chat switch on the Dictate page. The
owner tried both surfaces and found they "look alike but behave differently" — the Dictate
page's own Chat mode was really just autosend turned off, and the owner's own words were
"maybe that was a mistake to separate those into two different modes." It's gone now:
`"dictate"` is the only mode a caller can ask for besides `"live"` (below), so there is nothing
left to switch. Why, in more detail: [`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/).

A **mode** (`chat(el, {mode})`, `new Widget({mode})`) is still a named preset, never a second
code path — one row in `Widget.js`'s `MODES` table, over settings `Mic.js`/`Chat.js` already
have. The one other mode today is **`"live"`** (merge 13, clean-dictate-mode): speech goes
straight into the outgoing bubble, with no text box and no Send at all — see `Widget.js`'s own
`MODES` doc comment for exactly what it changes.

The same chat is open to an agent too: its reply is just another line in the same session file,
with its own `from`.

## `keep`: whose conversation this mount joins (item 2, one-dictation)

`keep` (default `true`) answers one question: when this mount goes away, is its conversation
remembered?

- **`keep: true`** — this mount joins the ONE global session every `keep: true` mount on this
  browser tab shares (the section right below). Leave the page, come back, open a different
  surface — it's still the same conversation. This is what makes the ✦ rail useful: say
  something on one page, keep talking on the next.
- **`keep: false`** — this ONE mount gets its OWN session, private to it, remembered only for
  as long as the mount itself exists. It is a REAL session — the first sentence said really
  does start two real agents and really does cost what any other session costs — it is just
  never written to `sessionStorage`, so nothing can ever read it back. Leave the page (the mount
  is torn down) and come back (a brand-new `chat()` call builds a brand-new mount) and there is
  nothing to resume: a fresh, empty conversation, exactly as if nothing had been said before.

The Dictate page's own demo (`ux/Dictate/page.js`'s `demo_mount()`) is the one `keep: false`
caller today — "the dictate page is the workbench," the owner's own words, and a workbench's own
demo conversation should never leak into, or be confused with, the owner's real, kept-forever ✦
conversation. A `keep: false` mount's controller is built fresh, by the same `create_controller()`
function the global one uses, so the two share every bit of logic except whether `sessionStorage`
is touched — see `chat.js`'s own comments on `create_controller` for the exact shape.

**A gap, left as it is, not a bug:** the mic's own "the owner went quiet" / "the mic just turned
off" reports (`Session.report_quiet`/`report_pause`, wired once, for the GLOBAL session only)
never fire for a `keep: false` mount's own session. Fixing that would mean tracking which
controller's mic is "the" one listening right now, across however many mounts are open at
once — real work, and nothing in this task's brief needed it (the demo's own session answers
fine without the fast assistant's quiet-prompt).

## The shared "New session" button (item 3, one-dictation)

`new_session_button(mount, { label, title })` builds the one button every surface uses to drop
a conversation and start over. It calls `mount.reset()` — for a `keep: true` mount that IS
`chat.reset()` (the global conversation, cleared for every open mount at once); for a
`keep: false` mount it only ever affected that one mount anyway. `mount` can also be a function,
`() => mount`, for a caller (like the ✦ sheet) that builds this button before it has built its
own mount yet — the function is read fresh at click time, never captured early.

The ✦ sheet (`ext/drawer/rail.js`) and the Dictate page's own demo both call this now, instead
of each hand-rolling their own button — CLAUDE.md law 6, "one of everything."

## The global session: one conversation per browser tab

Before this file, each surface started its OWN conversation, so a sentence said on the phone's
sheet was invisible on the desktop's drawer, even in the same browser. Now there is only **one
conversation per browser tab**, no matter how many chat boxes are open on screen at once (the
sheet and the drawer, say) or how many pages the owner visits. It lives in one place,
`sessionStorage["lew42-voice-session"]`, and every mount reads that same spot.

The first sentence said, from ANY mount, starts the session. Every later mount — a different
page, a different card, a second chat box opened at the same time — just picks that same
session back up and keeps going.

`card` is only a **hint for the very first sentence ever said**. It tells the session which
folder to call home (so its saved file sits beside that card's own page), and nothing more —
once the session exists, saying something from a different card never starts a second one.

## Why a reopened chat never loses old messages

**The bug this replaces:** before this file, a chat box only started reading the saved
conversation file the moment the owner sent a NEW message. So if the owner closed the sheet,
switched cards, or reloaded the page, the box came back empty — even though every earlier
message was still saved on disk — until the owner said something new.

**The fix:** every mount calls `Session.watch()` on its own, the moment it is built. `watch()`
always starts reading its file from line 1, never partway through, so a brand-new chat box gets
the WHOLE conversation at once, not just whatever gets said after it appears on screen. Two
chat boxes open at the same time (the sheet and the drawer, say) each run their own `watch()`
and each draw the same full history — simple, and cheap, because a session's saved file is
small.

A mount that just sent a message already drew its own bubble right away, before the server even
answered (so typing feels instant). When that same message comes back a moment later from
`watch()` reading the file, this file remembers it already drew that one (by its exact
timestamp) and skips it, so it is never drawn twice.

## Every real line is drawn once, even though two channels both deliver it (2026-10-01)

`attach()` wires up BOTH `Session.watch()` (the full-file poll, above) and `Session.stream()`
(an SSE push the instant Servex writes a line, so a reply "does not wait for the next poll" —
`ext/Session/Session.js`'s own doc comment on `stream()`). That is on purpose: `watch()` is the
full-history catch-up and the safety net for a dropped SSE connection; `stream()` is the fast
path. But it means EVERY real line — not just the owner's own echoed send — is expected to
arrive from both channels, once each.

**The bug this replaces:** `own_ats` only ever caught the owner's OWN sent message coming back.
An assistant's reply was never covered, so the fast and smart assistants' own replies each drew
as TWO separate bubbles — the owner, 2026-10-01: "both messages... added twice... four messages
total." `draw(line)` now keeps a second set, `seen_chat`, keyed the same way `ext/Chat/Chat.js`'s
own `chat()` factory already dedupes its lines (the line's `at`, plus its text when it's a
`fix` — a later correction at the same `at` must still draw, never get swallowed as "already
seen"). Reset alongside `own_ats` every time `attach()` rebuilds for a new or resumed session.

## `nav(path, card)`: telling the session about a move

Most mounts get a brand new `chat()` call every time they open (the desktop AI tab, the dev
bar), so they never need `nav()`. The one exception is the ✦ sheet: it stays mounted while the
owner navigates the page underneath it, so it has to tell this file when that happens.

- `nav(path)` — the mount moved to a new page. Whatever card it already had keeps being
  reported.
- `nav(path, card)` — the mount moved to a new page AND its card changed (the sheet can show a
  different card without being rebuilt). Pass the new card id, or:
  - **`null`** means "no card now" — the sheet is showing a plain page, not a card.
  - **leaving `card` out entirely (`undefined`)** means "nothing changed" — keep reporting
    whatever card this mount already had.

`mount.nav()` is not the session's own `nav()`. It updates this mount's page and card, then calls `Session.nav({session, from, to, card})` in [`ext/Session`](/framework/ext/Session/), which is what writes the invisible `nav` line ([markers.md](/framework/ext/Session/doc/markers.md)).

This matters because a later message gets credited to whichever card was showing when it was
said (`ext/Session/doc/markers.md`'s "card attribution"), even if the owner has since moved on.

## The `para` marker: a late correction, not a new message

A new sentence usually continues the owner's last thought, so it joins the last bubble as a
new paragraph instead of opening a second one (`ext/Chat/Chat.js`'s `speak()`/`mergeable()`,
`MERGE_GAP_MS` = 10s). Sometimes the fast assistant decides, a moment later, that the LATEST
paragraph it heard was actually the start of something new. It says so by beginning its reply
with `(new paragraph)` (`Servex/agents/session-fast.md`); Servex turns that into an invisible
`{para: {at, re}}` line in the session file — `re` is the `at` of the first owner line of the
thought the fast assistant just heard (`ext/Session/doc/markers.md`'s own row on it).

`ux/Dictate/Widget.js`'s `Widget.Thread` is what acts on it (`split_paragraph(re)`): the
paragraph named `re`, and everything merged into the SAME bubble after it, move out into a
brand-new bubble placed right after the original — same sender, same look. The actual move
(`split_bubble()`, exported from `ext/Chat/Chat.js` for this) keeps that bubble's own
piece-and-mark bookkeeping correct on both halves, so a later merge, a ✓/? mark or a `retag()`
on either one still works. A whole-file redraw from line 0 (a reload, `sync()`) hits the same
`para` line at the same point in the sequence, so it draws the identical picture.

`chat.js`'s `draw(line)` forwards a raw `{para: ...}` session line to `panel.say({para})`, the same way it forwards `{chat}` and `{react}`.

## `remove()`

Call this when ONE mount is taken off the page — closing the sheet, switching a drawer tab away
from AI. It only stops that one mount's own polling and listening. The conversation itself, and
any OTHER open mount showing it, carry on completely untouched.

**A caller that rebuilds its own mount must call `remove()` on the old one first.** The
desktop drawer's AI tab (`ext/drawer/tabs/ai.js`) learned this the hard way: it used to build a
brand new `chat()` mount every time the drawer refilled that tab, without ever removing the
previous one, so every reopen left one more poller and one more live connection running forever
in the background. It now keeps the one mount it built in a module-level variable and calls
`remove()` on it before building the next one — and also removes it if the tab is torn down a
different way (the whole drawer closing, or a different tab taking over its content), so nothing
is ever left running after its box is gone from the page.

## Adding a new surface

1. Call `chat(el, { path, card })` once, into the box the surface owns.
2. Keep the mount it returns. Call `mount.remove()` when the box goes away, and before you build a new mount in the same place.
3. Call `mount.nav(path, card)` only if the box stays on screen while the page or card under it changes (like the ✦ sheet).
4. Add the surface to the [Surfaces](/framework/ux/Dictate/surfaces/) page, so everyone sees it.

## The older versions, still kept reachable

Nothing was deleted when `chat.js` became the default everywhere. An older version can still be
switched back in by anyone debugging a regression:

| Name | What it is | Where |
|---|---|---|
| `aiV2` | the old desktop AI tab: its own model picker, its own private session wiring | `ext/drawer/tabs/ai.js` |
| `DrawerRail.SheetPanel` | the old ✦ sheet, before it called `chat.js` | `ext/drawer/rail.js` |
| `askV1` | the dev bar's old per-page thread picker | `dev/DevBar/ask.js` |
| `chat_v1()` | a card page's switch back to its old, standalone chat | `ai2/card.js` |
| `foot()` | the old assistant in the AI 2 "Live" fold | `ai2/rail.js` |
| `new Widget({ v1: true })` | the old one-bubble-per-sentence thread + the old open-mic composer (never writes into a box) | `Widget.js` |

`chat()` itself always builds a `Widget` the normal way (`v1` is not one of `chat()`'s own
options) — pass `v1: true` straight into a bare `new Widget(...)` if you need the old look;
there is no `chat(el, {v1: true})` shortcut today. See `Widget.js`'s own class doc for why
`v1` exists and what it switches back to (the merge that made `Widget.Thread` draw its
bubbles through `ext/Chat/Chat.js`'s `speak()`, so sentences said close together join one
bubble instead of opening a new one each time, and made `Widget.Composer` the same
`ext/Chat/Composer.js` every other chat box on the site already uses).

## More

- [`ext/Session`](/framework/ext/Session/) — the voice session `chat.js` wires every mount to
- [`doc/widget.md`](/framework/ux/Dictate/doc/widget/) — the `Widget` this file draws
- [Surfaces](/framework/ux/Dictate/surfaces/) — all five mounts, live, side by side
