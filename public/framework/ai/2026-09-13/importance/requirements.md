# importance — questions, options and caveats, ranked by pairwise judgment

Run: `ai/2026-09-13/mastermind-page-cms/` (the mastermind). Group: `importance`. The owner's prompt is below, verbatim, and it is the specification. This page above it says where the thing lives in THIS repo and what you may touch.

## The three laws, and your length budget

1. **Less is more.** The car example working end to end — three committed files, two pages — before anything else. Fastest working version first, then improve.
2. **Clear beats brief.** A newcomer opening `/imagine/importance/` sees the car topic with its questions ranked, understands the rank in ten seconds, and finds the "which matters more?" screen without reading a paragraph. Full plain sentences where a sentence is needed.
3. **Prioritize.** The owner's order: storage decision → the three collections + load/append/recompute → context view → judgment mode → the car example proven. Propose after that; overlay/trace last, and it may be left with the reason written.

Budget: each page is one screen at 1280, mostly above the fold. The readme is the index shape (what · Use · Watch out · More). One `doc/` page holds the data model and the storage decision; one holds the scoring seam (win-rate now, Elo / Bradley–Terry later, same tables). Your landing report: one screen, links and pngs; numbers and findings as `log` lines in your task.jsonl.

## Where it lives, and the seams that already exist (read in this order)

- **The realm:** `public/imagine/importance/` — `page.js` (the context view, opening on the car topic), `judge/page.js` (judgment mode), `readme.md`, `doc/`. Register it by adding `"importance"` to the `children` array in `public/imagine/page.js` (line 57, the realm list) — that one edit is the only file outside your dir you may touch.
- **The data:** committed text files beside the pages — `public/imagine/importance/data/nodes.jsonl`, `edges.jsonl`, `judgments/2026-09.jsonl` (one shard per month, as the owner says). ⚠ NOT `public/data/` — that dir is gitignored (user state), and content that cannot be committed cannot be deployed (`public/imagine/cms/readme.md`, "Watch out"). You decide JSONL vs TSV; JSONL is what every writer and reader in this repo already speaks, so TSV needs a written reason.
- **Append from the browser:** `rpc:append` — `Server/plugins/SocketServer/Append.js`: one or many whole lines, `.jsonl` under `public/` only, opened with `"a"` so two writers interleave between lines never inside one. Client call: `Socket.singleton().async_rpc("append", "/imagine/importance/data/judgments/2026-09.jsonl", line)` — `public/imagine/stream/stream.js:183` and `public/imagine/cms/json/json.js:148` are the two callers to copy, including the "off localhost the socket is disabled, the buttons say so" rule. Reads are a `fetch` of the file (content-type gated — the SPA fallback answers a miss with `index.html` at 200; `Page.read_json` in `core/Page/Page.class.js` and `cms/json/json.js` `Source.read()` show the guard).
- **Load + live:** `public/framework/ext/JSONL/` — `JSONL.js` parses and replays a `.jsonl` into object state, `live.js` subscribes over the dev socket (`Tail.js` pushes new lines, no reload). Read its readme; use it if its verb model fits (one verb per line, e.g. `{"node": {...}}` / `{"edge": {...}}` / `{"judgment": {...}}`), otherwise a plain fetch-split-parse is fine — say which in the log.
- **A bot writer:** `public/framework/ext/Research/entry.mjs` is a validated Node CLI that appends one entry to a `.jsonl` with `--check`; copy its shape for `public/imagine/importance/importance.mjs propose … | judge …` so a bot (or a minion) can propose and judge from the command line. Same `.jsonl`, same rows a human's click writes.
- **House style:** the `code` skill (assign-based OOP, `class View { .el }`, factories from `/app.js`, every method a seam, parts as static subclasses; ~100 lines is a try not a rule). `/imagine/paging/` and `/imagine/cms/json/` are recent realms to copy the page shape from. The persistent-state rule for pages that write: `public/imagine/paging/doc/persistence.md` — an editor saves visibly (a mark naming the store), a demo never persists silently.
- **Do not build a server.** `Server/` changes need a restart the owner's live server will not get; `rpc:append` + `fetch` is the whole storage layer for now. If you need a verb the socket lacks, write the exact proposal as a `log` line and work around it.

## Deliverables — ticked against the owner's Ask at harvest

