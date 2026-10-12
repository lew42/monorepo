# prior-cloudflare — scout brief

Less is more · clarity is the exception · prioritize. Read [`../mastermind-platform/minion-rules.md`](../mastermind-platform/minion-rules.md) first; everything there is mandatory. `new-task` (this dir, group `platform`) before the first edit; `code`, `layout`, `new-page` before writing the page; `finish-task` to land.

**The question:** What Cloudflare work exists across the owner's projects, what did it decide, what should the platform reuse, and what must it not copy? And one yes/no with evidence: has anything ever been deployed with a Worker `main` (server code), or only static assets?

## Deliverable

`public/imagine/platform/prior/page.js` — ONE screen, three short sections: **what was built** (per project, with its deploy shape) · **what was decided** (verdicts already written, each linked to the doc that holds it) · **reuse / do not copy** (one line each). Then the yes/no. Yours alone: that dir and this task dir. The mastermind adds `prior` to the hub's `children:` — do not edit `public/imagine/platform/page.js` or `/imagine/page.js`. Container: a column in `/imagine/`'s columns host (`width: "large"`). Files outside this repo cannot be linked — quote their paths in code spans. Every finding also a `log` line in your `task.jsonl`.

## Read — a closed list

Outside this repo (read-only, never copy code into the repo):
- `c:/Code/frozen-helix/` — `CLAUDE.md`, `wrangler.jsonc`, `persistence.md`, `persistence2.md`, `persistence-review.md`, `scripts/readme.md` (what was `command-palette.png` — a prior omnibox?), `tests/browser/` (what was tested), `Server/plugins/`, `public/_redirects`, `git log --oneline -30`, `ls public` at depth 2. ⚠ Its `.claude.json` project config carries an API key — never write it anywhere.
- `c:/Code/lew42com/` — `wrangler.toml`, why there are `Server`, `Server2`, `Serverble`, `git log --oneline -10`.

In this repo:
- `wrangler.jsonc`, `readme.md` (Cloudflare Previews section), `public/fly/readme.md` (the trailing-slash hybrid), `public/blog/doc/meta-tags.md`.
- `public/imagine/cms/services/page.js`, `public/imagine/cms/readme.md`, `public/imagine/cms/doc/`, `public/imagine/cms/thinking.md`.
- `public/imagine/stream/readme.md`, `public/imagine/stream/doc/durable-objects.md`, `public/imagine/stream/doc/decisions.md`.
- `public/framework/ai/2026-08-30/cloudflare-mcp/requirements.md` + the last line of its `task.jsonl`; `public/framework/ai/2026-08-30/streaming-pages/requirements.md`; `public/framework/ai/2026-08-30/cms-thinking/requirements.md`.
- `Server/plugins/Auth.js`, `Server/plugins/MCP.js` (one line each: what they are).
- `public/framework/dev/Socket/doc/localhost.md`, `public/framework/faq/page.js` (grep for cloudflare).

## Two counts that must agree with a grep

- Cloudflare products named in CODE (`.js`, `.jsonc`, `.toml`, `.mjs`) vs only in DOCS (`.md`) across the three projects: `rg -il "durable object|workers|\bD1\b|\bKV\b|\bR2\b|queues|wrangler" <root> --glob '!node_modules'` split by extension. Two numbers, listed files.

## Fences

Read everything; write only `public/imagine/platform/prior/` and this task dir. No CSS file. No new class names. Verify the page renders on a private server (rules file) at 1280 and 3440 headless, or say you could not.
