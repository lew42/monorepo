# dashboard-agents-fix

## Ask (verbatim)

> Urgent micro-fix in the lew42 monorepo. The AI dashboard is down: in
> public/framework/ai/2026-08-15/layout-overnight/task.jsonl, the landing
> assign line contains the field `"agents": 10, ` — but the JSONL assembler
> builds `agents` as an ARRAY from agent-verb lines, and this scalar clobbers
> it; AITask card.js then throws `m.agents?.filter is not a function`,
> breaking /framework/ai/, and the mastermind-run / mastermind-skill /
> layout-overnight pages.
>
> Own exactly two edits:
> 1. In that task.jsonl, change the substring `"agents": 10, ` to
>    `"minions": 10, ` — byte-precise, that one occurrence, nothing else on
>    any line. The file is otherwise append-only history; do not reorder,
>    reformat, or rewrite anything beyond those bytes.
> 2. In public/framework/ext/JSONL/readme.md: add ONE trap line in its
>    existing traps/decisions style — an `assign` must never write a scalar
>    to a key the assembler builds as an array (`agents`); the raw
>    Object.assign clobbers it and the card render throws. Read the readme
>    first, match its voice, one line.
>
> Verify in fresh headless Playwright (chromium.launch(); dev server on :80),
> zero console errors required on ALL of: /framework/ai/ ,
> /framework/ai/2026-08-15/ , /framework/ai/2026-08-15/layout-overnight/
> (curated page, and its card should again show its agent/minion lines),
> /framework/ai/2026-08-15/mastermind-run/ , /framework/ai/2026-08-15/mastermind-skill/ .
> Any failure → restore the exact original bytes, re-verify, report.

## Scope fence

Exactly two files touched: the one substring in
`ai/2026-08-15/layout-overnight/task.jsonl` and one added trap line in
`ext/JSONL/readme.md`. No other bytes.

## Steps

1. Confirm the single occurrence and the exact byte-precise diff needed
2. Edit task.jsonl (`agents` → `minions`)
3. Add the trap line to ext/JSONL/readme.md
4. Fresh headless Playwright verification across all 5 pages
5. Report / land
