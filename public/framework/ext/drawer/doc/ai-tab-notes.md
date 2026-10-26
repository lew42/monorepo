# AI tab (ai.js) — design notes

## Architecture and overview

THE AI TAB — v2 (`ai/sessions/2026/09/29/audio/audio/c-chat/`, `Widget` as of round 3) is `ux/Dictate/Widget`: the log, the composer and the mic as ONE widget, the exact one the mobile ✦ sheet (`rail.js`) now also builds — "we need a consistent chat widget… whether it's in a desktop sidebar or a mobile sheet" (the owner, 2026-09-29; `ChatPanel` answered that call first, `Widget` replaces it here). `models: true` draws the picker above it, OFF in the sheet (the owner, round 3). v1, the hand-wired list-plus-composer this replaced, stays reachable as `aiV1` below (unchanged, still exported) — swap it in by pointing `tabs.js`'s "ai" row at `{ default: aiV1 }` instead of this file's own default.

Where a message goes is ONE function, `send()`, exported so anything else on the page — a picked element, minion 2's selection — sends the same way:
- **on a CARD**: where the card's composer already sends (Servex's prompt log, `re` the card), and the reply arrives in the card's own chat on the page;
- **on a plain PAGE**: the agreed page-pair route, `POST /api/page-ai` (ai/sessions/2026/09/28/recursive-pairs/recursive-pairs/interface.md); until Servex answers it, the dev bar's Ask route (ext/Ask), so a message still gets an answer today.

## Key routing and state management

Context for the Ask route is text: a list of picked elements becomes one line each.

### Reply polling

⚠ NO REPLY EVER SHOWED (mastermind, 2026-09-29): `POST /api/page-ai` answers at once with `{ok, assistant, manager}` and no text — the assistant's own answer lands a few seconds later, appended by Servex to the page's own chat log, a flat JSONL file at `<page>ai/chat.jsonl` (one line per turn: `{"prompt":{id,text,at,by}}` then `{"message":{by,text,at,kind:"reply"}}`). `send()` used to return the moment the POST answered, so both the sheet and the desktop drawer showed "sent" and then nothing, forever. This polls that same log, same-origin, until an assistant reply dated at or after this prompt's own send time shows up. `cache: "no-store"`: the file is growing under us, and a cached miss from the FIRST check (the file may not exist a split second before the prompt line lands) must never stick.

### send() function

