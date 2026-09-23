# inbox-model — AI 2, first build: your words become cards, live, in an inbox with one flag

Minion: Opus, effort high. Session id `fe4807e9-7c68-4307-b27c-c79c2f09362a`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first. Load `layout`, `css`,
`code`, `new-page`. Private port **8098**. You own **`/framework/ai2/`** — a blank full-screen
page the mastermind made at 17:46 (`public/framework/ai2/page.js`, `classes: "full fill"`).
**Nobody touches `/framework/ai/` (V3) in this task** — that board is being replaced, not fixed.

## The owner's words (2026-09-22 17:43–17:47, verbatim, the parts that decide this)

> we kind of want like a read or unread inbox type thing. … putting in an approve button on
> everything seems just a little bit — I'm not going to actually click through approve on
> everything. I kind of want a way to red flag certain parts or whatever … there's a lot of UI
> for something that I'm not actually looking to do. … generally I want you to just work forward
> … We do need feedback buttons. … Can you make me little notes in this log here where you just
> explain things? … I need a way where when I'm doing these interactive sessions and
> transcribing all these ideas to you, you can get things on my screen and we can refine them
> and curate the long-winded prompts into organized, logical, familiar cards … so I can see all
> the things I'm saying being turned into structured ideas on screen in real time.
>
> make me a framework/ai2 page, blank page, full screen … we're going to rebuild this thing —
> the one we have is way too cluttered and not doing what we need.

## What exists — reuse the data, not the old UI

- `ai/board.jsonl` — the cards (`card` lines merged by `id`; `author`, `icon`, `title`, `text`,
  `status`, `links`); the mastermind's explanations are cards whose title starts with "Note:".
  `ai/verdicts.jsonl` — `improve`/`approve`/`reopen` lines (`Server/plugins/CardAnswer.js`).
  `ai/<date>/day.jsonl` — `landed - …` lines per task. `ai/prompts.jsonl` and, live, Servex's
  `prompts` log (`GET http://127.0.0.1:8090/log/prompts?n=200`, CORS on) — the owner's
  sentences (`prompt`), and the fast assistant's `name` / `card` / `refined` / `proposal` lines
  citing them (`ai/2026-09-22/prompt-lifecycle/`, `log-model/events.md`).
- Live: `GET http://127.0.0.1:8090/api/stream` (SSE, every Servex event; `v/3/agents.js` and
  `v/3/prompts.js` are working clients — copy the fetch/stream code, not the UI); the dev
  server's socket streams `.jsonl` appends (`dev/Socket`).
- The composer: `v/3/compose.js` (type or speak → `POST /log/prompts`; `talk-to-assistant`).
  Import it or copy it; it is 70 lines.
- The design system: `framework.css` utilities (`surface pad flex v gap`), the card word
  `ai/2026-09-19/card-word/`, `lighten`/`darken`. The old board's CSS is not reused.

## Deliverables — one screen, the fewest parts that do the job

1. **The page is the inbox.** `/framework/ai2/`: the composer at the very top (type or speak;
   one line under it: "the fast assistant inside Servex · names in ~2 s"), then the cards,
   newest first, one column that becomes two at 1280 (`layout` skill first). No chrome row, no
   view switch, no head links, no agent strip. The site header and rail are the only frame.
2. **A card is familiar.** Icon, title, two or three sentences, the time, the author as one
   quiet word; links as small chips; a lightened background, white when open. **Unread** cards
   (never opened by the owner) carry a dot and sort first; opening one marks it read (an event
   `{say: "read"}` through `CardAnswer.js` — add `read` to its allowlist, one line, hold + boot
   test on 8098). The count of unread is the page's only number, in the tab title too.
3. **Your words become cards, live.** A `prompt` event from the assistant's log appears at
   once as an *owner* card: the verbatim sentences, then — as the assistant's `name`, `card`,
   `refined` lines arrive over the stream, seconds later — the card **evolves in place** (same
   id): its title becomes the assistant's card title, the refined reading sits above the
   verbatim (which folds), the names show as chips. No second card, no flicker. A `proposal`
   line adds a "first sketch" block inside the same card. A `Note:` card from the mastermind
   renders as a note (left rule, full text, no icon box).
4. **One flag.** Every card has one small flag icon and nothing else. Press → a one-line input
   → the sentence goes as an `improve` verdict (the existing route; it reaches the mastermind's
   inbox and rings it — `card-replies`). The flagged sentence shows faintly under the card;
   press again withdraws (`reopen`). Selecting a span of text inside a card shows the same
   flag; the verdict carries the quoted span. No Approve, no footer sentence, no undo copy.
5. **Landed work is a card too.** Each `landed - …` line from today's `day.jsonl` (and each
   `card` with `status: done`) is a card with a link to its task page — the Days view's
   content, in the same inbox, so "what happened" and "what I said" are one stream.
6. **Proof, headless on 8098:** load → N unread with dots; POST one real sentence to
   `/log/prompts` → an owner card appears within 1 s and evolves into a named card within
   5 s with no duplicate id in the DOM; open it → read line lands, count drops; flag with a
   sentence → `improve` line lands and `say.mjs state` shows it in the inbox; select a span →
   flag carries the quote; Servex down → the page loads from `board.jsonl` + `prompts.jsonl`
   with zero errors and says the assistant is off. Screenshots at 400 and 1280 into `shots/`.
   Two numbers that must agree: cards in the DOM and (board ids ∪ prompt ids ∪ landed lines).

## Fence

`public/framework/ai2/**`, `Server/plugins/CardAnswer.js` (the `read` allowlist line only;
hold + boot test), your task dir, `ai/2026-09-22/page.js` `children:`. Append-only to `.jsonl`.
Not `public/framework/ai/**` beyond reading it, not `Servex/`. Reload hold for every batch.

## Length

Aim under 400 lines for the whole of `ai2/` (page.js + one css + one or two modules). Landing
report: six sentences, the two numbers, two screenshots.

## Relaunch in a worktree (17:58) — read this before anything

The first run of this task (session `fe4807e9`) built in the MAIN tree and was stopped at 17:56
because the owner's rule is now: minions work in worktrees. Its half-built files
(`ai2/page.js`, `ai2.css`, `compose.js`, `inbox.js`, and the `read` line in
`Server/plugins/CardAnswer.js`) were carried into YOUR worktree by the launcher — continue from
them, do not start over; read the first run's `task.jsonl` in the main tree for its decisions.
The mastermind then reset the main tree's `ai2/` to the one-line "Hello world" page so the
owner does not watch a broken page while you build. **Landing therefore copies, not patches:**
when done, `rm -r C:/Code/lew42/monorepo/public/framework/ai2 && cp -r <worktree>/public/framework/ai2
C:/Code/lew42/monorepo/public/framework/` (hold on, copy, hold off — seconds), plus the one
`CardAnswer.js` line by `git apply` of its own diff; then prove on the main tree's port 8123.
The hold rule now: seconds around the write only; never while you think or test.
