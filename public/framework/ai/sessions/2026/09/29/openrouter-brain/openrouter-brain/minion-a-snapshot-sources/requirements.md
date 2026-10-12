# Minion A — snapshot.md + sources/readme.md + the missing source

Task dir (read the whole conversation there, not just this file):
`public/framework/ai/2026-09-29/openrouter-brain/`

Load the `minion` skill first.

## Why

We're building `Servex/ext/openrouter/`, a folder a fresh "openrouter" mastermind reads to
become the expert on our OpenRouter/harness system — every source, decision and conclusion,
with citations and a confidence. You own two of its files plus one missing source.

## 1. `Servex/ext/openrouter/snapshot.md`

The condensed state a fresh mastermind starts from. Build it from:
- `public/framework/research/harness/research.jsonl` (203 lines — the full research log: questions,
  claims, support/dissent, votes, verdicts, closing summary at the last two `assign` lines)
- `public/framework/ai/2026-09-28/harness-research/plan.md` (the build order, already reviewed)
- `public/framework/ai/2026-09-28/harness-research/architect-review.md` (corrections folded into the plan)

**Shape:** one line per conclusion. Every conclusion carries:
- the claim, in plain words
- a credence word (**established** / **contested** / **unknown** — copy these straight off the
  research log's own `why` field, don't invent new ones)
- a cited source id — the research node id (e.g. `cjuqp`, `ca7gw`) AND, where that node's `refs`
  include a URL that is now in `public/framework/sources/`, the source slug too

Organize it under the plan's build order (steps 1–6), since that is the order these get acted
on. End with a short "Still open" list of the `unknown`-credence questions that never got
answered (e.g. q1yg2/opencode-compaction-depth, the mixed-family-review A/B).

**Don't re-derive the research — the plan.md and the verdict lines (near the end of
research.jsonl, `{"verdict":...}` and the closing `{"assign":{"status":"closed","summary":[...]}}`)
already did the accepting/rejecting. Your job is compression into one screen, not new analysis.**

Length: this is the "condensed state" file — aim for under 150 lines. Deep detail stays in
research.jsonl; snapshot.md points at node ids, it doesn't restate every `why`.

## 2. `public/framework/sources/openrouter/`: the missing source

The research (`cjuqp`, `ckwc5`) cites
`https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration` — "the basis for
'the Agent SDK runs on OpenRouter'" — but it has no markdown copy in `public/framework/sources/`
yet (check `public/framework/sources/openrouter/index.jsonl` — it isn't there).

Save it through the source library's own writer (read `public/framework/sources/readme.md`
first):

```
node Server/sources.mjs "OpenRouter's Claude Code integration guide: running the Claude Agent SDK against OpenRouter with ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN" --topic openrouter --n 1
```

That runs one real (small, paid) searcher. Confirm afterward that the URL landed in
`sources/openrouter/index.jsonl`. If the searcher comes back with the wrong page or nothing
useful, say so in the task log rather than re-running it more than once — this spends real money
(the source-library readme's own warning).

Scan `research.jsonl`'s `refs` fields for any OTHER URL cited by an `accepted` verdict that also
has no source-library copy. If you find one or two more, use your judgment: fetch the cheap,
clearly-useful ones the same way; if there are many, just list what's missing in your log instead
of fetching all of them (budget matters more than completeness here).

## 3. `public/framework/sources/readme.md` — wait, don't touch that one

That's the *existing* library readme (already read above) — leave it alone. What you build is a
**new** file: `Servex/ext/openrouter/sources/readme.md` — an index into the existing library for
our three topics (openrouter, opencode, claude-agent-sdk). Don't copy any source file; the
library at `public/framework/sources/` stays the single store. One row per source actually cited
by an accepted conclusion in the research (not every source in the library — just the ones this
research leans on), with: id (slug), title, domain (from the url), author (from the source .md's
frontmatter if present, else omit), date (`fetched_at`), url, and which conclusion ids (from
snapshot.md / research.jsonl) cite it.

## Log as you go

Append to the task's `task.jsonl` (see `new-task`/`minion` skill) as you finish each of the three
pieces, and note anything you skipped or found ambiguous. Don't run `finish-task` — the
mastermind lands this task as a whole.

## Fence

Only: `Servex/ext/openrouter/snapshot.md`, `Servex/ext/openrouter/sources/readme.md`,
new files under `public/framework/sources/openrouter/` (via `sources.mjs` only — never hand-write
a source .md). Main tree, no worktree (doc-only). Model: Sonnet, medium effort.

