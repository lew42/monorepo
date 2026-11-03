<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The one dashboard  step 3  the other AI pages become saved filters of the Inbox list  so no second reader survives" (words: one, dashboard, step, other, become, saved, filter, inbox, list, second, reader, surviv)

## Tasks (8, best first)
- 2026-10-19 [AI dashboard: the Inbox is one list over the one state, with filter c…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/) — The Inbox in [/framework/ai/](/framework/ai/) is now one list over state.json, with url chips: Live, New, Recent, Older, Needs you, and a Kind row. No agent writes anything; the list streams. one dashboard, no new page: the Inbox rail reads the state (DashSta… · paths 3/3 exist
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-14 [Refined asks: records, module lists, inboxes](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-topic-index/) — Refined asks are now records. 1080 recorded, 19 crossed off, 612 sent to their module's inbox, 449 stay open (site-wide or no module folder). - One record per ask, in the session's own asks.jsonl: [how it works](/framework/ext/Refine/doc/asks.md) - Topic list…
- 2026-10-14 [Tasks: in flight, queued and landed today, one live page](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/tasks-dashboard/) — [/framework/ai/tasks/](/framework/ai/tasks/) lists what is in flight, queued and landed today, live, from the real state. - ✅ One list, three groups, in order; a row opens the task card beside it. Proof: sheet-list-400-1200-1920-3440.png, shot-1920-detail.png… · paths 1/2 exist, gone: framework/ai/tasks/lanes/
- 2026-10-13 [AI Inbox: one ranking rule, importance plus recency, with a debug view](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-ranking/) — The Inbox now ranks by importance and recency (Inbox.rank), marks new rows with their age, and shows each row's score beside the live rail. Merged into michael/dev (07497fefb, review fixes 93460a038). Landed by the mastermind from the agent's own answer (the … · paths 1/1 exist
- 2026-10-13 [one-dashboard-filters](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard-filters/) — public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard-filters/requirements.md
- 2026-10-13 [framework/ai: one tree, the Inbox cards moved into the sessions store](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/) — One tree: every Inbox card now lives in ai/sessions/YYYY/MM/DD/cards/, and ai/2026/ is gone. A card keeps its address, so every old link still opens it. ![a moved card, opened from the Inbox](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-… · paths 2/2 exist
- 2026-10-12 [Page content: always one List](/framework/ai/sessions/2026/10/12/session-707f57ee/content-list/) — page.content is now one PageContent List for the page's life; a page's content(){} and its page.jsonl parts show together. code, address and string each an item with its own View: [what was built](/framework/core/Page/doc/content-list-step-1.md), live at [/fr… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/List](/framework/core/List/) — used by 23 files
- [ux/Filter](/framework/ux/Filter/) — used by 3 files
- [ux/Inbox](/framework/ux/Inbox/) — used by 13 files

## Docs and readmes
- [One AI dashboard: a proposal to agree on before anything is…](/framework/ai/doc/one-dashboard.md) — What you said (2026-10-17, 22:45): no new pages unless we agree on their structure; not another AI dashboard; one dashboard that just works…
- [AI v2 — one dense, full-width board, written to live; a sec…](/framework/ai/v/2/readme.md) — ## Use page.js (about 300 lines) + v2.css — the whole board, one file each, so the mastermind can edit it by hand in a minute. It reads ONE…
- [Refined asks: one record per ask, a topic list per module, …](/framework/ext/Refine/doc/asks.md) — Code: class AskIndex in [Server/AskIndex.mjs](/Server/AskIndex.mjs), called by RefineQueue.one() after each prompt is refined. The owner's …
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/readme.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [Hotkeys — one flat list of every hotkey in the app, filtera…](/framework/ux/Hotkeys/readme.md) — [See it live](/framework/ux/Hotkeys/) — the rows below are the real settings UI, not a picture of it. A hotkey is either a keyboard key or …
- [Item architecture — a headless data node, saved as one docu…](/framework/core/Item/doc/architecture.md) — Item is one persistent thing: an id, a data bag, one set(delta), and a place to save. It runs in plain node (no DOM, no transport). Main cl…
- [Adoption: how parent stays one hop](/framework/core/List/doc/adoption.md) — Every Item owns exactly one List, built as new List({ owner: this }). The owner reference is the entire mechanism behind a rule that spans …

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Task closeout](/framework/ai/sessions/2026/10/15/session-65eaa74e/) — kind/owner model/sonnet mod/server task/task-closeout framework/inbox · $1.30
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Refine topic index](/framework/ai/sessions/2026/10/14/session-c69fde26/) — kind/owner model/sonnet mod/server task/mastermind-repo-slim framework/inbox · $2.46
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-c56372f0/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim framework/inbox · $0.15

## Owner asks
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, building)
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)

## Commits
- 9f08272f7 mastermind: one-dashboard landed (steps 1 and 2), Servex restarted; records
- c55e9b012 docs: one-dashboard steps 1 and 2 built, with the commit
- 5c2ba8af1 docs: State cards, asks, checks and the fast wake; one-dashboard steps 1 and 2 built

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,881 tokens of reading, under the 100k limit).

Question: The one dashboard, step 3: the other AI pages become saved filters of the Inbox list, so no second reader survives

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The one dashboard, step 3: the other AI pages become saved filters of the Inbox list, so no second reader survives"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
