# Storage — the decision

**Three text files, committed to the repo, one JSON object per line.** They sit beside the
pages that read them, in `public/imagine/importance/data/`:

```
data/nodes.jsonl               {"id","kind","text","author","created"}
data/edges.jsonl               {"src","rel","dst"}
data/judgments/2026-09.jsonl   {"id","context","a","b","winner","judge","weight","created","goal","reason"}
```

That is the whole storage layer. There is no database, no server code and no build step:
the browser reads the files with `fetch` and appends a line with the dev server's
`rpc:append`. Git history *is* the audit trail.

## Why JSONL, and not TSV

The owner left the format open. JSONL wins here for one decisive reason and two ordinary ones.

**The decisive one: the dev server will only append to a `.jsonl`.** `Server/plugins/SocketServer/Append.js`
resolves a path and returns `null` unless it lands under `public/` **and ends in `.jsonl`**.
A TSV could be read from the browser but never written from it, and building a server verb
for it was out of scope. A format the page cannot write is not a format this page can use.

The ordinary ones: every writer and reader already in this repo speaks JSONL — the AI task
logs, the research programs, the CMS page deltas, `ext/JSONL` — so a bot, a human and the
dashboard all use the same parser. And a JSON object names its own fields, so adding `goal`
to a judgment row is a new key, not a new column that every older row has to grow.

## Why committed text, and not SQLite

This is the owner's reasoning, made concrete for this repo:

- A binary SQLite file in git is a **full copy per commit**. Ten judgments a day would
  rewrite the whole database every time; the history bloats and no diff is readable.
- A text line-delimited file diffs **cleanly** — a commit is literally the new rows — and
  git zlib-compresses it 5–10×.
- GitHub's hard cap is 100 MB per file (a warning at 50 MB). At ~140 bytes a judgment row,
  a month shard holds about 700,000 judgments before that matters, and the shard rule below
  means no single file ever grows past one month of them.
- Git LFS is 1 GB free storage and 1 GB of bandwidth a month, and there is no official FTP
  backend. Not worth the plumbing for a file this size.

## The shard rule

**Judgments shard by month; nodes and edges do not shard at all.**

A judgment row is the only one that arrives at the speed of a person clicking, so it is the
only one that can grow without bound. The file name *is* the month — `judgments/2026-09.jsonl` —
and `Store.shard()` derives today's name from the clock, so the first judgment in October
opens `2026-10.jsonl` with nobody deciding anything.

Reading them back asks for **every month from `2026-09` to this one**, in parallel, and a
month with no file simply answers with no lines. That is deliberately dumber than a manifest:
a manifest is a fourth file that a writer has to remember to update, and a walk that stopped
at the first miss would silently lose everything after a quiet month. When the fetch count
starts to matter — a few years out — the upgrade is a committed `data/shards.json` written by
the same CLI that appends, not a change to any of the three files.

Nodes and edges are small and mostly written by hand or by a bot proposing. One file each.
If a single topic ever outgrows that, they shard by topic the same way, and nothing else moves.

## Two things the schema resolves

**`winner` holds a node id.** The owner's table says `winner ∈ a | b` while the worked example
writes the node's own id (`car q1 q2 q1 alice`). The writer writes the **id**, because it is
readable on its own line; the reader accepts both (`Store.won()`), so neither form can be
misread.

**`goal` and `reason` are written from day one, even empty.** The owner named retrofitting
`goal` as the painful case. Every judgment row carries both keys, `""` when there is nothing
to say. Twenty-one bytes a row buys never having to migrate.

## Append-only, enforced by absence

`importance.js` has no method that edits or deletes a judgment. A bad row is answered by a
**later** row — `retracted: true`, which `Store.rows()` filters out — or by setting that
judge's `weight` to 0. That is why every rank can be recomputed under a new formula or new
weights, why "why is this #1?" can always show its rows, and why brigading is detectable at all.

The one exception the owner allows is a legal deletion request, which anonymises or removes
the `judge` field. That is a hand edit to a file, deliberately not a button.

## SQLite later, as a build artifact — not built

If reading ever needs an index, the shape is: a script reads the three text files and writes
`data/importance.db`, **gitignored**, rebuilt at deploy time. The committed text stays the
source of truth, the database is a cache that can always be thrown away, and nothing in
`importance.js` changes except where `load()` gets its rows. Git hooks or a deploy step are
the trigger. Not now — the whole car example loads in one round trip of three small files.
