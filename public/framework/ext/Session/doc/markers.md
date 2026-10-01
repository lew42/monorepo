# Invisible markers — nav, pause, select, para — and the project-wide list

A voice session's file holds more than what the owner said and the assistants answered. A few
kinds of line are written automatically, in the background, and never drawn on screen as a
bubble of their own. They exist so the smart assistant can answer questions like "what was I
looking at when I said that?" even long after the moment has passed — `para` is the one
exception: still never a bubble itself, but passed through to the screen anyway, because it
changes how an EARLIER bubble is drawn (see its own row below).

## The four invisible markers

| Marker | Written when | What it is for |
|---|---|---|
| `nav` | the owner moves to a different page while the session is open | lets a later reader see which page a sentence was said on, even after several moves |
| `pause` | the mic stops altogether, and starts again later (not just an ordinary mid-sentence quiet gap) | tells the assistants "the owner put the mic down and picked it back up", which reads differently than a pause mid-thought |
| `select` | the reader picks (or clears) an element on the page, such as a paragraph or a card | lets the assistants know exactly what was on screen and selected at any past moment |
| `para` | the fast assistant decides a thought it just heard starts a new topic, not a continuation | tells [`ux/Dictate/Widget.js`](/framework/ux/Dictate/)'s `Thread` to split that paragraph, and everything merged in after it, out of its bubble into a new one — `doc/chat.md`'s "The para marker" |

`pause` is written by `report_pause()`, which every chat mount turns on (`ux/Dictate/chat.js`). It hears the mic itself turn off and back on (`floor.js`), so no caller reports it by hand. `select` comes from the drawer's pick-an-element tool (`ext/drawer/select.js`). `para` is written by `Servex/agents/Sessions.js`'s `heard()`, the moment the fast assistant's reply starts with `(new paragraph)` (`Servex/agents/session-fast.md`'s own rule).

`nav`, `pause` and `select` are written by `Session.js` and never turned into a chat bubble —
`Session.entry()` skips them on purpose, the same way it already skips `quiet` and `skip`
lines. `para` is skipped as a bubble too, but `entry()` passes it through (as `{type: "para",
re}`) instead of dropping it, because `ux/Dictate/Widget.js`'s `Thread` needs it to act on an
already-drawn bubble. The file format for each one is in [`doc/sessions.md`](./sessions.md).

## Card attribution: who gets credit for what was said

A session can have a **card** as its home (see `doc/sessions.md`'s "Card sessions"), or no card
at all. The card can also change mid-conversation — the ✦ sheet can show a different card
without a fresh mount being built (`ux/Dictate/chat.js`'s `nav(path, card)`,
[`doc/chat.md`](/framework/ux/Dictate/doc/chat/)).

Every `nav` line carries whichever card was showing at that moment, so later — even if the
owner has since moved to a different card, or to no card at all — a reply or a refinement can
still be traced back to the right one. `Servex/agents/Sessions.js`'s `nav()` writes the marker;
its `card_at()` looks a past moment up and answers "which card was this about?".

## The project-wide list

`GET /api/sessions?project=1` answers every session that belongs to this project, on any page or
card it ever touched, newest first — `Session.recent_project({ limit })` in the browser. This
replaced an older, narrower lookup that only checked one page's own folder plus the site root,
and could still miss a session that had passed through neither one.

"Project", not "page" and not "host": the phone on `10.0.0.135:8481` and the PC on
`monorepo.localhost` are the same project, so they see the same list of sessions —
`doc/sessions.md`'s "Project, not host" explains how a host resolves to a project.

## More

- [`doc/sessions.md`](./sessions.md) — the file format, every route, the two assistants
- [`ux/Dictate/doc/chat.md`](/framework/ux/Dictate/doc/chat/) — the one chat box these markers feed
