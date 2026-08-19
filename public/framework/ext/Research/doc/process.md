# The process — how a topic gets researched

A topic is a question the owner wants answered conclusively, by several minds, visibly. The record is one append-only file; the process is rounds; the orchestrator is the only one who ranks, resolves and summarises. Everything below was decided on the first run (`/framework/research/livereload/`, 2026-08-18) and is revisable.

## The loop

1. **Open** — `research.mjs open <slug> --title --question --minions N --minutes M`. Config is a promise the orchestrator keeps, not a limit the tool enforces.
2. **Round 1 — scouts** (Sonnet, parallel, fenced by sub-area). Each reads `outline`, then adds ≤ 8 nodes: claims with `file:line`, honest `--importance`, questions for what nobody knows. Fences stop three scouts writing the same claim; `outline` catches the rest — support/evidence goes under the existing node, never a duplicate root.
3. **Round 2 — skeptic + builder** (Opus judges, Sonnet builds). The skeptic verifies every root against the code and writes `support`/`dissent` with `--why`, and `vote`s importance — a true thing that never happens is a 1. The builder proposes `alternative`s for the top problems, with cost.
4. **Verdicts + summary** — the orchestrator reads `outline`, writes `verdict` per root (`accepted rejected parked merged` — a `parked` `--why` says when it would matter), then `assign --summary` (≤ 7 lines: the conclusions, the report's top). Digging deeper is another round on one node: `outline --under <id>` is the whole brief.
5. **Land** — status `closed`; the page is the report.

## Why rounds, not a live chat

Parallel minions cannot see each other's context; the file is the shared memory and `outline` is the compact view of it — a few hundred tokens instead of the whole record. A minion reads the outline at the start of a round and again before each node. That is the context-pollution control: nobody reads everything, everybody reads the shape.

## Why personas

One voice converges early. A scout, a skeptic and a builder disagree on purpose, and disagreement is where the reasoning gets written down (`--why` is required for `support`/`dissent` — the tool refuses a bare vote). The orchestrator is the only persona that resolves.

## Anti-nitpick

Importance is first-class and voted. Nothing is deleted; a low score sinks a node below the fold, and a `parked` verdict says in what world it would rise. Digs are spawned only on high scores.

## What is programmatic, what is AI

The tool validates every line (kinds, lengths, parents, requireds) and refuses the rest — an AI cannot write an unknown verb. `outline`/`summary` are code. Round order, fences and briefs are the orchestrator's; the next step is a script that runs the rounds (the Workflow tool is the natural host).
