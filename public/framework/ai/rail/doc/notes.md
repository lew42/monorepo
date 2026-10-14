# Rail notes

Original comments pruned from `inbox.js`, kept here by heading; the code points at these.

# inbox.js

## Inbox order

(inbox.js lines 11-15, original comment)

~~~text
/** THE INBOX ORDER (INBOX ZERO, 2026-09-30). A row scoring HOT (≥90 on `importance()`,
 *  needs-rule.js: a blocker, a question a live agent is blocked on, or anything else while it
 *  is still fresh) sits on top, highest first; everything else stays newest first. `page.js`
 *  sorts with this same function after it sets each card row's own score, so there is one
 *  order, never two. */
~~~

## The inbox model

(inbox.js lines 21-45, original comment)

~~~text
/**
 * THE INBOX MODEL — three logs in, one list of cards out.
 *
 * The page draws; this file decides what there is to draw. Nothing here knows
 * about the DOM, which is why the whole "what is a card" question can be read
 * in one place.
 *
 * The three sources, and what each one is:
 *
 *   1. `ai/board.jsonl` — what the mastermind and the minions posted. One
 *      `card` line per thing; more lines with the same `id` update it in
 *      place. A card whose title starts with "Note:" is an explanation the
 *      mastermind wrote for the owner, and it reads as a note, not a report.
 *   2. Servex's own `prompts` log — the owner's spoken and typed sentences,
 *      and everything the fast assistant made of them seconds later. One
 *      card per PROMPT, which then grows a title, a reading and some names
 *      without ever becoming a second card.
 *   3. Today's `ai/<date>/day.jsonl` — the one line a task writes when it
 *      actually lands. "What happened" and "what I said" belong in the same
 *      stream, so a landing is a card here too.
 *
 * And one more log that is not a source but a STATE: `ai/verdicts.jsonl`,
 * where every "I opened this" and every flag lands, one append-only line each
 * (`Server/plugins/CardAnswer.js`'s own `card_say`).
 */
~~~

## Board

(inbox.js lines 53-55, original comment)

~~~text
/** `board.jsonl` — cards merged by id, newest fields winning, the exact rule
    every other reader of this file already uses. A `say` line with no title is
    the dev bar composer's own echo of what the owner just typed, never a card. */
~~~

## Verdicts: read lines are ignored

(inbox.js lines 69-84, original comment)

~~~text
/**
 * `verdicts.jsonl` — the same append-only file the old board wrote Approve and
 * Improve to. Only the FLAG is read from it now:
 *
 *   `flags`  — the ids flagged RIGHT NOW. An `improve` line puts one in, a
 *              later `reopen` line takes it out again, so pressing the flag
 *              twice leaves no flag and two lines of history.
 *
 * ⚠ `read` LINES ARE IGNORED, on purpose (the owner, 2026-09-22: "when I click
 * on them, they're disappearing — becoming read when I click on them. No no no.
 * I need them all unread again"). Nothing on this page marks a card read any
 * more, and the `read` lines already in the file are not replayed, so every card
 * is unread again. The file still holds them — nothing was deleted — and
 * read/unread comes back later as an explicit, tiny control, never as a side
 * effect of looking at something.
 */
~~~

## Say

(inbox.js lines 96-98, original comment)

~~~text
/** One line onto `verdicts.jsonl` through the dev server, which also tells the
    mastermind and rings it for a flag — `Server/plugins/CardAnswer.js`. True
    when the server actually took it. */
~~~

## The live prompt log

(inbox.js lines 109-118, original comment)

~~~text
/**
 * Servex's own log of what the owner said. One fetch for the backlog, one
 * `EventSource` for everything that arrives after — copied from the working
 * client on the old board (`ai/v/3/prompts.js`) rather than imported, because
 * that board is being replaced and this page must not go down with it.
 *
 * Servex may not be running at all. Then the backlog comes from the static
 * `prompts.jsonl` the dictation box falls back to writing, `ok` stays false,
 * and the page says the assistant is off instead of throwing anything.
 */
~~~

