# Research architecture — append-only files, validated in code, rendered live

Research lets several minions dig a question into append-only log files that a page renders as they grow. Two shapes share one module: a **topic** (a tree argued to a verdict: [`verbs.js`](/framework/ext/Research/verbs.js), [`Research.js`](/framework/ext/Research/Research.js), writer `research.mjs`) and a **program** (a flat stream per subject, never closed: [`entries.js`](/framework/ext/Research/entries.js), [`Program.js`](/framework/ext/Research/Program.js), writer `entry.mjs`). [`store.mjs`](/framework/ext/Research/store.mjs) reads, writes and outlines.

## One append-only file per topic
**Decided:** a topic is `research/<slug>/research.jsonl` (a program topic is `<topic>/log.jsonl`); lines are only ever appended.
**Why:** parallel minions cannot overwrite each other, and every disagreement stays as a line.
**Instead:** a `.md` (merge collisions, lost history) or a database (nothing to serve statically).
**Detail:** [doc/decisions.md](./decisions.md)

## The writer validates, the AI does not
**Decided:** every line passes `validate()` in `verbs.js` / `entries.js`, from the CLI or an MCP tool alike; a bad line is refused with a reason and nothing is written.
**Why:** a hand-written log produced `JSONL: unknown verb "status"` in the owner's console; a schema in code holds, one in a prompt does not.
**Instead:** trusting the prompt; costs a corrupt file per careless writer.
**Detail:** [doc/verbs.md](./verbs.md)

## Size limits are refused, not discouraged
**Decided:** `text` ≤ 240, `why` ≤ 1000, `summary` ≤ 7 lines (`LIMITS`); detail goes behind `--refs`.
**Why:** walls of text defeat the scan-first page.
**Instead:** soft warnings; every writer would ignore them.
**Detail:** [doc/verbs.md](./verbs.md)

## Minions read `outline`, not the file
**Decided:** a minion reads the compact tree from `outline` (`store.mjs`), fenced to a subtree by its brief.
**Why:** re-reading the whole file each round is the context pollution the design exists to avoid.
**Instead:** a full read per round, which grows with every line.
**Detail:** [doc/process.md](./process.md)

## Importance is a vote; verdicts are the orchestrator's
**Decided:** anyone rates 1–5 and the score is the mean; only the orchestrator writes `verdict` and `summary`. Nothing is deleted: a low score sinks, `parked` says when it would rise.
**Why:** one voice decides, but nothing is lost.
**Instead:** deleting weak nodes (history vanishes).
**Detail:** [doc/decisions.md](./decisions.md)
⚠ The schema marks `agent` orchestrator-only (`who`), but minions update their own chip; the code does not enforce it.

## Ids are random and kind-lettered
**Decided:** an id is the kind's first letter plus four random base-36 characters (`c7k2q`).
**Why:** parallel writers must not coordinate, and the letter makes an outline readable.
**Instead:** a shared counter (needs a lock).
**Detail:** [doc/verbs.md](./verbs.md)

## Streaming rides what exists
**Decided:** pages use `.live()` on the file, so `Tail` pushes appended lines over the dev socket.
**Why:** no new channel was needed.
**Instead:** a poll or a purpose-built socket.
**Detail:** [doc/render.md](./render.md)

## Two writers, one core
**Decided:** `research.mjs` (CLI) and `Server/plugins/Research.js` (MCP tools) both call `store.mjs`.
**Why:** MCP gives schema'd arguments with no shell quoting; the CLI works wherever MCP is absent.
**Instead:** MCP only (needs a server restart to appear). Program entries have no MCP tools yet; `entry.mjs` is the only writer.
**Detail:** [doc/writers.md](./writers.md)

## Data is not code
**Decided:** `ext/Research/` holds the module; topics live in `research/` or beside their program page. A topic needs no `page.js`; `research/page.js` routes the slug.
**Why:** the same split as `ai/AITask` and `ai/`.
**Instead:** topics inside the module (code churn mixed with data).
**Detail:** [doc/decisions.md](./decisions.md)

## A program is a second shape, not a second module
**Decided:** a continuous program reuses the file, replay and tail machinery; the rounds, votes, `parked` and ranking stay topic-only.
**Why:** those exist to pick what to dig next, and a program's answer is "keep digging".
**Instead:** forcing a tree and a fake orchestrator onto subjects nobody will close.
**Detail:** [doc/program.md](./program.md)

## Credence is required, with no default
**Decided:** every program entry carries one of four words (`established`, `contested`, `fringe`, `speculation`); the page shows it by hue, border texture and printed word, and never upgrades it.
**Why:** a default would be a guess that flatters, and a reader unable to tell fringe from fact makes the record worthless.
**Instead:** an optional field or a numeric score.
**Detail:** [doc/program.md](./program.md)

## The reader is tolerant where the writer is strict
**Decided:** the page SHOWS an off-schema line with its reason and prints entries + unreadable = line count.
**Why:** dropping bad lines hides the defect the page exists to surface. **Instead:** skipping them silently.
**Detail:** [doc/program.md](./program.md)

## One `directory.json` request, not per-topic probes
**Decided:** `Program.js` fetches `/directory.json` once for all topics and their curated `.md` pages.
**Why:** per-topic probes log a console 404 for each topic not started. **Instead:** four fetch probes.
**Detail:** [doc/Program-notes.md](./Program-notes.md)
