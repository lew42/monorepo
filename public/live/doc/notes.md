# Live: page.js and page.jsonl in one folder

**Hybrid works, with a catch.** The router finds `/live/` by importing `page.js`; it never loads a `page.jsonl` beside a `page.js` as the page itself (`core/Page/doc/loading.md`). So `page.js` draws the page and `Live.js` reads `page.jsonl` itself with `JSONL.live`, folding `log` lines and `content.add` cards (the same trick as `PageInbox`). The page tools only append lines to the file, so they work unchanged.

**Tradeoff.** A pure `page.jsonl` page would get the tools' full model for free but is not found without the parent naming it, and cannot drop the default chrome. Here `Live.js` understands only `log`, `title` and `content` add/remove; other deltas are ignored until needed.

## Why the phone stopped (2026-10-15)

The dev `Socket` only opens on `localhost`, `127.0.0.1` and `*.localhost` (an RCE guard, `framework/dev/Socket/Socket.js:51`). On the phone (LAN IP or tunnel) it is disabled, so `JSONL.live()` falls back to ONE `fetch` and never updates. Fix: `Live.js` has a `Tail` that, when the socket is disabled, asks only for the new bytes of `page.jsonl` (a `Range` request, whole lines only) every 3 s while the tab is visible, and again on becoming visible, on focus, on `online` and on `pageshow`. Off the phone the socket stream is unchanged and resubscribes from its offset after a reconnect. `?poll` on the url forces the Tail, to test it on localhost.

**Tradeoff:** off localhost this is a timer, against the stream rule, because a public stream means opening the socket to the LAN. Order: strictly by `ts`, newest first; a line with no `ts` is placed at the last `ts` seen before it, then by line order. Nothing is dropped.

## Why the phone stopped, again (2026-10-15 late)

The `Tail` fix works (headless tab over `10.0.0.135:3104`: a new line shows in 3 s). The phone tab had been opened before it landed, so it still ran the old `Live.js`, and an open tab never fetches new code. Fixes: `Tail.fresh()` reloads the tab once when `Live.js` changes (ETag), a line that names a card id now edits that card, `json` code blocks are pretty-printed and other code wraps. The old tab needs one manual refresh.

## Scrapping a rough card (the owner, by voice, 2026-10-16): considered, not now

/live only ever appends lines, so throwing away a rough card is awkward: the card stays until a `clear` blanks the whole screen. The owner is open to fixing this, but not now. Two options:
- **Rewrite the last line.** The owner's suggestion. Simple, but it is a rewrite, and the rule is to append, never rewrite.
- **A `drop` line naming the card id.** `Live.js` hides that card. History is kept, and it fits the append rule. This is the leaning, if it is built.
- **The re-prompt loop for waiting tasks is not built (the owner's direction, 2026-10-16, by voice).** The Today card now shows each task as done or "waiting on X" (`TaskState.js`, `Server/task-closeout.mjs`); a loop that re-prompts the waiting ones is the owner's next step, with Servex's TaskLoop the likely home.

## Direction: a two-way page and a walk-through mode (the owner, by voice, 2026-10-16 ~02:30Z): not built

**The ask, summarized:** before building any feature, mock its UX on /live first (UI-first). The direction has three parts.

1. **A two-way socket.** Page deltas get pushed through the dev-server socket instead of the roughly 3-second tail, in one universal way that doesn't depend on the adapter. Page UI events, such as a tap on a button or on a paragraph, go back up to Servex so the voice agent receives them.
2. **Walk-through mode.** The voice agent reads a card aloud section by section. A "stop" button on the page interrupts it, and tapping a paragraph means "resume here". The agent highlights the section being read by sending a delta that toggles a CSS class: the state lives on the page and the UI reacts to it.
3. **Server-side page instances** may be needed for 1 and 2. Whether the dev server or Servex owns them is open. The design so far is [core/Page/doc/server-instance.md](../../framework/core/Page/doc/server-instance.md); its first step is a `PageDoc` class that rebuilds a page's true state from its log.

**Why:** the voice agent and the page should talk both ways, so the owner can follow along on the phone and steer by tapping, not by speaking. Source: voice question 39c069fe, logged in [voice-20261016/task.jsonl](../../framework/ai/sessions/2026/10/16/voice-20261016/task.jsonl).

## Code on cards (the owner, by voice, 2026-10-16 ~02:42Z)

When the voice agent talks about code, the card it posts shows the code in real fenced code blocks, never paraphrased in prose. Code blocks scroll sideways by default; a `wrap` word in the fence info opts a block in to wrapping (being built, voice question 25f15826).

## 2026-10-16 — the feed tile says what the page says (owner)

A card's tile in the /live feed is navigation. Its text must be the card's title, nothing else: when I click "Now" I land on a page whose first heading is "Now". No mismatch between the link and what it links to. The `preview` field is not a place for a subtitle or a summary; if it differs from `title` it is wrong. (Said after the Now card showed "Done, in flight, waiting on you" in the feed.)

## Every card that was on /live, and its plan (checkup, 2026-10-16)

The law (CLAUDE.md): code streams the UI, never an agent. A card is agent-written text (stale the moment the work moves on) or a view (code reads the data). All twelve old cards were moved to [/live/archive/](/live/archive/) by `archive/ArchiveMove.mjs`; [archive/readme.md](../archive/readme.md) says how, and `archive/manifest.json` lists them.

| Card | Kind | Plan |
|---|---|---|
| now | agent text, edited by hand six times | replaced by the **Now** view (`LiveNow.js`) |
| tasks | view (`LiveTasks.js`) | kept, on the new /live |
| task-system-plan | agent text, rewritten about 15 times | archived; the plan lives in the task-system task folder, the status in `core/Task` |
| task-migrate | agent text | archived; status is the migration task's own `task.jsonl` |
| sheet-audit, sheet-proposal | agent text | archived; the sheet task folders and `ext/drawer` docs hold the substance |
| class-architecture | agent text (a design note) | archived; it belongs in `core/Item/doc/` (its owner could move it there) |
| live-classes | agent text about `Live.js` | archived; this module's readme supersedes it |
| task-audits, transcripts, chat bubbles, overnight | pointers already (data moved by the live-pointers task) | archived |

**Views that exist:** Now, Tasks, Today (`LiveToday.js`, the full session list; no card draws it now, add `{"type":"part-live","live":"today"}` to show it).

**Decision (checkup):** Now reads `LiveToday.load` for today and yesterday (UTC), so one reader serves both cards. It keeps the 30 s timer it inherits until the session writer exposes a stream; the better fix is a socket tail of the session index, which is larger and would win once that index is a JSONL.

**New cards from the voice agent** should be pointers (title, one sentence, links) or a `part-live` view; text that will change belongs in the log of whatever produces it.