## One EventSource per base

(inbox.js lines 123-132, original comment)

~~~text
/**
 * ONE EVENTSOURCE PER BASE, DEMUXED BY LOG NAME. `prompts` was the only log
 * this page ever read live; a card's own `cards/<slug>` (decision
 * `card-storage`, ai2-nested) is the second, and there can be dozens of those
 * open across a session — one `EventSource` each would be dozens of open
 * sockets for nothing `/api/stream` doesn't already carry on the one it has
 * open. `sources` holds the one connection per base; `streams` holds one
 * entry-list per `(base, log name)`, same shape as the original `prompt_stream`
 * so nothing that already reads `.entries` / `.on()` / `.ready` had to change.
 */
~~~

## Log stream

(inbox.js lines 154-156, original comment)

~~~text
/** The backlog for one Servex log, then everything that arrives after, over the
 *  one shared `EventSource`. `fallback`, when given, is a static file this page
 *  reads instead when Servex itself is not answering — only `prompts` has one. */
~~~

## Stalled-ask ids

(inbox.js lines 196-204, original comment)

~~~text
/** One card's own append-only stream, `cards/<slug>` — the store deliverable 1
 *  adds. No static fallback: a card with Servex down simply shows nothing new
 *  until it comes back, same as the live prompt stream does today.
 *  ⚠ A STALLED-ASK ROW's pseudo-id (`ask:<ask id>`, course correction, 2026-09-30) is never a
 *  real card slug, and Servex's `cards/<slug>` route answers a colon in one with 400 — this
 *  short-circuits to an empty, inert stream (the same shape `log_stream()` returns, so every
 *  caller's `.entries`, `.ready` and `.on()` still work) instead of ever asking for it. A
 *  stalled-ask card page's own content comes entirely from its row's `full()` data anyway
 *  (`page.js`'s `card_page()` reads `by_id.get(id)`, this list's own item, not a card log). */
~~~

## Day streaming

(inbox.js lines 265-273, original comment)

~~~text
/**
 * Today's `landed — …` lines, STREAMED like the other two logs.
 *
 * ⚠ Not a `fetch()`, and not the socket's `data` event either: the dev server
 * routes EVERY `.jsonl` change to `Tail.changed()`, its own line-streaming
 * wire, and never broadcasts it as a reload — so `data` never fires for one,
 * however plainly the tab has fetched it. Subscribing is the wire that carries
 * it. `doc/logs.md`.
 */
~~~

## Stalled asks as rows

(inbox.js lines 293-304, original comment)

~~~text
/* ── a stalled ask, as one more Inbox row (course correction, 2026-09-30) ─────────────────
 * The owner: "the inbox and the needs you, that sounds like the same thing... let's forget
 * the needs you page for now and focus on the inbox." So a STALLED line in the asks ledger
 * (`/framework/ai/asks.jsonl`, `Servex/asks/Asks.js`'s own word) becomes one row in THIS
 * list, never a second view. `AskFold.fold()` is the one vocabulary Servex's own Asks.js folds
 * the same way, so this page and the ledger can never disagree about what is stalled.
 *
 * ⚠ NO NEW POLLER. `items()` below runs synchronously, every time something already live —
 * a prompt, an agent moment, the card list — repaints this page, which on a system with
 * agents running happens often. `stalled_asks()` just refreshes its own cache in the
 * background and returns whatever it already has; a stalled ask is quiet for 2+ hours
 * before it even qualifies, so a few seconds of staleness here changes nothing. */
~~~

## Words url

(inbox.js lines 321-323, original comment)

~~~text
/** A ledger `words` path as a served url under `/framework/`, or `null` when it is not
 *  served at all (`.claude/prompts/...` — a words file to show as plain text instead of a
 *  dead link). */
~~~

## Awaitable stalled asks

(inbox.js lines 349-352, original comment)

~~~text
/** The same rows, but AWAITABLE — for the one caller that cannot live with a cold, empty
 *  cache: `resolve_card()`'s "ask:" redirect, which can run within the first few
 *  milliseconds of a fresh page load (a pasted or bookmarked `/ask:.../` url), before
 *  `items()` has ever run once to warm `stalled_asks()`'s own cache the normal way. */
