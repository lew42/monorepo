# Requirements — verbatim (minion brief)

> Make a page at /framework/ai/2026-09-22/card-to-task/proof/ that says hello and the time.
> Nothing more than that for now.

Load the `code` and `new-page` skills first if you haven't in this session.

## Deliverable

1. A page reachable at the exact URL `/framework/ai/2026-09-22/card-to-task/proof/` whose
   content is just "hello" and the current time — nothing else, no extra chrome, no demo
   blocks. The time can be static (rendered at page-load / server-render time) — this is a
   proof page, not a live clock.

## Why the parent needs a small edit too

`public/framework/ai/2026-09-22/card-to-task/` currently holds only a `requirements.md` for a
**separate, bigger task** (a Dispatcher/assistant project — do not touch that file or anything
about it). It has no `page.js`, so today it resolves as a dynamic task-dir page via the day's
`route()`. To nest a real `proof` page under it, it needs its own tiny `page.js`.

## Build, in order

1. **`public/framework/ai/2026-09-22/card-to-task/page.js`** — new file. Minimal `Page`:
   `title`, one-sentence `description`, `children: "proof"`, and a `content()` that's just a
   line or two saying this is the card-to-task task dir with a link to the requirements (or
   even simpler — look at how a plain task-dir page usually renders and don't over-build;
   this page's only real job today is to make `proof` resolvable).
2. **`public/framework/ai/2026-09-22/card-to-task/proof/page.js`** — new file, the actual
   deliverable. `title: "Proof"`, content: an `h1` or `p` saying "hello" plus the current
   time (e.g. `new Date().toLocaleString()`), nothing more.
3. **`public/framework/ai/2026-09-22/page.js`** — read the `children:` comment at the top
   first (it explains why). Add `card-to-task` to the `children:` string (alphabetical-ish,
   matches the existing style) so it resolves as a declared page instead of falling into the
   day's dynamic AITask route.

## Verify

- Headless-render `/framework/ai/2026-09-22/card-to-task/proof/` — zero console/network
  errors, "hello" and a time string both visible in the text.
- Headless-render `/framework/ai/2026-09-22/` (the day page) too — confirm it still renders
  clean and `card-to-task` doesn't break anything else in that children list.
- `node --check` on all three changed/new files.
- This worktree likely has no Servex-tracked dev server of its own reachable via the `site`
  MCP tool (the shared site tab lives on the main tree) — if so, do the same thing the prior
  `small-hello-page` task in this same dir did: run your own headless Playwright check
  directly against the worktree's files/dev process, and say so in your report.

## Fence

Exactly the three files above. Do not touch `card-to-task/requirements.md` or anything under
`Servex/`, `ai2/`, or `talk/`.

## Report back

One paragraph: what you built, the verify results (console/network errors, node --check,
which method you used to render), and the final URL.