1. **The storage decision, written**: file layout and format, in `doc/storage.md`, one screen — what, why (the owner's reasoning below, made concrete for this repo), the shard rule, what SQLite-as-build-artifact would look like later (not built).
2. **The three collections + the layer** — `importance.js`: `load()` (nodes, edges, every judgment shard), `append(kind, row)`, `scores(context)` → per-node win-rate with a count (the uncertainty), designed so the formula swaps without the tables changing. Judgment rows carry `id context a b winner judge weight created` and the optional `goal` and `reason` from day one (the owner: retrofitting `goal` is painful). Append-only: the code has no edit or delete path for judgments; `retracted` is a later row, not a change.
3. **Context view** at `/imagine/importance/` — you are at a node; its ranked children with a confidence indicator (win-rate AND how many judgments, shown honestly — a new item says "unranked", never 0%); caveats attached to what they qualify; click a child to be at it.
4. **Judgment mode** at `/imagine/importance/judge/` — two items in the current context, "Which matters more?", tap or keyboard (← → or 1 2) to pick, optional one-line reason, next pair immediately. Pair choice prefers uncertainty: few judgments, close scores. One appended line per pick.
5. **The car example, end to end** — the three files committed with the owner's rows; `/imagine/importance/` shows q1 first at 3/3, q2 last, c1 attached to q1; a judgment made in judge/ appears in the context view on the next load (live if `ext/JSONL`'s `live()` fits). Proven headless with `ui-test` on a private server, the pick made by keyboard, the file read back and the new line shown in the log.
6. **Propose** — add a question / option / caveat under the node you are at, from the context view; the new node enters unranked and judge/ surfaces it first. Only after 1–5 work.
7. **Overlay / trace** — lower priority: click a rank to see the judgment rows behind it. If time is short, leave it with one sentence saying so.

## Fences

- Own: `public/imagine/importance/**`, `public/framework/ai/2026-09-13/importance/**`. One line in `public/imagine/page.js` (the realm name). Nothing else — no `core/`, `ext/`, `styles/`, `Server/`, no skills, no npm dependency.
- Class names: run `new-css-class`; prefix `imp-` (check `public/framework/styles/css-scopes.txt` first and pick another if taken).
- A sibling is rebuilding `public/imagine/paging/make/` and another is measuring spacing in `framework.css`; you touch neither.

## Rules every brief carries