~~~

## Stalled-ask read state

(inbox.js lines 362-366, original comment)

~~~text
/** A stalled-ask row's read state (course correction: "unread is bold, read is plain", and
 *  opening it once reads it). It is the Inbox's OWN read state — the same localStorage key
 *  `rules.js` `is_read()`/`mark_read()` use, so the row's dot and page.js's `paint()` agree.
 *  The key is repeated here, not imported, because rules.js imports this file (a cycle).
 *  Opening marks ONLY a stalled row read; every other row still waits for its dot. */
~~~

## Role word

(inbox.js lines 382-384, original comment)

~~~text
/** WHO MADE A CARD, as a plain role word — or null. A card folder's `by` is
    usually an agent's id (`minion-ai2-groups`, `health-watch`), and an id is
    never shown in a card's head (the owner, 2026-09-24). */
~~~

## Entry id

(inbox.js lines 394-406, original comment)

~~~text
/**
 * THE ID OF A LOG ENTRY — its own `id` when it has one, and otherwise one made
 * from its timestamp.
 *
 * Servex mints ids now, but the oldest lines still inside its window (and the
 * first lines of the static `prompts.jsonl` fallback) were written before it
 * did. Those entries still need an id, because the id is what a `read` mark and
 * a flag are attached to — and it has to be STABLE. The obvious choice, the
 * entry's position in the list, is not: the log is a rolling window, so
 * `prompt-0` means a different sentence every time an older line falls off the
 * end, and a flag the owner put on one sentence would quietly reappear on
 * another. A timestamp does not move.
 */
~~~

## Refs

(inbox.js lines 409-412, original comment)

~~~text
/** What a line is answering, ALWAYS as a list. ⚠ `re` is a bare id on a `name`
    line and an ARRAY on a `card` line — the assistant can title one idea it read
    across several sentences — and reading it as a string alone silently drops
    every one of the array kind (measured on the live log, `ai/talk/`). */
~~~

## New card

(inbox.js lines 415-425, original comment)

~~~text
/**
 * A NEW CARD TO TALK INTO — a real `card` line on `ai/board.jsonl`, not a thing
 * this page remembers by itself.
 *
 * That choice is the whole reason it works with nothing else built: the board is
 * already streamed into this page line by line, already merges later lines with
 * the same id in place, and is already what every other reader of this repo
 * looks at. So the card appears in the rail by the same route a minion's card
 * does, the assistant can evolve it by appending another line with the same id,
 * and it survives a reload without a scrap of browser storage.
 */
~~~

## Stamp

(inbox.js lines 426-428, original comment)

~~~text
/* Local time with its offset — the same format `say.mjs` and Servex's own
 * `stamp()` write, so one line's clock reads the same as every other writer's
 * instead of a bare `.toISOString()`'s UTC "Z" standing out on its own. */
~~~

## Archive

(inbox.js lines 442-446, original comment)

~~~text
/** Nothing is ever deleted (the owner, 2026-09-22) — `clear` on a card page
 *  writes one more board line, `status: "archived"`, merged onto whatever is
 *  already there by id; `items()`'s own filter is what then hides it and its
 *  count. Scoped to board-born cards (`+ New card`'s own `topic-…` ids) — the
 *  ones the owner actually meant ("four new cards labelled you"). */
~~~

## Card folders

(inbox.js lines 452-459, original comment)

~~~text
/* ── card folders: one folder per card (Servex/cards) ─────────────────────
 *
 * A card is a folder under `ai/`, and its id is its path there:
 * `2026/09/24/fix-the-sidebar`, a sub-card one segment deeper. Servex's
 * `Cards` is the only writer; this page asks it through four routes and never
 * builds a folder itself. A card's own page reads its `page.jsonl` straight
 * off the dev server (`card.js`), so only the LIST and the WRITES go through
 * Servex. */
~~~

## cards_ready

