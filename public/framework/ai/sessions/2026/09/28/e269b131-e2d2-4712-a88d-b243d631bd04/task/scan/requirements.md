# Step 1 — scan for every audit and open ask (Haiku)

Load the `minion` skill first. The owner's words: `../owner-words.md`. The whole brief: `../requirements.md`.

## The job

Make ONE list of every audit, review, sweep and open ask from the last week (2026-09-21 to 2026-09-28), each with a link. Cheap and fast: read titles, first lines, and `outcome`/`status` fields; never read whole transcripts.

## Where to look

1. These, first (the owner named them):
   - `/framework/ai2/2026/09/25/open-tasks-where-each-one-is-and-what-ne/`
   - `/framework/ai/2026-09-24/loose-ends/`
   - `/framework/ai/2026-09-25/feedback-council/`
   - `/framework/ai/audits/paging/`
   - the css-audit, page-audit and layout-check tasks under `public/framework/ai/2026-09-25/`
   - `public/framework/ai/todo.md`
2. Then scan: `public/framework/ai/2026-09-2*/*/` (task dirs: `requirements.md` title, last `task.jsonl` line with `landed_at`/`outcome`), `public/framework/ai/2026/09/*/*/page.jsonl` (cards: first line title/type/status), `public/framework/ai/audits/`. Grep names for `audit|review|sweep|council|loose|todo|check|critique`.
3. Open asks: cards whose type is `question` or status is `open`, and unticked `- [ ]` lines in audit reports.

## Output — write exactly one file

`public/framework/ai/2026-09-28/organization/scan/list.md`, grouped under three headings:

- `## Audits` — one line each: `- [title](/framework/ai/...) — date — one clause: what it found / status`
- `## Open asks` — one line each, same shape, with `(paging)` appended when it concerns Page, paging, columns, the page skill or /framework/core/Page/.
- `## Paging` — repeat every paging-related item here too.

Links are site URLs (`/framework/ai/<date>/<slug>/` for task dirs, `/framework/ai2/<yyyy>/<mm>/<dd>/<slug>/` for cards). At most 120 lines. No prose beyond the lines.

## Fence

Write only `scan/list.md`. Edit nothing else. No processes, no server restarts. When done, reply with one line: how many audits, how many open asks, how many paging.
