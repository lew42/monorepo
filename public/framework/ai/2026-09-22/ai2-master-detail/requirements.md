# ai2-master-detail — AI 2 becomes a list on the left and one persistent page on the right; nothing ever jumps

Minion: Opus, effort high. Session id `a578212b-b9ee-4b41-aee9-6073bdbe5cc4`. You are IN A
WORKTREE (the launcher says where; your server's port). Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then
`public/framework/ai2/readme.md`, `doc/`, and `ai/2026-09-22/inbox-model/task.jsonl` (the
build you are reshaping — landed 18:22, 903 lines: `page.js`, `inbox.js`, `compose.js`,
`ai2.css`). Load `layout`, `css`, `code`, `ui-test`. You own `/framework/ai2/`.

## The owner's words (2026-09-22 18:31, verbatim)

> On the AI2 page things are jumping around because of live reload. I'm thinking we just
> disable live reload and go fully into the streaming mode. But as things are streaming, I have
> three cards up in this grid, and as a new card is added, the whole thing gets pushed down.
> It's jumpy. We do not want jumping things. We need a left sidebar that previews the things,
> and then when we click on one it stays selected and then I have a persistent page, so that
> you can update whatever page I'm talking about. We don't want things jumping around. Also
> there's a bunch of links on this page that are blue or purple, the default styling — we have
> a theme, I don't know why it doesn't work.

## Deliverables

1. **Master–detail.** Left: a narrow list (a column, ~22rem at 1280, full width at 400 with
   the detail as a second screen) of card previews — icon, title, one line, time, unread dot —
   newest first. Right: ONE persistent page for the selected card: its full text, the verbatim
   sentences and the assistant's reading for a prompt card, the names as chips, the flag, the
   links, and — for a card that is still evolving (a prompt the assistant is naming, a task
   that is `working`) — the page updates **in place** as events arrive. The selection persists:
   in the URL (`/framework/ai2/<id>/` — the URL is the truth, like the board) and across
   reloads and new arrivals. The splitter between them is `ext/grip` (fixed today).
2. **Nothing jumps.** A new card arriving while something is selected does not move the
   selected page and does not scroll the list under the pointer: it enters the list at the top
   only when the list is scrolled to the top and the pointer is not over it; otherwise a
   quiet "N new ↑" pill appears at the list's top and the rows stay where they are until the
   owner clicks it. The composer stays at the top of the list column, fixed height. Measure
   it: with a card selected, POST three prompt lines 2 s apart and record the selected page's
   top edge and the list's scroll position before and after — all unchanged.
3. **The theme applies.** Every link on AI 2 wears the site's link style (`.page-link` /
   `framework.css`'s link rules — find why a card's `<a>` is falling back to the UA default:
   probably the `full` page shell or an `ai2-` rule resetting `color`, or links built without
   the class the theme targets). Fix the cause; no `ai2-` rule that restates the theme.
4. **Streaming, not reloading:** the page subscribes to Servex's `/api/stream` and the dev
   server's `data` event (reload-rethink, landed 18:15) for `board.jsonl`/`prompts` changes and
   never needs a reload for content; say in the readme which changes still reload it (only its
   own modules) and that a minion editing AI 2 works in a worktree.
