<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Read aloud stutters at the start  find why and fix it  you are a mastermind  on Sonnet  high effort " (words: read, aloud, stutter, start, find, fix, you, mastermind, sonnet, high, effort)

## Tasks (8, best first)
- NOW [Pool: quick_fix works again; the fixer holds one slot across restarts](/framework/ai/sessions/2026/10/25/session-e06424f1/mastermind-worktree-pool/) — quick_fix has free slots again: the [fixer](/Servex/agents/Fixer.js) reuses its one held slot in the [pool](/Servex/doc/pool.md) instead of leaking one per restart. Proof: commits 815477587, c413c548c; node Servex/pool-hold.test.mjs 8 checks pass; take_worktr…
- 2026-09-29 [readme_chain(dir): every directory-bound agent starts already knowing…](/framework/ai/sessions/2026/09/29/readme-chain/readme-chain/) — What landed — a fresh agent Servex spawns FOR a directory or a page now opens with the readme.md chain from the repo root down to it, in order, so it knows "where it is" before its first turn. readme_chain(dir) helper next to brief.js, root-down, trimmed to f… · paths 3/3 exist
- 2026-09-28 [core/Page docs: Make a page + Layout tabs, tab order fixed](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/rewrite/) — Landed: [core/Page](/framework/core/Page/) has two new top tabs — [Make a page](/framework/core/Page/make/) (the four ways to build a page, code then live result) and [Layout](/framework/core/Page/layout/) (Choosing a layout: five shapes as icon items, each l… · paths 7/7 exist
- 2026-09-21 [mastermind-sonnet-run](/framework/ai/sessions/2026/09/19/mastermind-sonnet-run/) — Stood down by the owner after they committed the repo (3e9536d4, working tree clean). That was item 1 on their list for two days and it unblocks the worktree workflow they asked for this morning. Eight tasks landed today: ai-front (stopped mid-flight, its wor… · paths 2/2 exist
- x [ai-highlights](/framework/ai/sessions/2026/09/08/ai-highlights/) — The AI front page is a wall of 81 highlights, grouped by day — [/framework/ai/](/framework/ai/): what is running, the usage windows, then a card for every thing worth going back to, newest day first. Every task of every day moved to [/framework/ai/log/](/fram… · paths 3/6 exist, gone: framework/ext/AITask/doc/highlights/ framework/ext/AITask/doc/manifest/ framework/ai/effort/websites/
- 2026-10-27 [Budget: $6. You are a helper doing ONE read-only investigation plus O…](/framework/ai/sessions/2026/10/26/session-264f7d21/mastermind-roles-auditor/) — (no outcome logged)
- 2026-10-25 [Read the brief at C:\Code\lew42\monorepo\public\framework\ai\sessions…](/framework/ai/sessions/2026/10/25/session-d3ed399d/minion-chat-split-fixes/) — (no outcome logged)
- 2026-10-20 [Phone sheet: reconnects after a Servex restart, one layout that only …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/mobile-sheet/) — The phone ✦ sheet reconnects after a Servex restart, and is one three-row layout at every height. Merged 3415f5018. | Before | After | |---|---| | ![](/framework/ux/Dictate/surfaces/sheet-steps/before/sheet-003.png) | ![](/framework/ux/Dictate/surfaces/sheet-… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/highlight](/framework/ext/highlight/) — used by 24 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [audit — the whole site measured and ranked worst-first, for…](/framework/ext/DesignTool/audit/readme.md) — ## Use Open [/framework/ext/DesignTool/audit/](/framework/ext/DesignTool/audit/) — the saved run loads instantly; "Re-measure live" is 168 …
- [past-work: look before you build](/framework/ai/skills/past-work/readme.md) — The owner (2026-10-12): "We don't want to set off and build something that's already been built, especially if it's stable and used everywh…
- [Recite — reads the AI's replies aloud](/framework/audio/Recite/readme.md) — Recite is text to speech, the reverse of transcription. It reads a reply out loud with a local voice, so you can use the site on a walk wit…
- [Collab — a mastermind's members through phases to a vote, l…](/framework/ext/Collab/readme.md) — ## What One collaboration run — a mastermind fans a question out to a few cheap members, they work through ordered phases (facts, then brie…
- [Taste — the third DesignTool tier: eleven weighted ideal ra…](/framework/ext/DesignTool/taste/readme.md) — ## Use js import { rate } from "/framework/ext/DesignTool/taste/taste.js"; rate(document.querySelector(".page.active-page")); // → { score,…
- [Framework — everything it offers is organized, visual, brow…](/framework/readme.md) — ## Index - [Item system status](./core/doc/status.md) — what's built of the save-and-stream plan, what isn't, the check that sessions and t…
- [The flicker — why your words vanished and came back, and th…](/framework/ux/Dictate/doc/flicker.md) — The rule (the owner, 2026-10-24): while dictation is on, your words appear in place in the chat bubble, as if already sent. Nothing you are…
- [Quick fix](/framework/ai/quick-fix/readme.md) — The log of every small fix asked for by voice — "make this bold", "this gap is too big" — and how many seconds each one took to land. The l…

## Sessions tagged with these words
- 2026/10/14 [R2 archive Cloudflare class](/framework/ai/sessions/2026/10/14/session-e88409a1/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim framework/tasks · $0.60
- 2026/10/14 [Screenshots never committed](/framework/ai/sessions/2026/10/14/session-d60d1ad7/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim framework/sessions · $1.12
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-c56372f0/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim framework/inbox · $0.15
- 2026/10/14 [Clarity session naming](/framework/ai/sessions/2026/10/14/session-bfc2468f/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim dictation/clarity · $0.15
- 2026/10/14 [Architecture-md-7](/framework/ai/sessions/2026/10/14/session-b6d60f5c/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim · $3.11
- 2026/10/14 [OO-census review](/framework/ai/sessions/2026/10/14/session-b6c077ac/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim framework/oo · $0.27

## Owner asks
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: Read-aloud stutters at the start: find why and fix it (you are a mastermind, on Sonnet, high effort)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Read-aloud stutters at the start: find why and fix it (you are a mastermind, on Sonnet, high effort)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