(inbox.js lines 467-475, original comment)

~~~text
/**
 * DOES THIS SERVEX HAVE THE CARD ROUTES? Asked once per page: a Servex running
 * the card code appends `{"cards": 1}` to its `features` log when it boots.
 * An older Servex answers `/log/features` with `[]` (and a CORS header, so no
 * console error) — then every card call below returns null WITHOUT a request,
 * because an old Servex answers `/cards` with no CORS header and the browser
 * logs that as an error nothing can hide. `cards_ready.known` is the answer
 * once it is in, for code that draws synchronously.
 */
~~~

## Content type

(inbox.js lines 486-487, original comment)

~~~text
/* ⚠ Servex answers an unknown route with its dashboard's HTML at 200, so
 * `r.ok` is not enough — the content-type is the 404, as everywhere here. */
~~~

## Reads are static files

(inbox.js lines 503-508, original comment)

~~~text
/* ── READS ARE STATIC FILES (no Servex) ───────────────────────────────────
 * Production is a static site, so the list and every card's state come off
 * plain files: `ai/cards.jsonl` (one summary per line; Servex only keeps it
 * fresh) and each card's own `page.jsonl`. The index replaces walking ~400
 * folders. Missing index: walk the year → month → day pages, top-level cards
 * only. Servex answers only what a file cannot: writes, live agents, push. */
~~~

## Stalled-ask redirect

(inbox.js lines 528-534, original comment)

~~~text
/** One card's folded state, read off its `page.jsonl` — no Servex. An OLD (non-folder) id
 *  still asks Servex, which alone knows the legacy map.
 *  ⚠ A STALLED-ASK ROW's id (`ask:<ask id>`) is never a folder id, so it fell through to
 *  Servex and 404'd — `card_page()` (page.js, untouched by this fence) then correctly shows
 *  its own row's `full()` content (the ask's title, why and links), but this extra check is
 *  what makes its own OLD-ID-SWAP logic redirect straight to the real card when it has one,
 *  exactly like a migrated board id already does — no page.js change needed for that hop. */
~~~

## The now card

(inbox.js lines 536-543, original comment)

~~~text
	// THE NOW CARD HAS NO FIXED FOLDER (bug, 2026-10-03: the owner couldn't find it in the
	// rail at all). `page.js`'s own comment called `ai/now/` "a real card folder", but no such
	// folder exists — the card is made fresh under a NEW dated folder (`ai/sessions/2026/10/03/cards/now/`)
	// each day it's rewritten, so the literal id "now" is never a folder id (`is_folder_id`
	// needs a leading year) and fell through to Servex's OLD-BOARD-ID lookup below, which has
	// no mapping for it either. Fixed the general way: find the latest real card whose id ends
	// "/now" in the static index (`cards.jsonl`, the same file the rail's list is built from)
	// and resolve THAT folder instead. No new mechanism — reuses `static_cards()`, `is_folder_id`.
~~~

## Awaited cache

(inbox.js lines 555-556, original comment)

~~~text
		// Awaited, not the plain cache read `items()` uses — see `stalled_asks_ready()`'s own
		// comment: this can run before anything else has warmed the cache at all.
~~~

## Marked read in resolve_card

(inbox.js lines 559-563, original comment)

~~~text
		// ⚠ MARKED READ RIGHT HERE, not only by `items()`'s own `location.pathname` check below
		// — a has-a-card ask REDIRECTS the instant this resolves (page.js's own `activated()`,
		// right after this call), so the browser may never sit on this url long enough for any
		// `paint()` to see it as `location.pathname` at all. This is the one place that always
		// runs exactly when the owner opened it, has-a-card or not.
~~~

## Card prompt

(inbox.js lines 571-583, original comment)

