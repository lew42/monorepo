# What goes where

## The rules, as a table

| a thing | where it lives | who writes it | where the owner sees it | what never goes there |
| --- | --- | --- | --- | --- |
| The owner's words, verbatim | `ai/prompts.jsonl` (spoken) or a `chat` line in the run ledger (typed/relayed) | Servex's single writer, or the mastermind | the Prompts tab; their own screen, for typed words | a summary — never a paraphrase, always exact |
| A note or explanation from the mastermind | `board.jsonl`, a `card` with `author: mastermind` | the mastermind, by rule, never a person for it | the board (Now/Days today; a Notes view planned) | the chat — the owner said stop answering there |
| A task's landing | that task's own `task.jsonl` — `landed_at`, `outcome`, `tokens` | the minion, via `finish-task` | the Days view; the task's own `page.js` | prose with no page behind it — a landing needs a page.js to be found |
| A proof or a test | the task's own worktree server, and a scratch copy of any log it needs | the minion, headless, before landing | nowhere live — only its numbers and screenshot, pasted into the task log | the live board or the live Servex on 8090/8123 — broken once tonight, five stray cards |
| A design doc | `ai/<date>/<task>/doc/*.md` | the minion (often paper-only, no code) | the task's own page, one click down (`md.details`) | anywhere under `public/` outside its own task dir |
| A decision | a `decision` line in a `task.jsonl`, with options and why | the mastermind, or a minion at a named fork | the ledger; folded into a card if it changes something visible | nowhere — every fork in the road gets a line, by the minion skill's own rule |
| A session's transcript | the CLI session itself (resumable by id), or `agent-<id>.jsonl` if Servex-hosted | the runtime | a task's session id, or an agent chip on the board — click through, never paste | a report page — link to it, never copy it in |
| A flag or a verdict | a card's flag field, or a `verdict`/`dispute` event in the log | the owner (a flag) or the log assistant (a verdict) | the flagged card itself | silence — nothing is auto-approved |
| A recording | `public/framework/ai/recordings/` (gitignored), with an `expected.json` sidecar | `Server/plugins/Recordings.js` | the Record workspace | git — audio is deliberately untracked |
| A card that grew into a page | (decided tonight, not yet built) `ai/cards/<slug>/`, promoted from `ai/cards/<slug>.jsonl` | whoever gives the card a page — a minion or the owner | the card's own detail page, same address it always had | back into one `board.jsonl` line — growth only runs one way |

## Five suggestions, ranked by how much they would help

1. **One board, not five surfaces.** Right now V3 (`/framework/ai/`) and AI 2 (`/framework/ai2/`)
   are both alive, and the `ai2-rebuild` decision that says "AI 2 replaces V3" was never told to the
   owner in those words. The alternative — keep both running side by side for a few more days as
   an A/B — costs nothing in code but costs the owner a "which one do I look at" every single time
   they open the site, which is exactly the confusion this whole report exists to remove. **I would
   do this first**: freeze V3 today (a banner pointing at AI 2, nothing more), and every future
   board request goes to AI 2 only.
2. **Generate this report automatically, every evening.** Tonight's version cost a Sonnet task and
   a couple of hours of runtime. The alternative is what happens by default — nothing, until the
   owner asks again. A small script that folds each day's `task.jsonl` files into the same four
   sections (landed, cost, laws, state) the moment the day's last task lands would turn "an
   overview of everything we've done today" from a request into a standing fact the owner can check
   any evening without spawning anything.
3. **A token meter on the board, always visible.** The owner asked about token pace three separate
   times today (18:36, 19:11, and again in the closing message) and each time the mastermind had to
   go compute it fresh from `check-claude-usage`. The alternative — leave it as something the owner
   has to ask for — is what happens today. A small, always-on number (session % / weekly %) on the
   board's chrome line would answer the question the owner keeps re-asking before they ask it.
4. **Fewer, larger tasks.** Today ran 34 landed tasks for $552, and four of them needed a second
   turn because a follow-up request arrived mid-run and had to be folded in by resume. The
   alternative is today's pattern — dispatch as soon as a request is clear enough — which keeps
   turnaround fast but multiplies overhead (each task pays its own read-the-brief cost) and multiplies
   the number of things the owner has to track landing. Batching related asks (all of tonight's AI 2
   requests, for instance) into fewer task briefs would cut both the dollar total and the count the
   owner has to follow.
5. **Host the mastermind itself inside Servex.** Today it is a sidebar Claude Code session whose
   own log is a hand-appended `task.jsonl` — real, but not an event stream anything else can watch
   live, and nothing stops a second one starting by accident (it has happened before). The
   alternative is what exists now, which works but is invisible to any tooling built on top of
   Servex's event model. This is the most architecturally important of the five, but it is last
   because the owner does not feel it day to day the way they feel two boards or a hidden token
   count — it pays off once other agents need to watch the mastermind's own state, not before.

**First:** freezing V3 in favor of AI 2. It is the cheapest of the five (one banner, one decision
made explicit) and it directly answers the exact confusion — which screen is the real one — that
produced several of tonight's corrections.
