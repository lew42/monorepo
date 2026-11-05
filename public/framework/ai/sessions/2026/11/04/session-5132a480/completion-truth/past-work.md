<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Completion you can trust" (words: completion, you, can, trust)

## Tasks (8, best first)
- 2026-10-29 [You are a standing usage checker for a Claude cloud session that coor…](/framework/ai/sessions/2026/10/29/spawned/minion-usage/) — (no outcome logged)
- 2026-10-25 [You are a fresh AI-system mastermind for voice session v-sq8y7db (pag…](/framework/ai/sessions/2026/10/25/session-e06424f1/mastermind-tasks-completion/) — (no outcome logged)
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-03 [Browser launches: tagged, reaped, and one warm one Servex can check p…](/framework/ai/sessions/2026/10/03/0df64c47-b244-4a73-babb-16d86535c9b8/playwright-reap/) — Every chrome.exe Playwright starts is recognisable and reaped; Servex can check a page's console for you. launcher logs pid/started/closed — fixed a real pid bug, proved live (913212e6) recognisable as ours by its ms-playwright path (user-data-dir is refused … · paths 0/1 exist, gone: framework/ai/live/
- 2026-10-03 [Servex: spend goes where results are, and you can see who spawned whom](/framework/ai/sessions/2026/10/03/spend-shape/) — public/framework/ai/2026-10-03/spend-shape/requirements.md
- 2026-09-28 [Page mastermind: organization card, object card, core/Page Make + Lay…](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/) — core/Page: Make a page and Layout tabs; object card live; one card ranks everything. ![](/framework/ai/2026-09-28/organization/rewrite/shots/layout-1920.png) priority card, every item a link: [the card](/framework/ai2/2026/09/28/organization-what-matters-most… · paths 3/5 exist, gone: framework/ai2/2026/09/28/organization-what-matters-most-paging-fi/ framework/core/Page/api/

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [ext/layout](/framework/ext/layout/) — used by 19 files

## Docs and readmes
- [UX — the behavior tier: ui/ hands you markup, ux/ hands you…](/framework/ux/readme.md) — ## Index Every module here, and what you would use it for. - [Auth](./Auth/) — login, signup, password reset and a social-login row, as one…
- [Previews — how a thumbnail can be the page](/framework/styles/layouts/doc/previews.md) — Split out of readme.md. Scope: what goes *inside* a card. Two kinds of thumb sit in the same card shape now — a live page.frame() painted d…
- [Tree — nested rows you can open, drag and drill into. One c…](/framework/ux/Tree/readme.md) — Rows from a plain array, or straight from a Page's children. The keyboard is always on. Drag, the drill-down and the row buttons are proper…
- [Decide: can the collapse be done without touching the activ…](/framework/core/Page/layout/switcher/doc/decide.md) — Yes. The narrow-width dropdown is a CSS-only, container-query addition in [switcher.css](../switcher.css) that reacts to classes core/Route…
- [Property — one live value you can bind to](/framework/core/Property/readme.md) — class Property extends Events(Object): get(), set(v) (emits change(value, old) only if it changed), bind(fn) (calls fn now and on every cha…
- [Test — node tests that run when the code they cover changes…](/framework/core/Test/readme.md) — ## Index - [TestRunner.test.mjs](./TestRunner.test.mjs) · [Test.test.mjs](./Test.test.mjs) · [fallback-modules.mjs](./fallback-modules.mjs)…
- [Object — one default view for any object: a row you can ope…](/framework/ux/Content/Object/readme.md) — view(x) draws any object (an Item, a List, a class, a plain object, an array) as one row: the class's icon, the id, the class name as a sma…
- [Menu — a <details> menu you can extend: ui/menu's one line,…](/framework/ux/Menu/readme.md) — ui/ still owns every .ui-menu-* rule; this owns the state, the listeners and the lifecycle the template deliberately never had — close-on-p…

## Sessions tagged with these words
- 2026/10/13 [Layout architecture documentation](/framework/ai/sessions/2026/10/13/session-abc4b9cc/) — kind/agent model/haiku mod/core/layout task/mastermind-repo-slim docs/architecture · $0.19
- 2026/10/13 [Minion arch styles layouts](/framework/ai/sessions/2026/10/13/session-619dc8c1/) — kind/agent model/haiku mod/styles/layouts task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/13 [Minion arch3-layout](/framework/ai/sessions/2026/10/13/session-4c37637f/) — kind/agent model/haiku mod/ext/layout docs/architecture · $0.22

## Owner asks
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 Skills: structure for content, layout, UI and navigation (proposal first) (mastermind-servex-9, routed)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)

## Commits
- d9687ccdc session 5132a480: brief for completion you can trust
- 4d2860a7a Servex/agents/Agents.js: checkpoint the uncommitted spend-gate draft, unblock merges

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,895 tokens of reading, under the 100k limit).

Question: Completion you can trust

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Completion you can trust"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