~~~text
/**
 * THE OWNER'S WORDS, AS A RECORD OF THEIR OWN (the owner, 2026-09-24: "Every
 * prompt that I make is very tangible. It's a quotation"). One `prompt` line
 * on the card, `raw` verbatim; Servex stamps its `id` and `at`, and a later
 * line with the same id is the cleaned reading. `Servex/cards/readme.md`
 * defines the shape.
 *
 * `context` (optional) is the drawer's chips — the elements picked on the
 * page — carried along so the card-assistant sees what the words are about,
 * not just the words (ext/drawer/doc/select.md's `item()` shape). Typed and
 * dictated words both go through this one function, so neither send path can
 * drop it on its own.
 */
~~~

## CardList

(inbox.js lines 588-598, original comment)

~~~text
/**
 * EVERY FOLDER CARD, as Servex's short summaries — `GET /cards?view=all`,
 * `{id, title, type, status, tags, created, last}` each. `ok` stays false when
 * Servex is down or has no card routes; the page then reads `board.jsonl` as
 * it always did.
 *
 * It POLLS, gently: a card's own page streams its own log live, but a line
 * written into some OTHER card (a reply, a new sub-card) only moves that card
 * in the list, and nothing streams the list itself. `refresh()` after this
 * page's own writes makes those appear at once.
 */
~~~

## Threads

(inbox.js lines 662-664, original comment)

~~~text
/* Everything one prompt turned into, gathered off the fold's own `children` —
   every line the assistant appends carries `re` pointing back at the prompt it
   answers, which is why this is a few lines and not a search. */
~~~

## Task lines

(inbox.js lines 678-682, original comment)

~~~text
			/* A `task` line hangs off the CARD it answers, not the prompt
			   (`Servex/agents/Assistant.js`'s `entry()`), so it is a grandchild
			   here — the Dispatcher keeps rewriting the SAME id's `state` and
			   `now` as a task mastermind works, and the fold's newest-wins
			   merge is what makes that one thing instead of a growing list. */
~~~

## items

(inbox.js lines 688-709, original comment)

~~~text
/**
 * THE LIST THE PAGE DRAWS — board cards, prompt threads and today's landings,
 * merged into one stream, unread first and newest first inside that.
 *
 * A landing and a board card can be the SAME piece of work under the same
 * name: the minion posts a card called `padding-audit` and then lands a task
 * called `padding-audit`. That is one thing, so it stays one card, and the
 * landing only adds its sentence and a link to the task page. This is also why
 * "cards on screen" can be counted against "board ids ∪ prompt ids ∪ landed
 * tasks" and the two agree: every source contributes an id, and an id that two
 * sources share contributes it once.
 */
/**
 * `groups` (optional — `Groups`, `groups.js`, passed by `page.js` when it has one built) is
 * how a folder-card row gets its REAL last-activity time instead of the server index's own
 * `last`, which still counts a `servex-heartbeat` notice as activity the same naive way
 * `fold.js`'s `state.last` does (item A, 2026-09-30). `groups.real_at(id)` returns the
 * fold-based recompute once that card's raw lines have been fetched (`Groups.read_cards()`
 * fetches every card touched in the last two days — every card that could plausibly be a hot
 * Inbox row) and `null` otherwise, so this always has a safe fallback to the index. Omitting
 * `groups` entirely (a caller that has none built yet) behaves exactly as before.
 */
~~~

## Folders replace the board

(inbox.js lines 715-717, original comment)

~~~text
	/* THE CARD FOLDERS REPLACE THE BOARD when Servex answers — every board card
	   was migrated into a folder (`Servex/cards/migrate.mjs`), so reading both
	   would show each one twice. Servex down: the board, exactly as before. */
~~~

## Newest sub-card

(inbox.js lines 721-722, original comment)

~~~text
	/* A CARD IS AS NEW AS ITS NEWEST SUB-CARD (the owner, 2026-09-25: "any update to a child
	   bumps the parent's last-updated"), so a topic touched deep down rises in the rail. */
~~~

## Spoken into a card

(inbox.js lines 742-748, original comment)

~~~text
	/* A SENTENCE SPOKEN INTO A CARD IS NOT A CARD OF ITS OWN. Every board card's
	   id is known by now, so a prompt whose `re` names one is that card's
	   transcript instead — appended, in the order it was said, never moved (the
	   owner, 2026-09-22: "it's chunking off every sentence I say into its own
	   card… I should be able to create a new card and then talk to that card").
	   A prompt with no `re`, or one citing something this page has never heard
	   of, still starts a card of its own exactly as before. */
