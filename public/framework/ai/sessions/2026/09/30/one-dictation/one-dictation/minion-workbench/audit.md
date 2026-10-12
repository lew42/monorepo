# Audit — every dictation/chat box on the site (item 6)

How this was done: grep the whole `public/` tree for `new Widget(`, `new Dictate(`, `dictate(`,
`chat(`/`mount_chat(`, then read every hit to tell a LIVE, production surface from a demo, a
variant, or an old version the site deliberately keeps reachable (CLAUDE.md law 6's own
exception: "never destroy a viable version").

## Live surfaces — every one already on `chat()` → `Widget`

These are the surfaces a real visitor actually uses. All of them were already correct going
into this task — the earlier task today (`one-dictation-chat-everywhere`) had already moved
them. This merge adds the one that was missing: the Dictate page's own demo.

| Surface | File | Component |
|---|---|---|
| The ✦ mobile sheet | `ext/drawer/rail.js`, `DrawerRailSheetChat` (`DrawerRail.Sheet`, the live default) | `chat()` → `Widget` |
| The ☰ desktop drawer's AI tab | `ext/drawer/tabs/ai.js`, default export `ai()` | `chat()` → `Widget` |
| The dev bar's Ask tab | `dev/DevBar/ask.js`, default export `ask()` (the one `tools.js` actually imports) | `chat()` (as `mount_chat`) → `Widget` |
| A card's own AI sidebar | `ai2/card.js` | `chat()` (as `mount_chat`) → `Widget` |
| AI 2's "Live" fold | `ai2/rail.js` | `chat()` (as `mount_chat`) → `Widget` |
| **The Dictate page's own demo** | `ux/Dictate/page.js` | **was a bare `new Widget({level,source,debug})`, no session — fixed this merge: now `chat()`, `keep: false`** |

## Fixed this merge

**`ux/Dictate/page.js`** — the only live gap found. One line (`new Widget(...)` →
`demo_mount()`, which calls `chat($slot.el, {keep:false, level, source, debug})`); see item 1
in the parent report. No other live surface needed a call swap.

## Kept as they are — a different, named reason each, not a fix

| File | What it builds | Why it's not a bug |
|---|---|---|
| `ext/drawer/rail.js` — `DrawerRailSheetPanel`, `DrawerRailSheetV1` | `new Widget(...)` / `new Dictate(...)` directly | The OLD sheet versions, kept reachable as `DrawerRail.SheetPanel` / `.SheetV1` for anyone debugging a regression — not the live default (`DrawerRail.Sheet = DrawerRailSheetChat`). Already named in `doc/chat.md`'s own "older versions" table. |
| `ext/drawer/tabs/ai.js` — the `aiV2` export | `new Widget(...)` directly, its own private session wiring | The OLD desktop AI tab, kept reachable; `tabs/ai.js`'s own default export (the live one) is already the `chat()` version. Named in `doc/chat.md`. |
| `ext/Ask/chat.js`'s own `chat()`, used by `ext/Ask/page.js` and the dev bar's `askV1` | a chat box, but to a Claude CLI agent (`ext/Ask/Ask.js`'s own session, model/tools picker) | A genuinely different system from the owner's voice/dictation pipeline — no mic, no Whisper, a different backend entirely (not `ext/Session`). Folding it into `Widget` would be a redesign of a working, separate feature, not a call swap — out of this merge's fence. `askV1` itself is already the NON-default (the dev bar's live `ask()` is the `chat.js` one, per the audit table above). |
| `ext/Ask/reply.js`, `ext/AITask/asks.js`, `ai/v/3/compose.js` | the plain `dictate()` / `new Dictate(...)` mic-to-textbox utility | These dictate INTO an existing text field (no bubbles, no conversation) — a different category from a chat box, and exactly what `Dictate`'s own doc calls out as "the plain mic button... what other pages embed." Nothing to swap. |
| `ext/Chat/panel/page.js`, `ext/Chat/drill/page.js` | `new ChatPanel(...)` | Demo/reference pages for the OLD chat component, already named in `doc/chat.md`'s "older versions, still kept reachable" table — not a production surface. |
| `ux/Dictate/variants/*`, `ux/Dictate/v1/`, `ux/Dictate/playground/` | `new Dictate(...)` in their own looks | Intentionally preserved alternate UIs — the entire point of "variants" and "v1" is to stay different and stay reachable, never to become the one `Widget`. |
| `ai/2026-09-19/assistant-stream/page.js` and other dated `ai/<date>/...` task folders | `new Dictate(...)` | Historical task scratch, not a page a visitor reaches. |

## One small, unrelated thing noticed, not fixed (out of this fence)

Loading `/framework/ux/Dictate/` headless throws `cardRows.filter is not a function` from
`core/Page/ai/work.js`'s `page_work_strip()` (the "What's in flight" strip this page already
had, unrelated to `chat.js`/`Widget`/`page.js`'s own demo — pre-existing, not touched by this
task). Likely `cards("open")` returning something other than an array or `null` when Servex
answers oddly. Left for whoever owns `core/Page/ai/work.js` next; not in this brief's fence.