5. **Proof (ui-test):** headless at 1280 and 400: select a card, post three prompts, the five
   measurements unchanged; click the "new" pill → rows appear; reload → same card selected;
   the URL of a selected card pasted fresh → selected; links styled (computed color equals the
   theme's link color, not `rgb(0,0,238)`); zero console errors. Screenshots into your task
   dir. Land by the launcher's copy of `ai2/` (rm + cp, hold on/off with `--paths
   "public/framework/ai2/**"`, seconds) and prove on the main tree's 8123.

## Fence

`public/framework/ai2/**`, your task dir, `ai/2026-09-22/page.js` `children:`. Not `ux/Dictate`,
not `v/3`, not `framework.css`.

## Length

Fewer lines than 903 is the goal. Landing report: five sentences and the measurements.

## Owner addendum (18:34, verbatim) — read before you build; these outrank the numbered list

> the cards on the AI2 page, when I click on them, they're disappearing — becoming read when I
> click on them. No no no. I need them all unread again. I need them prioritized: small cards,
> medium cards, and large cards — large topics that I keep referring to need to become a big
> thing that stays on my screen. The AI2 page needs to be a left sidebar rail like the main one.
> The area on top with the text input is massive, way too much padding; that whole UI needs to
> be way more compact, the microphone at the end of the text area like normal. It is the
> dictate UI — I don't mind having it there, but it's taking a third of my screen. The dashboard
> must be minimal, no dead use of space.

6. **Nothing is marked read by a click.** Remove mark-read-on-open entirely; ignore every
   `say: "read"` line already in `ai/verdicts.jsonl` (all cards are unread again on your first
   landing). Read/unread comes back only as an explicit, tiny control later — not now.
7. **Three sizes, by importance.** In the left list every item is one compact row (small). The
   right page shows the selected card (large). Between them, importance: a topic the owner
   keeps returning to (the same card id evolved many times, or many prompts citing it — count
   the events per id) is pinned as a **medium** card at the top of the list, above the flow,
   and stays there; at most three pinned; the count that decides it is one constant, logged.
8. **The composer is one line.** A single-line input with the mic button INSIDE its right end
   and Send beside it; the engine words, the "stop after a pause" box and the assistant note
   collapse into a small `…` that opens on hover/click. Total height of the composer block ≤
   one control height plus one rung of padding — measure before (the owner saw 277px) and
   after, at 1280 and 400. Dictate's own status text is drawn inside its button's tooltip, not
   as a row. This does not edit `ux/Dictate` — it is how AI 2 mounts it (`compose.js`).
9. **The list is a rail like the site's.** The left column reads like the main rail: no card
   chrome per row, a hairline between rows, the selected row marked the way the rail marks the
   active page, the scrollbar on the column's own border, full workspace height.

## Owner addendum (18:50, verbatim excerpts) — items 10–14; 6–9 still stand

> when I click the microphone to start talking, there should be a little meter that shows zero
> — it should look empty if the microphone's not working — and a menu button to switch the
> microphone source. … If I click on a specific card, expanding in place is not the right way,
> it's still jumpy. I want to click on a card and dig into it: the preview rail plus detail
> page. … I'm not sure what this little orange dot is in front of each card — redundant, unless
> it's a status indicator. I might see a small preview of the current state on the card. … each
> card should have a microphone button. … Let's try a dark themed card, a special card for a
> minion or a mastermind session — big tasks where a mastermind is spawned, a worktree is
> spawned — help me see what's going on. … 331 unread, a wall; I need to see it in a digestible
> way: each card named really well, with an icon that represents it. … I just saw that when I
> select some text a little flag appears — I really like that. … The layout should never jump.

10. **No expand-in-place.** A click on a row selects it and opens it in the detail column,
    never expands it in the list. The selection-flag on selected text stays exactly as it is.
11. **The mic shows it hears you.** Beside the composer's mic (and any card's mic): a small
    level bar that is visibly EMPTY when nothing reaches the browser, and a `⋯` beside it that
    opens the microphone picker (reuse the bench's picker/meter code from
    `ai/2026-09-22/dictate-silence/page.js`; `ux/Dictate` already takes `deviceId`). Each
    detail page gets a mic button of its own that posts to `/log/prompts` with `re: <card id>`.
12. **The dot means status or it goes.** The orange dot is shown only as a status: working
    (pulsing), needs-you (solid), otherwise nothing. A row shows a one-line preview of the
    card's CURRENT state (its `now`/last text), not its first sentence.
13. **A dark session card.** A card whose author is a mastermind or a minion session (a task
    with a `session_id`, an agent from Servex's registry, a worktree) renders dark: the
    session's id, role, model, state, worktree and port, its last line, and a link to its task
    page — so "what is going on" reads at a glance. One class, `ai2-session`.
14. **Views.** The chrome stays one line, but the list column can switch between `inbox`
    (default, this design), `sessions` (only dark cards), and `days` (the landed-work rows) —
    three words, URL-backed like the board (`/framework/ai2/sessions/`).

## Owner addendum (18:55, verbatim excerpts) — items 15–17

> I've been transcribing to the AI2 page and it's been making these cards — this is getting
> way closer to what I've been looking for. But it's chunking off every sentence I say into
> its own card and summarizing them, which is not quite right. I want control over the
> sessions, the cards: I should be able to create a new card and then talk to that card, so
> the transcription is baked into that card, and everything that gets created goes into that
> card initially — unless something gets promoted to the main card list. I do like the
> zero-gap sidebar; the scrollbar looks way better. … the sidebar is jumping: as the
> transcription gets bigger and goes from four lines to five, it pushes the cards down.

15. **A card you talk into.** A `New card` control at the top of the rail creates a topic card
    and selects it; while a card is selected and the mic (or Send) is used, each finished
    sentence is appended INTO that card (`prompt` lines carry `re: <card id>`; the detail page
    shows them as the card's running transcript, appended, never moved). The assistant then
    names and summarises THE CARD as a whole (one `refined` per card, updated in place; no
    per-sentence cards) — the fast assistant already takes a `re`, so this is the composer
    sending `re` and the assistant brief saying "when `re` is set, evolve that card". With no
    card selected, a sentence starts a new topic card as today. `talk`'s TalkMic already does
    the append-into-one-card part — reuse it.
16. **Promote.** On a sentence or a card inside a topic: one small `↑` that appends a `card`
    line to the main list (a new id, `re` → the source) — that is "promoted to the main list".
17. **The composer never grows.** Its height is fixed (one line; the transcript lives in the
    card, not in the box), so nothing under it ever moves. Measure: rail row tops before and
    after a five-sentence dictation — identical.

## Owner addendum (18:59, verbatim excerpts) — item 18, which shapes 15 and 17

> the live transcription has a text area above it and buttons and checkboxes and a send button
> — that needs to be cleaned up. Creating a new card that's pretty much just a blank workspace
> and maybe by default just starts recording my voice, and the transcription starts putting
> words on the screen, and then those words start getting refined into concrete ideas. I don't
> like that my words disappear. If each transcription is put into a specific card, then that
> card could have, in a footer, the transcription — the last paragraph always on screen — it's
> nice to see the words being transcribed in real time to make sure the thing's still listening.

18. **A new card is a blank workspace that listens.** `New card` opens an empty detail page
    and starts the mic by itself (open until pressed). The detail page has two fixed regions:
    the **ideas** above (the assistant's title, reading, names and, later, the task strip —
    each updated in place) and the **transcript footer** below, pinned to the bottom of the
    detail column, showing the live words as they arrive (grey partial → solid) with the last
    paragraph always visible and a scroll for the rest — the words NEVER disappear and never
    move up into a box. The composer's text area, checkboxes and Send collapse to one line
    inside that footer (type here · mic · ⋯) — reuse `talk`'s `TalkMic` and its card for the
    footer. Measure: while ten sentences stream in, the ideas region's top and the footer's
    top do not move.

## Owner addendum (19:03, verbatim excerpts) — items 19–20

> the items in the inbox need an author so I know who it's coming from, whether it's something
> I said. I don't see your note in that list. They need to be groupable or nestable so any card
> can receive — I click into one and the dictation goes to that card rather than creating new
> inbox items. Different sections within a card, like an outline of tasks, and I click through a
> specific one.

19. **Every row says who.** A one-word author on every rail row and every detail page — `you`,
    `assistant`, `mastermind`, `<minion name>` — with a distinct mark for `you` (your own
    words) so the owner's sentences read apart from everything else. The mastermind's `Note:`
    cards must be findable: they are `card` lines in `ai/board.jsonl` with `author: mastermind`
    — show them in the rail like any card, and add a `notes` word to the views (item 14) that
    lists only them.
20. **Sections inside a card, each a target.** A card's detail page can hold sections (the
    assistant's `proposal` bullets, an outline, tasks); each section is selectable, and a
    selected section becomes the `re` target for the next sentences (nesting: `re: <card>/<section>`).
    Keep it simple: a section is a `refined` or `proposal` line with `re` → the card; selecting it
    highlights it and shows "talking into: <section title>" in the footer.
