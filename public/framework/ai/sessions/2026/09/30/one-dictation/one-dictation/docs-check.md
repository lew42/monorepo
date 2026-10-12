# Docs check — Dictate, Session, drawer readme chains

Read cold: `public/framework/readme.md` → `ux/readme.md` → `ux/Dictate/readme.md` (+
`doc/chat.md`) → `ext/Session/readme.md` (+ `doc/sessions.md`, `doc/markers.md`) →
`ext/drawer/readme.md` (+ `doc/select.md`). No code, no task logs.

Mostly clear — the three named questions are each answered somewhere, but not all in the
file a cold reader would land on first. Five real gaps:

- **`ext/Session/readme.md`'s own `Use` import line drops two of its three headline markers.**
  The readme's own bullet promises "a move to another page, the mic pausing, and what the
  reader has selected" — but `import { start, resume, recent, say, floor, nav, react, watch,
  entry }` never names `pause`, `report_pause` or `select`. A cold reader sees `nav()` wired
  with an example call and has no equivalent line for the other two; they exist only in
  `Session.js`'s own JSDoc. Belongs in `ext/Session/readme.md`.

- **`doc/sessions.md`'s file-format block has no `pause` or `select` example line.**
  `doc/markers.md` sends a reader here for "the file format for each one," but the JSON
  sample shows `nav` only — `pause` and `select` are described in prose in `markers.md` but
  never shown as a line. Belongs in `ext/Session/doc/sessions.md`.

- **`doc/markers.md` doesn't say what calls `pause()`.** It credits `select()` to "the reader
  picks (or clears) an element" and names the caller elsewhere (`ext/drawer/select.js`,
  cross-linked from `drawer/doc/select.md`) — but never says what fires `pause()`/
  `report_pause()` in practice (it's the mic itself starting and stopping, per `Session.js`'s
  comment, not stated in the doc). Belongs in `ext/Session/doc/markers.md`.

- **Two different `nav()`s share a name with no cross-reference.** `ux/Dictate/doc/chat.md`'s
  `mount.nav(path, card)` and `ext/Session/Session.js`'s own `nav({session, from, to, card})`
  are different layers (the mount wrapper forwards to the session call), but `chat.md` never
  says so — a reader of `chat.md` alone could easily think `nav(path, card)` *is* the session
  marker, not a call that produces one. Belongs in `ux/Dictate/doc/chat.md`.

- **No explicit checklist for building a sixth chat surface.** `chat.md` documents the API
  (`chat()`, `.nav()`, `.remove()`) and the five existing mounts get a side-by-side page
  (`ux/Dictate/surfaces/`), but nothing states the recipe in one place: mount with `chat(el,
  opts)`, call `.remove()` on teardown (and before rebuilding your own mount), call `.nav()`
  only if your surface stays mounted across a page change. A reader has to reverse-engineer
  this from the "watch out"-style notes about `ext/drawer/tabs/ai.js`'s old bug. Belongs in
  `ux/Dictate/doc/chat.md`.
