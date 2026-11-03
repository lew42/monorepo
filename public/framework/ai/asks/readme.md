# Asks

Every ask the owner made, who owns it, and whether it landed — the answer to "a lot of tasks
are getting kind of left in limbo" (the owner, 2026-09-30). The live page is
[`/framework/ai/asks/`](/framework/ai/asks/); this folder is its code.

## The three ask records, and the page that joins them

- **The routed ledger** (`ai/asks.jsonl`, this page): asks sent to a mastermind, with a status.
- **The refined asks** (each session's `asks.jsonl`, [asks-by-module](/framework/ai/doc/asks-by-module.md)): one per sentence of your prompts, with the module inbox it went to.
- **The task homes** (`<module>/tasks/`, [/tasks/](/tasks/)): the work.
- **[Undone asks](/framework/ai/asks/undone/)** joins all three by module and says which asks have no landing: [`undone/UndoneAsksPage.js`](undone/UndoneAsksPage.js) reads `undone.json`, written by `node Server/UndoneAsks.mjs --json` (TaskLoop runs it daily). Each undone ask is checked against the repo (`node Server/UndoneVerify.mjs`; chips on each module: verified undone / found built / not work / needs you / unclear; the second pass over the unclear ones is `--only unclear --question <kind>`, see the doc). `UndoneAsks.settle()` then says what became of each ask: done, tasked (it has a task), closed (found built or not work, with the reason), noted (a line in its module readme), or still undone or unroutable. The sort pass (`--question sort`, then `Server/UndoneToTasks.mjs --proposed` and `--notes`) gives every open ask one of these. The verdict and the numbers: [doc/undone-asks-2026-10-17.md](../doc/undone-asks-2026-10-17.md).

## What

- [`AskFold.js`](AskFold.js) — the ledger's own reading, `AskFold.id(ask)` and `AskFold.fold(lines)`. Pure
  (no DOM, no Servex): it runs straight in the browser (this page, `ai2/needs.js`'s Needs you
  tab) and in node (`Servex/asks/Asks.js`). **The one vocabulary — never hand-roll a fold.**
- [`page.js`](page.js) — the ledger's page: a count strip (Stalled · Building · Routed ·
  Landed · Dropped, click one to filter — the url is `?status=<word>`), then each group as its
  own column, newest first, stalled first. A row: its title, owner, age, a link to its card
  and to its own words, and its history folded under a "N updates" disclosure.
- The ledger file itself, `public/framework/ai/asks.jsonl`, and the code that writes and
  watches it, are in `Servex/asks/` (not a web page — it's the dev-only backend) — its own
  readme has the write side (`Asks.mark()`, the CLI, the stall rule). This folder only reads.
- Not to be confused with `public/framework/ai/council/asks.jsonl`, the council's older
  verdict log: same file name, unrelated.

## Use

Land your own task and want its ask marked? That's the Servex CLI, not this folder:

```
node Servex/asks/mark.mjs "asks ledger" landed "shipped, merged" --by your-agent-id
```

Reading the ledger from a page or from node always goes through `AskFold.fold` — see `AskFold.js`'s
own comment for the exact shape (`at`, `title`, `words`, `owner`, `card`, `status`, plus the
folded `status_at` and full `history`).

## Triage (the proposed tasks)

About 240 proposed tasks wait on the owner. `node Server/ProposalTriage.mjs` sorts them under the three big things in `ai/priority.md`:
`--count` and `--plan <dir>` are dry runs, and `--apply <dir>` is the real pass. `Server/UndoneVerify.mjs --batches <dir> --question priority`
makes the Haiku batches that answer "plainly serves 1, 2, 3, or none" (results land in `<dir>/NN-priority/results.json`). `--apply` writes through
the item tool's `run_item`: a plain fit gets `approve` plus `priority {score: 4-N, big: N}`, everything else gets `waiting_on: "backlog"`,
which leaves the inbox but stays a proposal. Each change is one line in `triage.jsonl` (this folder, append-only). `ProposalTriage.js`
(browser) reads that manifest, replays each task for live state, and draws the card at the top of the Undone asks page, with **Approve all**
(one `approve` line per backlog task, appended by `FsFile.append`; only the owner presses it).

## Watch out

- **This page only reads.** Nothing here ever appends to `asks.jsonl` — that's `Servex/asks/`,
  append-only, so every status change is a new line, not a rewrite.
- **A stalled ask also shows up in AI 2's Needs you tab** (`ai2/needs.js`), ranked by
  `importance()` (`ai2/needs-rule.js`) alongside every open Decision and Question — one rule,
  shared, so the two lists can never disagree about what matters more.
- **A `words` path starting `.claude/`** (the owner's own dictated brief, not a served file)
  shows as plain text instead of a dead link — `words_url()` in both this page and
  `ai2/needs.js` make the same call.

## More

- `Servex/asks/readme.md` — the write side: `Asks.js`, the stall rule (`stalled.js`), the CLI,
  the test.
- [AI 2](/framework/ai2/) — its Needs you tab folds this same ledger in.
