# Requirements — verbatim

> Make a page at /framework/ai/2026-09-22/card-to-task/proof/ that says hello and the time.
> Nothing more than that for now.

This is the proof-page deliverable named in `../card-to-task/requirements.md` (deliverable 4),
pulled out and built standalone, ahead of the Dispatcher/assistant machinery around it. That
bigger task owns `Servex/agents/**`, `ai2/inbox.js`, `talk/**` — this task touches none of it.

## Deliverable

1. A page at the exact URL `/framework/ai/2026-09-22/card-to-task/proof/` that says "hello"
   and shows the current time. Nothing else — no extra chrome, no demo blocks.

## Scope / fence

- `public/framework/ai/2026-09-22/card-to-task/page.js` (new — the dir currently has only a
  `requirements.md` for the separate, bigger task; give it just enough of a page.js to declare
  `proof` as a child. Do not touch that `requirements.md`.)
- `public/framework/ai/2026-09-22/card-to-task/proof/page.js` (new)
- `public/framework/ai/2026-09-22/page.js` — one-line addition to `children:` so `card-to-task`
  resolves as a declared page instead of the day's dynamic task-dir route().
- One minion, one file set. No worktree needed — we're already inside one
  (`wt-card-to-task`), single small page, no shared module touched.

## Read first

- `new-page` skill shape (page.js contract, parent `children:` link, doc/ dir).
- `code` skill (house style) if not already loaded.
- `public/framework/ai/2026-09-22/page.js` — read the `children:` comment before editing it;
  it explains exactly why a page.js dir must be declared there.

## Length budget

Tiny. Two small `page.js` files plus the one-line parent edit is the whole deliverable.
