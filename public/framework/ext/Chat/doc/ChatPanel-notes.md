# ChatPanel: design notes and removed commentary

## Panel naming and URL routing

A stable name per panel on a page, in build order — the same on a reload, so a drilled-in url (#chat=panel-2~…) finds the same panel again (doc/drill.md).

## Class overview and design

ONE CHAT WIDGET: the scrolling log (`Chat.js`) plus the composer and its microphone (`Composer.js`), as one class with one view — so the desktop drawer's AI tab and the mobile sheet can both build the exact same thing instead of two hand-rolled copies (the owner, 2026-09-29: "we need a consistent chat widget… whether it's in a desktop sidebar or a mobile sheet").

Usage:
```
const panel = new ChatPanel({ source: () => entries, deliver: async e => post(e) });
panel.view;      // === panel — a View; place it anywhere
panel.sync();    // draw whatever is new in source() — call after entries change
```

With no `source`/`deliver`, the panel keeps its own list — `panel.say(entry)` appends to it and draws — which is all the demo below needs, and all a fresh caller has to write to see it working.

VARIABLE HEIGHT, PURE CSS (Chat.css's `.chatbox-panel`): the panel starts as tall as its composer plus a message or two, grows with its content, and stops at `--chatbox-panel-max` (70vh by default — set it on a host to change it, e.g. `--chatbox-panel-max: 100%` for a host that is already the full height of the drawer). Past that height only the LOG scrolls; the composer stays put at the bottom. No JS measures anything — it is a flex column with a `max-height` on the box and `min-height: 0` on the log, the standard way to let one flex child absorb the overflow.

## render() method

### Local entries and raw_recent tracking

`this.entries`: Kept even when a real `source` is given, so `say()` always works and a caller that never wires one up (the demo, a quick page) still can.

`this.raw_recent`: The last few RAW owner lines this panel has said, for pairing a later revision to the right one — `handle_revision()`'s own doc has the why.

### Factory pattern and appending

Both factories are bare calls, not wrapped in a capture callback: `render()` is already running inside its own `append_fn` (`code` skill's own captor note), the captor is still `this`, and `div.c(...)` inside each one appends itself the moment it is built — a second, manual `this.append()` here would only move the same element a second time.

`watch` — an `ext/Session` file url: every RAW `{chat:{...}}` line it polls (Session.watch()) lands in `local` UNCHANGED — never through `Session.entry()`, which flattens to the old `{type,by,text}` shape and would drop `re`/`level` on the floor. This is what lets a future voice-sessions assistant's own revision lines pair the exact same way a Dictate-fed one does (`readme.md`'s "revision line", agreed with mastermind-servex-7, 2026-09-29): `chat_line()` only reads the shape.

### Local merge with source

`local` is read even when a real `source` is given (merged in) — both `say()`'s own writes (a revision this panel paired itself) and a watched session's lines need somewhere to land that `source()` alone, reading only a card's own persisted entries, would never show.

### Chat configuration and deliverables

SELECT (deliverable 2): one bubble at a time, tracked here only so `handle_rename()` knows nothing else — `chat()` itself owns the DOM.

RENAME (deliverable 3): `ux/Rename`'s own ask, reused as-is; `chat()` draws the button and the dropdown, this panel only delivers the pick.

✓/? MARKS (deliverable 4): behind its own option, `ux/Understand`'s own ask, reused as-is.

DRILL IN: "Open" on a selected card takes it full screen, routed. `drill: false` = no button, exactly v1.

REACTIONS: hold, right-click or hover a bubble to pin a 👍 ✅ ❤️ 😂 ❓ 👎 on it. Saved by the host's own `react({re, emoji, at})` (a voice session writes a line to its log); a panel that keeps its own list keeps the reaction there. A panel fed only by a card's `source` with no `react` gets none: there is nowhere to save one, and a reaction that vanishes on reload would lie.

THREADS: a selected bubble's Reply button; the next message you send goes under that bubble (`re` + `thread: true`). Offered where the message can carry it: a panel with its own list, or a host that says `threads: true` (the voice sheet). A card's thread cannot, so none.

### Refine-level option (future)

⚠ THE LINE A FUTURE REFINE-LEVEL OPTION EXTENDS (voice-sessions coordination, 2026-09-29 — `ext/drawer/tabs/ai.js` and `rail.js` both point back here): `composer()` builds the microphone; a `refine:` value added to this call is the one place it would reach every host of `ChatPanel` at once.

### Composer and delivery

The default `deliver` (no real one given): the universal chat-line shape, straight through `say()` — so even the plain demo remembers its raw line and can pair a revision to it, same as every other caller.

A pending Reply rides on the entry as `thread` (the parent's key), then clears.

### Revise and transcription options

PASSED THROUGH UNCHANGED (2026-09-29 reconcile): clean-transcription's own composer already defaults `revise` to `false` and AI 2 turns on `"clean"` itself — a default of `"edit"` HERE used to fight that and force every host into a mode it never asked for. A revision pair (below) draws for a LINE that carries `re` + `level`, never for the mode alone, so removing this default costs the pair nothing.

DEFAULT "clean" (dictation-stream, 2026-09-30): the ✦ sheet never set `revise`, so with SETTINGS.clean on its bubbles were still raw Whisper (the owner: "it doesn't look like you're fixing punctuation"). `revise: false` still turns it off for one host; the gear's kill switch (SETTINGS.clean) turns it off everywhere.

DICTATION INTO THE CHAT (SETTINGS.into, Mic.js): the words grow in a bubble in the log.

### Rename command

RENAME (deliverable 3): "rename this" is a command, not a message — `chat()`'s own `rename_selected()` starts the dropdown on whatever is selected and reports whether there WAS one; nothing selected falls through and this text sends as a plain line, same as any typo would.

## handle_revision() method

A REVISION of something already said — `ux/Revise` running in the background off `ux/Dictate`'s own `revise:` option, a moment after the raw words landed. Paired to its raw line by a `re` (the raw line's own `at`) + `level` on the chat line itself (`ext/Chat/readme.md`'s "revision line"), not by who wrote it — a future voice-sessions assistant writing that same shape into a session file needs no change here (the mastermind, 2026-09-29).

`raw` is the RAW TEXT `ux/Dictate` revised, not an id — `on_revised`'s own shape (`ux/Dictate/readme.md`) hands back the words, not a chunk id, so the match is by TEXT against the panel's own `raw_recent` (most recent unpaired match wins). A caller with its own real session log (a card's persisted thread, not this panel's local list) needs its own `deliver` to remember its raw lines the same way for this to find them — `readme.md`'s "Left open" note.

## deliver_rename() method

RENAME (deliverable 3): a name chosen on a selected bubble's dropdown (`ux/Rename`'s own ask — `Chat.js`'s `chat()` draws it, this only answers the pick). Delivers the SAME `at` as the renamed piece, `fix: true`, and the new title — the exact shape any other correction uses, so latest wins everywhere the log is read (readme.md). `this.deliver` is asked first, same as a typed message would be, so a real caller (a card, a session) can persist it for real; with none, `say()` writes it straight to this panel's own list, same as the demo.

## handle_unclear() method

✓/? MARKS (deliverable 4, behind `marks: true`): an UNCLEAR line drops ONE clarification card into the flow — `place`-d at `ux/Content/Decision`, the exact same card `ux/Understand`'s own demo already uses, unmodified.

THE LOOP-BACK: a real pick (not the "clear it" unchoose, which writes `option: null`) flips the ORIGINAL sentence's ? back to a ✓ — `Chat.js`'s own `resolve_mark()`, keyed on that line's `at`.

## Prototype classification

On the prototype (`code` skill §4: `classify()` runs inside `super()`, before a class field would exist) — the one class this View mints, matching Chat.js's and Composer.js's own `chatbox-*` prefix rather than the `chat-panel` `classify()` would guess from the constructor's name.
