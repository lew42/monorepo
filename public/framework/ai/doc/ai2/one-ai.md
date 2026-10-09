# One AI, not two (2026-09-29)

The owner's words: a card page had its own built-in chat (a composer bar, a mic, a
"talk into this card" box, split about half the phone screen against the card's own
content) — and separately, every page already has a global AI: the mobile bottom
rail's ✦ button (a listening sheet) and the desktop drawer's AI tab. He asked: do
those two talk into the same place? If so, why does a card need its own copy?

## What was actually true before this task

**The backend was already shared — the display was not.**

- The card's own composer (`ai2/compose.js`) posts each message into Servex's prompt
  log with `re: <card id>`, and the fast assistant / manager that watch that log
  reply into the SAME card. The card's own chat (`ai2/chat.js`, reading
  `card.chat_entries()`) draws that whole persisted thread.
- The **desktop drawer's AI tab** (`ext/drawer/tabs/ai.js`) already detects a card
  page (`tabs.js`'s `context()`, duck-typed: "is the active page AI 2's card.js")
  and, when it does, sends through `send({ card: card.id, ... })` — which posts to
  the exact same Servex prompt-log route the card's own composer used
  (`post_card()` in `ai.js`). So on desktop, a message typed in the drawer's AI tab
  on a card page and a message typed in the card's own composer already landed in
  the same session, answered by the same assistant.
  **But** the drawer tab drew its own separate, throwaway list of turns
  (`ai.js`'s `turn()`), empty every time the tab opens — it never read the card's
  persisted `chat_entries()`. So even though the messages shared a backend, the
  reader saw two different-looking, differently-remembered conversations.
- The **mobile ✦ sheet** (`ext/drawer/rail.js`'s `DrawerRailSheet`) was not
  connected at all. It built a bare `Dictate` widget in `mode: "open"` and turned
  every finished sentence into a purely local "prompt item" card, drawn only in
  the sheet's own DOM — it never called `send()`, never posted to Servex. Talking
  into the ✦ sheet on a card page reached nobody; it was a dead end.

## What changed (this task's fence: `ai2/**`, `ext/drawer/{rail.js, rail.css,
drawer.css, tabs.js}` — not `ext/drawer/tabs/ai.js`, owned by a sibling minion)

1. **The card's own composer bar and its half/half split are gone by default.**
   `Card.content()` (`ai2/card.js`) no longer builds `.ai2-foot` (the chat log +
   composer + the desktop card|chat seam) unless `chat_v1()` says so. The card's
   content region now fills the whole page height — no second, smaller box fighting
   it for space.
2. **The mobile ✦ sheet now talks into the card it sits on top of.** Opening it on
   a card page (`DrawerRailSheet.active_card()`, the same duck type `tabs.js` uses)
   makes it: (a) show that card's own real, persisted thread by reusing
   `ai2/chat.js` — the exact same widget the card used to draw itself, reading the
   exact same `chat_entries()`; (b) post every finished sentence through
   `tabs/ai.js`'s exported `send({ card, text })` — called, never edited — the same
   route the desktop tab and the old composer both use. A reply lands in the one
   thread; the sheet's own `sync_global_ai()` hook (called from `Card.redraw()`)
   keeps that thread live while the sheet is open.
3. On any page that is **not** a card, the ✦ sheet is unchanged: a bare mic, each
   sentence its own small local card — nothing here regresses that.
4. The **desktop drawer's AI tab** showing the card's persisted thread (not just
   sharing its backend) is `ext/drawer/tabs/ai.js` — outside this task's fence,
   left for the minion already working that file.

## v1, kept reachable

`Card.V1 = true` (a subclass) or opening a card with `?chat=v1` in the url brings
back the old, byte-for-byte composer bar + chat + split, unchanged — `chat_v1()`
in `ai2/card.js`.

## Later: layout experiment

The owner also described a *possible* third option — a resizable vertical split on
the phone itself, with a grip on the seam you could drag up or down, and maybe a
way to click the seam to close one side or merge the two — as something worth
trying in the page-layout system generally, not something to build for this task
yet ("it seems like it could be tricky... maybe for now" the plain merge above is
enough). It is not built here. If it is picked up later, it belongs in the layout
system as a general two-pane-with-grip primitive (not AI2-specific), since the
same shape — "two scrolling regions stacked on a phone, resizable, closable one at
a time" — would be reusable well beyond a card's chat.
