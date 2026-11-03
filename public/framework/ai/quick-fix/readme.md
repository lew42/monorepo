# Quick fix

The log of every small fix asked for by voice — "make this bold", "this gap is too big" — and
how many seconds each one took to land. The live page is
[`/framework/ai/quick-fix/`](/framework/ai/quick-fix/); this folder is its code and its data.

## What

- [`page.js`](page.js) — reads `page.jsonl`, folds each request's `asked` line together with its
  `landed` line (same `asked_at`), and shows the list newest first: the page, the words, the
  element picked (if any), and once it lands, the seconds, the commit, and a screenshot when the
  fixer took one.
- `page.jsonl` — one line when a fix is **asked**, written by the `quick_fix` Servex tool the
  instant the owner says something; one more line when it **lands**, written by `quick_fix_landed`
  once the fixer's own `merge.mjs` run actually succeeds. Both are node, never the fixer's own
  guess (CLAUDE.md law 7, "compute, don't recall") — `ms` is a real clock difference.
- `shots/` — the one screenshot a fixer takes per fix, when it has time to (not guaranteed).

## The system behind this page

This page only reads. The agent and the tools that write here live in `Servex/agents/`:

- [`Servex/agents/Fixer.js`](/framework/servex/) — the standing agent, `fixer-1`, kept warm for
  as long as Servex runs, holding one quick-fix worktree for its whole life.
- `Servex/agents/fixer.md` — its brief: read a request, edit the fewest lines, merge its own
  worktree, or hand anything too big to a task-mastermind instead of stalling.
- The `quick_fix` / `quick_fix_landed` tools (`Servex/agents/tools.js` + `Servex/agents/Sessions.js`)
  — the door in, and the only way a line lands in `page.jsonl`.

Full story, the hot path end to end, and the numbers: [`Servex/doc/fixer.md`](/framework/servex/).

## Watch out

- **This page only reads `page.jsonl`.** Nothing here ever appends to it — that's Servex's job,
  through the two tools above, so two fixes landing at once can never tear a line.
- **A request with no `landed` line yet is still shown**, marked "the fixer is on it…" — not
  hidden, so a stuck fix is visible instead of silently missing.