Send one message from the drawer. Resolves `{via, text?, session_id?, note}`:
- `via` is "card", "page-ai" or "ask"
- `note` is one line to show the reader
- `text` is the reply — for "ask" the route hands it back at once; for "page-ai" the POST itself answers with no text, so this waits (polling the page's own `ai/chat.jsonl`, up to 90s) for the assistant's own reply and returns that
- `on({text})` fires once with a "waiting…" line while that poll runs, the same shape Ask's own streaming chunks use, so a caller that shows `on` chunks live needs no special case for either route

Example:
```js
await send({ page: "/framework/ux/Dictate/", text: "why two buttons?",
             context: [{ kind: "p", label: "this paragraph", text: "…", selector: "main p" }] });
```

`card` (an id) sends into that card; `thread` ({task, resume}) skips the page assistant, records an Ask exchange in that thread and resumes its session; `on` streams Ask's reply.

### Thread handling notes

A thread picked on the Sessions tab IS an Ask session, so it resumes there; only a fresh conversation goes to the page's assistant. Off the dev server there is no Servex to call (and an http:// call from an https:// page is blocked anyway).

The fallback is one turn of the dev bar's Ask bridge, on this tab's dev server.

**Session recovery**: ⚠ A thread's session can be GONE — Claude Code prunes old transcripts, and a session is filed under the directory it ran in, so one started in another tree is not found here. `--resume` then answers nothing at all. The thread goes on anyway: a fresh session, filed in the same thread, handed its last turns to read.

### Card posts

A CARD'S POST — the same two posts AI 2's own composer makes, copied from its `deliver` and `into_card` (ai2/compose.js), not imported, so this tab depends on the card's data (ai2/inbox.js) and not on AI 2's composer: Servex's prompt log, which the fast assistant reads, plus the card's own copy of the words.

## Helper utilities

### recap()

A thread's last turns, as text — what a fresh session reads to carry the thread on. Kept under 800 characters: the server cuts `context` there (ext/Ask/Ask.js).

### new_session()

NEW SESSION for the page's (or card's) own fast assistant — the ✦ sheet's "New session" button (`ext/drawer/rail.js`). On `DrawerRailSheetPanel` (the default sheet) a PLAIN page's sentence goes through a real voice session now (`ext/Session/Session.js`, wired in `rail.js`), which has its own, separate reset (`rail.js`'s own `forget_session()`) — this function is called for that sheet's CARD branch only. `DrawerRail.SheetLinksV1`, the earlier page-ai-bridge sheet kept reachable, still calls this for a plain page too, so both cases stay here.

`POST /api/page-ai` carries no session id of its own; the page's (or card's) assistant is a real Claude Code session that Servex's Layers.js resumes by ITS OWN session id, kept server-side. The only way to make the next message start a fresh one is to ask Servex to forget that id: `GET /api/page-agents` (or `/api/card-agents`) finds the assistant's agent id, then `POST /api/agent/<id>/recycle` forgets its session (Layers.js's own `recycle()` — "stop it and forget its session; its id is kept, and it restarts fresh"). Off the dev server (`!DEV`) there is no Servex to ask, so this only clears the sheet on screen; the caller (rail.js) does that part.

## Header strip architecture

THE HEADER STRIP (one-dictation drawer-chat, 2026-10-02 — the owner: "The UI needs to be very clear what's actually happening structurally in the data. Which session we're on should be abundantly clear. Which agents are listening should be abundantly clear."). This is what used to be the whole separate Sessions tab (ask 1: "AI and Sessions become one tab") — now three short lines above the chat, always telling the truth about the one thing every surface actually shares: ONE global conversation per browser tab (`ux/Dictate/chat.js`'s own `GLOBAL` controller, `ux/Dictate/readme.md`'s "the session is global"). `card` is never a second, scoped session — just a hint for the session's very first sentence — so this strip always says "global", truthfully, instead of guessing at a scope that does not exist today.

The strip shows:
1. **Session name**: the session's name (its `session_summary` title, once the smart assistant has given it one) and a link to its raw log file;
2. **Agent states**: the fast and smart assistants, as chips reading their LIVE state — working, idle, or asleep (Servex stops an idle pair after 5 minutes; "asleep" covers "stopped" and "never started yet" the same way, since a reader cannot tell those apart by looking and does not need to) — read from `GET /api/agents`, the one route every agent-state reader on the site already polls (`ai2/agents.js`, `core/Page/ai/live.js`); no new endpoint;
3. **The session switcher**: the shared `chat.session_switcher()` (`ux/Dictate/chat.js`, one-dictation item 4, 2026-10-25) — a "Switch session ▾" dropdown beside a bare "+", one click resumes a row. Built here first (2026-10-02, as a hand-rolled, in-flow "Switch session ▾" list); extracted into `chat.js` so the phone sheet's head (`ext/drawer/Sheet.js`) gets the exact same control instead of its own bare button with no way back — CLAUDE.md law 6, one control, not a second one per surface. The in-flow list reflowed this header when it opened (the owner, 2026-10-25); the dropdown now opens as a `ux/Popover` top-layer overlay instead, so it floats over the title/chips/v2-chip row rather than pushing it.

### Not folded in

The dev bar Ask's own older text threads and a card's sub-cards, which `tabs/sessions.js` used to also list below the voice sessions. Those are a separate, older kind of conversation (`aiV2`'s own `thread` handling, kept reachable below) — the dev bar itself (Ctrl+\) is still the live, maintained place to reach an Ask thread, and stacking a second, rarely-used list under the one the owner actually asked to see clearer would be the opposite of this task's own ask. `tabs/sessions.js` keeps existing, unchanged, for its `threads()`/`load()` exports (`dev/DevBar/ask.js` still imports them) and as a fallback module nothing routes to any more.

### Agent state labeling

"dormant", "stopped", "gone", or not found at all — Servex only keeps a live row for an agent that is actually awake; everything else reads the same to a reader deciding whether to expect a quick reply.

The fast/smart assistants' live state, `[{role, state}]` — reusing the one route every other agent-state reader already polls, never a new one. The agent ids are derivable straight from the session id (`doc/sessions.md`'s own file format: `"fast": "session-fast-<id>", "smart": "session-smart-<id>"`), so this needs no extra fetch of the session record itself. Fails soft to "asleep" for both, same as every other Servex read in this file.

## Chips row

What the next message is about, like the open file an IDE shows in its chat box — each element picked on the page (the Element tab's "Ask about this"), with an ✕. Shared by v2 (below) and v1 (aiV1) so both wire the same way.

## Live thread state

THE AI TAB'S OWN LIVE THREAD, if it is open on a card right now — one module-level slot (this tab is a singleton, like the drawer itself), read by `ai2/card.js`'s `sync_global_ai()` so a reply streaming in reaches this tab's thread too, without rebuilding the whole tab (which would wipe whatever the reader is mid-typing in its own composer below). `null` whenever the tab is shut, or open on something that is not a card.

SESSION_KEY: The SAME key `ext/drawer/rail.js`'s own ✦ sheet uses for its `sessionStorage` slot — "the SAME widget and the SAME session pair as the ✦ sheet" (the owner, round 4): a card session started here is the one the sheet picks up on the same tab, and back. Kept as its own literal, not imported from `rail.js`, so this file never has to import that one — `rail.js` already imports `tabs.js`, which imports THIS file, so a static import the other way would be a cycle (`code` skill's own warning: "a parent↔child import cycle breaks only on deep reload").

### Exports

`model()` and `MODELS` are re-exported for anything that still imports them from here — they themselves moved to `ux/Dictate/Widget.js` (round 3, 2026-09-30: "find the drawer's current model switcher and move it into the Widget") so `Widget`'s own `models: true` option can draw the picker without `ux/Dictate` reaching up into `ext/drawer`.
