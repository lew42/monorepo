# post-dashboard

## Ask (verbatim)

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more — a post is a 3-5 minute read. 2. Clarity is
the one exception — a hiring engineer is the reader. 3. Prioritize. Final report ≤10 lines.
CLAUDE.md rules; read it. HARD RULES: never kill/restart the :80 dev server; never drive owner
tabs; never stash; never commit; NEVER write the owner's name. Screenshots: scratchpad first;
commit-worthy images IN the post dir.

TASK — write the blog post at `public/blog/ai/dashboard/`. First: run `new-task` (slug
`post-dashboard`, group `pages`).

CONTRACT (fixed; shell builds in parallel): slug `ai/dashboard`, title "The AI dashboard". Single
part. Post shape from `public/blog/framework/how-this-blog-works/` or current
`public/blog/posts.js`; stamp index.html via `node public/blog/meta.mjs --write` (note if it
errors mid-build).

THE POST — the /framework/ai/ system: every AI session opens a task dir with an append-only
`task.jsonl`; the day board renders them LIVE over a socket (appends stream, no reloads); cards
carry steps/progress/links/screenshots; landing lines are reports; hooks auto-log edits; the
usage guardrail. Why jsonl (append-only, git-diffable, a viewer renders what agents write). SHOW
it: 2-3 screenshots — the day board with real cards (yesterday's 2026-08-29 board was a 20-task
day — a good one), one task detail page with its log + shots. Links: /framework/ai/, a real day,
ext/JSONL readme, ext/AITask readme. Ground in `ext/AITask/readme.md` + `ext/JSONL/readme.md`.
The angle for a hiring reader: this is process infrastructure — the owner runs AI agents like a
team and the board is their standup.

FENCE — `public/blog/ai/dashboard/**` only.

TRAPS: trailing slash in links; one backtick in css(`…`); headless Playwright global:
`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`.

VERIFY: cold-load 400/1920/3440, links N/N, images render, zero console errors. Keepers +
`links`. Report: url, link count, image bytes, cuts.

## Scope / file ownership

- Only touch `public/blog/ai/dashboard/**` (new dir).
- `public/blog/meta.mjs --write` regenerates index.html — allowed, it's the build step.
- Do not touch other blog posts or the shell (another agent owns that in parallel).

## Steps

1. Read post shape (how-this-blog-works, posts.js) + ext/AITask + ext/JSONL readmes
2. Screenshot the 2026-08-29 day board (real cards) + one task detail page (log + shots)
3. Draft the post — jsonl why, live socket, cards, hooks, usage guardrail, hiring angle
4. Build page.js + assets in public/blog/ai/dashboard/
5. Run meta.mjs --write to stamp index.html
6. Verify cold-load at 400/1920/3440, check links, zero console errors
7. Land with finish-task
