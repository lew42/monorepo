# v3-data — the dashboard versions are views; the data lives in one place, outside them

You are a minion. **Load the `minion` skill first, before touching anything.** Model: Sonnet.

## The three laws, short

1. **Less is more.** Fastest working version first, then improve. A demo beats a description.
2. **Clear beats brief — by far.** Plain full sentences, basics first, for an overwhelmed newcomer.
3. **Prioritize.** The most important thing first.

## The owner's words, this evening, verbatim

> look at the ai/v/3/ system. make sure ai/v/3/ is reading from the same data structures as the
> other. the data should not be saved in the ai/v/3/ dir, for example. i mean, you could have v3
> specific data, i suppose, like ui state or something. however, the actual ai tasks and whatnot,
> is template (v3) agnostic, and should be stored like the rest.

And from the handover, the same complaint in their words earlier today:

> we don't want duplicate places and duplicate systems.

## What is actually wrong, so you do not have to rediscover it

`public/framework/ai/v/3/page.js:74` reads `import.meta.resolve("./board.jsonl")`. That file,
`public/framework/ai/v/3/board.jsonl`, is 279 lines of real content — every card the assistant and
the mastermind have posted to the owner today. It is **data sitting inside a template directory**.

Meanwhile the original dashboard reads a different store entirely: the per-task
`public/framework/ai/<date>/<slug>/task.jsonl` files. So today there are two dashboards reading two
different things, and a card posted to one is invisible to the other.

`v/2/` is a third version; check what it reads too, and include it in your answer.

## What you are building

**One store for the board, outside every version directory, with the versions as views of it.**

The decision of exactly where it goes is yours — make it and log it as a `decision` line with the
alternative you rejected. A sensible default, if nothing argues against it, is
`public/framework/ai/board.jsonl`, beside `handover.md` and `usage.jsonl`, which are already
version-agnostic data at that level. The date-partitioned alternative
(`public/framework/ai/<date>/board.jsonl`) is worth weighing: it matches how tasks are stored and
keeps a day's file small, but it means a reader has to stitch days together. Pick one, say why, and
name the other.

**V3-specific state stays with V3.** The owner explicitly allowed this: which card is selected, a
column width, a collapsed rail — anything that is about *this view* and not about the work. Keep
that where it belongs (it is per-viewer, so browser storage is usually right, not a repo file) and
say in your page which is which. This distinction is the actual point of the task, so make it
visible.

## The hard part: this is live while you work

The board is the screen the owner is reading right now, and three things write to it:

- `node .claude/skills/every-prompt/say.mjs <file.json>` — `say.mjs:23` hardcodes
  `AI + "v/3/board.jsonl"`. The assistant and the mastermind both post through it.
- `public/framework/ai/v/3/page.js:74` and `timeline.js` read it.
- `dev/DevBar/says.js` shows the same lines as a chat log.

So the move is not just a file move. **Every writer and every reader has to change in the same
batch, and the board must still work when you are done.** Concretely:

1. **Hold the live reloads first:** `node Server/hold.mjs on "v3-data — moving the board store"`.
2. Move the file with `git mv` so the history follows it.
3. Update `say.mjs`, `v/3/page.js`, `v/3/timeline.js`, `dev/DevBar/says.js`, and anything else
   `rg -n "board\.jsonl" public Server .claude` turns up. Grep before and after; the count must
   reach zero for the old path.
4. **Prove it works before you release the hold**: post a real card with
   `say.mjs`, then load `/framework/ai/v/3/` headless and confirm the card is on screen. A file
   that parses can still break a page.
5. `node Server/hold.mjs off "v3-data"`.

**Leave a redirect or do not — your call, but decide deliberately.** If anything outside this repo
or any open tab has the old URL, a one-line shim beats a 404.

## Reading the same structures, not just the same file

The owner said "reading from the same data structures as the other", which is more than a shared
path. Look at how the original dashboard models a task (`ext/AITask/`, `ext/JSONL/`) and how V3
models a card (`v/3/timeline.js`). If V3 can read the shared model instead of its own parallel one,
do it. If it genuinely cannot in the time you have, **say so in one plain sentence with the
reason** and make that the top item of your page — a named, honest gap is a good outcome; a quiet
one is not.

## What you must not do

- **Never kill or restart the dev server.** The owner is on the live site right now. Servers are up
  on port 80 (theirs) and 8123 (the mastermind's) — leave both alone.
- **Never drive the owner's open tabs.** Headless only.
- **Never `git stash`, never commit, never push.** The tree is shared with agents in flight.
- **Do not lose a line of the board.** It is the owner's own words. Count the lines before and
  after and say both numbers in your log; they must be equal.
- Do not search from the filesystem root; scope every search to the repo.

## Deliverables

1. **The move, working**, as above, proven with a headless shot of `/framework/ai/v/3/` showing a
   card you posted after the move.
2. **`page.js` in your task dir — one screen.** Top line in plain words: where the board data lives
   now and why. Then a short list: what moved, what stayed with V3 and why it is genuinely
   view-only, what still differs between the two dashboards. The shot goes on the page. Detail one
   click down. Run the `new-page` skill for the shape and add your page to the day page's
   `children:` — nothing crawls.
3. **`task.jsonl`**, opened with `new-task` BEFORE your first write, `"group": "ai-ops"`,
   `"session_id": "b2c2d2e2-0006-4a19-9b02-000000000006"`. Findings as `log` lines. One `decision`
   line for where the store lives, naming the alternative. Land with `finish-task`.

## Fences

You own: `public/framework/ai/v/**`, `public/framework/ai/board.jsonl` (or wherever you decide it
goes), `.claude/skills/every-prompt/say.mjs`, `public/framework/dev/DevBar/says.js`, and
`public/framework/ai/2026-09-19/v3-data/**`. You may add one line to
`public/framework/ai/2026-09-19/page.js` `children:` and append to that day's `day.jsonl`.

Five sibling minions are verifying today's requests at the same time; they are read-only and own
only their own dirs, so you will not collide with them. **Nobody else may touch the files above
while you hold them** — if you find another agent's edit landing in one, stop and say so.

If a skill misleads you or is silent about a trap that then bites you, append ONE evidence line to
`.claude/skills/<skill>/improvements.md`.

## Length budget

The page is one screen. Your landing `outcome` is a headline plus at most five sentences with
links. Numbers and the grep counts go in the log.