- Open your task: `ai/2026-09-13/importance/task.jsonl` with the `new-task` skill (own `session_id`, group `importance`, the seven deliverables as `steps`). The day dir and `day.jsonl` exist — append one line. Findings as `log` lines. Land with `finish-task`; run `documentation` before it.
- **Never kill or restart the dev server on port 80. Never drive the owner's tabs. Never `git stash`. Never commit.**
- Headless: a PRIVATE server `PORT=809x node server.js` from the repo root (`netstat -ano | grep LISTENING | grep -E ":80(8|9)[0-9]\s"` shows taken ports — 8093 and 8095 are siblings'), killed by pid at landing. Plans and pngs in the session scratchpad under `importance-*`; keepers copied into your task dir.
- Every recipe above was checked against the files on 2026-09-13; if one is wrong, fix your course and add ONE evidence line to that skill's `improvements.md` (`skill-improvement`).
- Resolve, don't park; "left" needs a reason a reader accepts.

## Landing report (to the mastermind)

One screen: the two urls, a 1280 png of each, the car ranking as three numbers, the headless proof of one keyboard judgment landing in the shard, what is left and why.

---

# The owner's prompt, verbatim (2026-09-13)

# Build: an "importance" system for questions, options, and caveats

## Goal

We want a system where humans and bots can collaboratively identify **what matters most** within any topic: the most important questions to ask, the strongest candidate answers/options, and the caveats that qualify them. Importance is always relative to a context (a topic), so the same question can rank #1 in one topic and near the bottom in another. The system should feel like: you're "at" a node, you see what matters most beneath it, and you can contribute by proposing new items or judging existing ones.

Use our existing framework and UI conventions (vanilla JS, `class View { .el }`, no bundler, no React/TS). You have the repo — follow whatever patterns are already there.

## Data model: a typed graph

Three tables/collections. This is a data *pattern*, not a database choice.

**node**
| id | kind | text | author | created |
|---|---|---|---|---|
- `kind` ∈ `topic | question | option | caveat | evidence`
- `author` is a human or bot id

**edge** (directed, typed)
| src | rel | dst |
|---|---|---|
- `rel` ∈ `asks | answers | qualifies | supports | refutes | depends_on`
- e.g. `topic --asks--> question`, `question --answers--> option`, `caveat --qualifies--> anything`, `evidence --supports/refutes--> option`, `question --depends_on--> question`
- Edges are what let a caveat or question be reused across many topics.

**judgment** (append-only)
| id | context | a | b | winner | judge | weight | created |
|---|---|---|---|---|---|---|---|
- One judgment = one answer to "In `context`, which matters more: `a` or `b`?"
- `winner` must be `a` or `b`
- `judge` is a human or bot id; `weight` is the judge's reputation (default 1.0)
- Pairwise comparisons, not 1–10 ratings — people are inconsistent on absolute scales but reliable on "this over that," and it makes bot and human input directly comparable.

**Scores are derived, never stored as source of truth.** Start with simple win-rate per node per context. Design so it can be swapped for Elo / Bradley-Terry later without changing the tables.

### Worked example
```
node:  car  topic     "Buying a used car"                 alice
       q1   question  "Has it been in an accident?"       alice
       q2   question  "What color is it?"                 bob
       c1   caveat    "Carfax misses unreported accidents" bot_7

edge:  car asks q1
       car asks q2
       c1  qualifies q1

judgment:  car  q1 q2  q1  alice  1.0
           car  q1 q2  q1  bob    1.0
           car  q1 q2  q1  bot_7  1.0
```
Result: viewing `car` shows q1 ranked first (100% win-rate), q2 last, and c1 attached to q1.

## Append-only rule

Never edit or delete judgment rows. Bad data is handled by setting the judge's `weight` to 0 or adding a `retracted` flag. Rationale: scores can always be recomputed under a new formula or new weights, every rank is auditable ("why is this #1?" → show the rows), and manipulation/brigading is only detectable if the raw history is kept. Only exception is legal deletion requests (delete or anonymize the `judge` column).

## Storage: lean into GitHub persistence

Decision for now: **keep it simple, JSONL/TSV committed to the repo.** Reasoning:

- A binary SQLite file in git is a full copy per commit — history bloats fast. Don't commit it.
- GitHub limits: 100 MB hard cap per file (warning at 50 MB), repos strongly recommended under 1 GB. LFS free tier is only 1 GB storage / 1 GB bandwidth per month, and there's no official FTP backend — not worth the plumbing.
- Text line-delimited data diffs cleanly (each commit is just the new rows), git zlib-compresses it 5–10×, and git history *is* the append-only audit trail.
- Shard judgments by month (`judgments/2026-09.jsonl` or `.tsv`), so no single file approaches 100 MB. At ~40–90 bytes per row, a shard holds 1–2.5M judgments.
- Nodes and edges are small; one file each (or sharded by topic if they grow) is fine.

You decide the exact format (JSONL vs TSV vs something else) and file layout based on what fits the codebase. If it's useful to have SQLite as a **build artifact** — rebuilt from the text files, gitignored — that's fine, but the committed text files are the source of truth. Git hooks or deploy-time database builds are an option later; not now.

## UI (the parts we need)

1. **Context view** — you're "at" a node (usually a topic). Below it: the ranked children (questions, options, caveats) with a confidence indicator, not just position. Caveats render attached to the thing they qualify.
2. **Judgment mode** — the core contribution loop. Show two items in the current context, ask "which matters more?", optional one-line reason, tap to pick. Fast: a few seconds per judgment, swipe/keyboard friendly. Prioritize showing pairs with high uncertainty (new items, close scores) — that's where a judgment teaches the system the most.
3. **Propose** — add a question / option / caveat anywhere. New nodes enter with high uncertainty and get surfaced in judgment mode until it drops.
4. **Overlay / trace** (lower priority) — see where a caveat or question is reused across contexts; click a rank to see the judgments behind it.

## Humans + bots

- Bots are just judges/authors with their own `judge` id. Nothing structural distinguishes them.
- `weight` evolves from track record (agreement with eventual consensus). Noisy or brigading judges drift toward 0.
- Bots are good at *generating* candidates and *pre-sorting*; humans are better at breaking ties on value questions. Keep the API such that either can propose or judge.

## Known caveats to design around

- **Cold start**: bots can seed candidates, but ranks are meaningless until real judgments accumulate. Display uncertainty honestly rather than fake precision.
- **Context explosion**: keep contexts to shallow graph paths (depth ≤ 2–3) or scoring gets too sparse.
- **"Important to whom?"** — consider adding an optional `goal` field to judgments early; retrofitting it is painful.

## Ask

Propose a file layout and storage format that fits our repo, implement the three collections + a load/append/recompute layer, and build the context view and judgment mode first. Keep it small and working end-to-end with the car example before adding anything else.