~~~

## Sub-card speech

(inbox.js lines 752-753, original comment)

~~~text
		// A sentence spoken into a SUB-card (`<card>/<sub>`) belongs to its card;
		// one spoken into the Live card lives in the Live card's own chat.
~~~

## Folders and said sentences

(inbox.js lines 756-759, original comment)

~~~text
		// ⚠ With folders, a sentence said INTO a card is already that card's
		// own `prompt` line — and the old board ids its `re` may name are not in
		// this list any more, so "unknown host → a card of its own" would turn
		// every old sentence into a card. Said into anything: never its own card.
~~~

## Task state

(inbox.js lines 781-784, original comment)

~~~text
			/* A mastermind has taken this card and is running with it — `state`
			   is `queued` grey, `working` (with `now`, its live progress line),
			   `landed` or `blocked`. `null` when the sentence was a note or a
			   question, which never gets a task line at all. */
~~~

## Stalled row

(inbox.js lines 810-815, original comment)

~~~text
	/* A STALLED ASK, AS ONE MORE ROW (course correction, 2026-09-30 — see the long comment
	   on `stalled_asks()` above). `id: "ask:" + ask id` so it can never collide with a real
	   card's own row. Its read state (deliverable 4) is marked by `resolve_card()`, above —
	   NOT by checking `location.pathname` here: a has-a-card ask redirects the instant it is
	   opened (page.js's own `activated()`, right after `resolve_card()` resolves), so the
	   browser may never sit on this row's own url long enough for any `paint()` to see it. */
~~~

## Future clocks

(inbox.js lines 839-840, original comment)

~~~text
	// A clock from the future is a hand-typed mistake (a day-log line said 21:10 -07:00 for a
	// 15:53 -05:00 landing, 2026-09-25) and would pin its row to the top forever: it counts as unknown.
~~~

## Stalled unread

(inbox.js lines 853-855, original comment)

~~~text
	// A STALLED ROW IS THE ONE EXCEPTION TO "ALWAYS UNREAD" (deliverable 4) — `Says`'s own
	// comment above says why nothing else here has a read state any more; this one does,
	// because the brief asked for it, and it overwrites the blanket `true` just set above.
~~~

## Archived foot

(inbox.js lines 857-860, original comment)

~~~text
	// 2026-09-22 20:00, the owner: "if it doesn't help me, it shouldn't be on the board" — an
	// archived card leaves the rail and the counts; item 12's "archived (n)" foot reads
	// `.archived` off the returned array (still a plain array everywhere else) to show them
	// again, greyed, without a second call or a second shape.
~~~

## Never twelve of the same

(inbox.js lines 863-865, original comment)

~~~text
	/* NEVER TWELVE OF THE SAME (the owner, 2026-09-25: "recycle the old one if it happened within
	   the last minute or two"). Two rows with the same title less than two minutes apart are one
	   row: the newer is kept, and the older one's words go under it. */
~~~

## Sub-cards

(inbox.js lines 881-892, original comment)

~~~text
/* ── sub-cards: deliverable 3 ──────────────────────────────────────────────
 *
 * A CARD'S OWN TABLE OF CONTENTS, read off ITS OWN LOG (`cards/<slug>`) —
 * `AI 2 SWITCHES ITS READER`, deliverable 1's own words. Every task, proposal
 * and refined reading is already one thing in `fold()`'s own bins; a
 * transcript paragraph is not, so one row is made per `prompt` entry, which is
 * already one paragraph — a sentence is not a sub-card, a spoken turn is.
 *
 * `sub` is the THIRD URL SEGMENT (`/framework/ai2/<slug>/<sub>/`) — prefixed
 * by kind so a task's own event id (say, `t-1`) can never collide with a
 * proposal's or a prompt's, all three of which mint ids from the same small
 * alphabet independently. */
~~~

