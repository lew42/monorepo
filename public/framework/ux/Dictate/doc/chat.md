# chat.js — one chat box, one conversation, every surface

Before this file, every place that showed a chat box on the site — the mobile ✦ sheet, the
desktop ☰ drawer's AI tab, a card's own sidebar, the dev bar — built its own copy, with its
own session logic. `ux/Dictate/chat.js` (built 2026-09-30, "one-dictation") is now the ONE
function all of them call. Change it once, and every surface changes.

## The call

```js
import chat from "/framework/ux/Dictate/chat.js";

const mount = chat(el, { path: "/framework/", card: undefined, placeholder: "say something" });

mount.panel;         // the Widget this mount drew, if a caller needs it directly
mount.session();     // the live session id, or null if nothing has been said yet
mount.nav(path, card);  // this mount's page (and, maybe, its card) changed
mount.remove();      // this ONE mount is gone; the conversation itself keeps going
```

`chat(el, opts)` draws a chat [`Widget`](/framework/ux/Dictate/) into `el` and wires it up so
typing or talking into it sends a real message and real replies come back. `path` is the page
this mount is on right now; `card` is explained below.

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

## More

- [`ext/Session`](/framework/ext/Session/) — the voice session `chat.js` wires every mount to
- [`doc/widget.md`](/framework/ux/Dictate/doc/widget/) — the `Widget` this file draws
- [Surfaces](/framework/ux/Dictate/surfaces/) — all five mounts, live, side by side
