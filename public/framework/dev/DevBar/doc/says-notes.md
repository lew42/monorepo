# DevBar/says.js — history and reasoning

## The Mastermind Log design

The owner's direction across five passes on 2026-09-19 — read in order, each one still true, the later ones correcting or extending the earlier:

1. **Chat log style:** "a card that I can scroll through, and if I click on one it expands and takes over the whole dev bar."
2. **Cards evolve:** a later `card` line with the same `id` updates that card WHERE IT SITS (title, status, text — a brief highlight, an "updated H:MM" stamp) instead of a duplicate lower down; a new id still appends at the bottom. Renamed from "the mastermind says".
3. **Multiple authors:** Three (then more) AUTHORS in one stream: the owner's own words (`author: "owner"`), the assistant's, the mastermind's, and — as of pass 5 — a MINION's own task slug. A small label on every card.
4. **One joint timeline:** this view and the V3 page read the same model (`ai/v/3/timeline.js`) so they can never disagree, oldest to newest, with `needs-you` cards pinned in a strip above the stream AND accented where they sit in it — "anything that needs the owner's yes... make those unmistakable."
5. **No truncation, fills page:** "the chat log... seems to have a max height or truncates long text" — FIXED: the log is now the section that FILLS the page tab (every other page-tab section sits below it, reachable by scrolling `.dev-body` — `doc/decisions.md` has the alternatives this was weighed against), and a card shows its real text INLINE in the stream, up to ~6 lines, clamping beyond that; the owner's own prompts are NEVER clamped. Also: `board.jsonl` grew a SECOND line kind, `chunk` — text streamed onto a card that is still being typed out, appended as bare text nodes (never a re-render) so nothing being read moves; a caret marks the live edge, and the card settles back to its normal size once the real `card` line lands or ~3s pass with no new chunk.

## Two guarantees every pass keeps

- Nothing the owner is READING changes under them: an update to the OPEN card offers "updated — show" rather than swapping silently; a streaming card grows by appending text nodes, never by rebuilding itself.
- The list never jumps while scrolled up: true structurally for an in-place update, and for streaming; true for a new card by only auto-scrolling when the list was already at the bottom.

## Streaming idle timeout

How long a card can grow a new text node without a fresh chunk before it is treated as finished and settles back to its normal (possibly clamped) size — the owner's own words: "collapsing back... once no chunk has arrived for ~3s or a same-id card line with a status lands". Constant: `STREAM_IDLE_MS = 3000`.

## Why lazy-load the composer

`ai/v/3/compose.js`'s own composer — talk to the assistant right here, and the reply types itself out above, in this same log (and in the V3 Now view, which mounts the identical box).

**LAZY, deliberately:** `says.js` loads on EVERY page through the dev bar, so a static top-level import of V3-only code here would make one bad path in `compose.js` blank the WHOLE SITE, not just V3 (measured, 2026-09-19: it did, for about 80 seconds). A dynamic `import()` behind a `try` means a fault in the composer loses only the composer, never the rest of the rail. The host box is captured NOW, synchronously, and filled once the import resolves — the "no DOM after an await" rule above, obeyed for real this time.

## Entry map: patches in place

One entry per card id, so an update PATCHES the same DOM node — never a rebuild, which is the mechanism the "nothing disappears" guarantee rests on. A card that needs the owner's yes gets a SECOND entry, in the pinned strip — same id, same underlying card, two rendered rows kept in step.

## The "show me the new version" gesture

The owner's own "show me the new version" — only THIS ever replaces what an open reader is showing; an update arriving in the background never does (via `on_show_latest` callback).

## Card body display: ~6 lines, owner text never clamped

A card's own text, straight in the stream — up to ~6 lines (CSS `line-clamp`), the owner's own words never clamped (`fill_body`'s caller decides the class). `title` (if any) is its own line above.

The owner's rule, stronger than the ~6-line one it replaced: "chat messages in the dev bar log must never be truncated; show full text... no clamp, no 'more', no title-only cards." One class, no modifier, full text, every author alike.

## The meta row alignment fix

**The META ROW (time · dot · author) is its OWN line, ABOVE the text** — not beside it. Beside it, the text's own left edge started wherever the time/dot happened to end, which differs per card (an owner card has no dot; a pinned row has no time) — measured, five cards, five different x positions for the first letter of the text. On its own line, the text always starts at the card's own left padding edge, every card, identical x.

## How compact() works

One row — the pinned strip's rows and the main stream's rows are built by the SAME function, so "needs you" never reads as a different kind of thing in one place than the other. `pinned` drops the time and the inline body (the strip is a glance, not a read); the owner's own cards never get a status dot or a title line — the text IS the message.

## Card update: patch or rebuild

A card CHANGED — a real `card` line, not a chunk. Almost always a patch in place; the one exception is a card that started as a bare, title-less placeholder from a chunk with nobody home yet (`chunk_in` below) and is only now getting its first real title — that one row is rebuilt once, which is a settling event, not something the owner was mid-read on.

## mark_stale for the open reader

The card the owner has open right now, changed underneath them — say so via `mark_stale`, but do NOT touch what is on screen; `on_show_latest` is the only path that does.

## Pinned strip: needs-you mirror

The pinned strip mirrors whichever cards currently need the owner's yes — added when a card BECOMES needs-you, removed the moment it stops being one (the mastermind marks it `done`), so the strip is only ever what is actually waiting on the owner right now.

## Chunk handling: bare rows for unknown ids

One chunk in: an id already on screen grows a text node before its caret; an id nobody has posted a `card` for yet gets a BARE row first (title-less — `update()` above upgrades it once the real card line lands) so a chunk for an unknown id never loses text.

## reader_shell: stable rebuilding

The reader's own shell, built ONCE — a stable back button and a stale-update banner that `fill()` never rebuilds, so `mark_stale()` can show the banner over whatever is already there without touching the reader's content at all.
