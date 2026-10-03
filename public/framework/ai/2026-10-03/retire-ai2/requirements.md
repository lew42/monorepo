# Retire AI 2

Owner (2026-10-03, relayed by vscode-mastermind): AI 2 is still in the left nav and its
directory is still full; finish the retirement now ("it should all still be in Git if we
need it").

Correction mid-task: this is a MIGRATION, not a delete. /framework/ai/page.js and
/framework/ext/drawer still import ai2/rail.js, which pulls in nearly the whole module graph
(groups/tasks/faces/activity/inbox/compose/card/needs/needs-rule/chat/live/processes/meter/
agents/workspace/real/rules.js + rail.css/processes.css/groups.json). Separately, every card's
page.jsonl stores "class": "/framework/ai2/card.js" as literal data (core/Page/Page.class.js's
log_class() dynamic-imports that exact string) — so that one path must keep resolving even after
the real file moves.

Budget: $8, Sonnet. A sibling, @task-mastermind-inbox-cards-work, is concurrently fixing inbox
bugs in these same ai2/ files — coordinating via page inbox notes on /framework/ai2/, landing in
small merges.

## Deliverables
1. Move the live library files (everything rail.js imports, transitively) to
   public/framework/ai/cards/; update their importers (ai/page.js, ai/dashboard/page.js,
   ext/drawer/tabs/ai.js, ext/drawer/rail.js, catalog.json demo snippets).
2. Leave a thin re-export shim at public/framework/ai2/card.js (the only "class" literal found
   stored in page.jsonl data — confirmed across every page.jsonl in the repo) so existing data
   keeps loading.
3. Delete what nothing imports: ai2/page.js (route), outline.js, overview.js + overview/ data
   dir, log.js, ai2.css, doc/, readme.md, weight.jsonl, top-level files.jsonl, ai2/ai/ data dir.
4. Drop the ai2 entry from framework/page.js's children: list and framework/readme.md's bullet.
5. Smoke /framework/ai/ and its tabs (Inbox, Log, Sessions, drawer AI tab) in a worktree before
   landing.
