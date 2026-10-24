<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "ext tabs  the Tabs page loads with no error  and its demo tabs link to real urls" (words: ext, tab, load, error, demo, link, real, url)

## Tasks (8, best first)
- 2026-10-04 [Land sessions-tab-polish + data-grid: dead worktree servers, one real…](/framework/ai/sessions/2026/10/04/land-two-branches/land-two-branches/) — Both branches landed on michael/dev. sessions-tab-polish (8824068f), data-grid (ac28ba1e). Reviewed: size none, pass — both features were already built and reviewed twice by their own task masterminds; this task's job was landing them. land sessions-tab-polis… · paths 1/1 exist
- 2026-10-03 [Link styles + merge gate: blue links fixed, text-touching-edges now f…](/framework/ai/sessions/2026/10/03/588af12b-12cf-4166-a7a4-a6cfa504194b/layout-gate/) — Landed — every <a> now gets the house link style, not just ones in prose, and Server/smoke.mjs fails the merge on text flush against an unpadded edge or anything above a page's title. Commit a3248c70 on michael/dev. links styled everywhere: [shot, /framework/… · paths 1/1 exist
- 2026-10-01 [The Dictate page becomes the workbench: chat() demo, keep option, int…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-workbench/) — The main Dictate demo is now a real, answered chat() mount — the same call every surface uses. item 1 — demo is a chat() mount, Widget options (level/source/debug) pass through: shot dictate-demo-1920.png item 2 — keep option added (true = global ✦ session, f… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-09-28 [Dictation playground walkthrough: Next / Next through the real pipeli…](/framework/ai/sessions/2026/09/28/ccdca679-303e-4584-9809-8c4f79e29f42/dictation-playground/walkthrough/) — A six-step Next/Next walkthrough of the dictation playground, each step a real screenshot with one sentence. [Open the walkthrough](/framework/ux/Dictate/playground/walkthrough/) — linked from the top of the [Playground](/framework/ux/Dictate/playground/) pag… · paths 3/3 exist
- 2026-09-25 [Now card: tabs are real pages, chat on the right](/framework/ai/sessions/2026/09/25/94f151cf-dd45-4892-b1a0-d5a85f3987c4/now-card-tabs/) — Each tab on the Now card is now a real page with its own address, and the chat stays on the right. ![Decision tab, opened from its own address](/framework/ai/2026-09-25/now-card-tabs/shots/routes/direct-decision.png) Real addresses, no #tab=: [usage/ opened d… · paths 0/2 exist, gone: framework/ai2/2026/09/25/now/ framework/ai2/2026/09/25/now/usage/
- 2026-09-19 [reload-hold](/framework/ai/sessions/2026/09/19/reload-hold/) — The reload hold landed and is proven. One command before a batch of writes — node Server/hold.mjs on "<who> — <what>" — then the writes, then node Server/hold.mjs off "<who>": every server watching this repo (owner's, mastermind's, any private one) queues eve… · paths 1/1 exist
- 2026-09-06 [site-errors](/framework/ai/sessions/2026/09/06/site-errors/) — Both pre-existing console errors are gone, fixed at the cause — not patched per page. 1. this.words is not a function — styles/layouts/word.js's word() factory used a config key named words (a class string like "flex gap"). Page.class.js later added its own w… · paths 8/8 exist
- 2026-09-05 [paging-audit-4b](/framework/ai/sessions/2026/09/05/paging-audit-4b/) — Eight of my nine landed, the url seam is genuinely finished — and the exit test is not passed, because the pages the realm MAKES are broken in two ways I had not looked at before. The seam is done. Every configuration has an address and the address works cold…

## Modules that exist now (files outside the module that import it)
- [ext/demo](/framework/ext/demo/) — used by 62 files
- [ext/ErrorLog](/framework/ext/ErrorLog/) — used by 3 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/table](/framework/ui/table/) — used by 9 files

## Docs and readmes
- [Doc — a module documented as a page (Overview · API · Docs …](/framework/ext/Doc/readme.md) — ## Index [overview](./overview/) — the urls the Overview tab uses ## Use js export default new Doc({ meta: import.meta, title: "View", subj…
- [Tabs — a bar of links and the panel its children mount into…](/framework/ext/tabs/readme.md) — ## Use js import "/framework/ext/tabs/tabs.js"; // once, anywhere — app.js already does content(){ this.tabs("guide api"); } // children by…
- [DataGrid — one grid for every list of records: a table or a…](/framework/ext/DataGrid/readme.md) — Resize, sort, filter, windowing, and two drawers. The markup that used to be ui/datagrid and ui/table lives here now (those two files re-ex…
- [page.jsonl pages: how they load, how they name children, on…](/framework/core/Page/doc/jsonl-pages.md) — These are three answers, each with the verbatim source and its file:line, read on 2026-10-15. The full lookup order (md/, fs/, inbox/, bare…
- [How a url becomes a page](/framework/core/Page/doc/loading.md) — Every url is resolved one folder name at a time — never all at once. A url like /framework/core/Page/doc/ asks for framework, then core, th…
- [Path extensions — every module that hands a page an extra u…](/framework/core/Page/ext/doc/path-extensions.md) — An extension (the readme one level up) turns on *inside* one page's own box — a page.jsonl line, a render hook. It never changes what urls …
- [Router — everything between "a url changed" and "the DOM re…](/framework/core/Router/readme.md) — ## Use html <a href="/docs/intro/">Intro</a> That is the whole API. Each url segment is one page.child(name), a miss is an import, and a ur…
- [Dev — the local-only tier: live reload, the DevBar rail, ta…](/framework/dev/readme.md) — ## Index [Claim](./Claim/) — a ring and label around a browser tab an agent has claimed, so you can see which tab is theirs [DevBar](./DevB…

## Sessions tagged with these words
- 2026/10/13 [ext/tabs architecture documentation](/framework/ai/sessions/2026/10/13/session-f9024369/) — kind/agent model/haiku mod/ext/tabs task/mastermind-repo-slim docs/architecture · $0.21
- 2026/10/13 [Minion arch ext demo](/framework/ai/sessions/2026/10/13/session-1435920f/) — kind/agent model/haiku mod/ext/demo task/mastermind-repo-slim docs/architecture · $0.18
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Refine audit](/framework/ai/sessions/2026/10/15/session-6089bb2b/) — kind/owner model/sonnet mod/ext/refine task/refine-audit framework/refine · $5.93
- 2026/10/15 [Refine explain](/framework/ai/sessions/2026/10/15/session-1e34cf8f/) — kind/owner model/haiku mod/ext/refine task/refine-explain framework/refine · $0.57

## Owner asks
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)

## Commits
- bfc7949fd sheet step 6: the desktop dock, Sheet.Dock
- 50c45e71b sheet step 5: the route <path>/ai/, class AIPage extends Page
- 180626179 catalog: NEW pages first (first preview at 321 px, was 1034), previews load 4 at a time in screen order (firs…
- ca4aae470 core/List: drop assign/set from the API tab's methods list
- e7f5a7149 core/Page: fold PageLog away, Page extends Item directly
- e756032ee core/Page: four page tools (page_add/set/log/read) + page_note
- cc38d1093 core/Page/ext: a page extension system, Inbox first
- fb7aa7931 Stop ext/Ask's /ask/turn probe from firing on every page load

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: ext/tabs: the Tabs page loads with no error, and its demo tabs link to real urls

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "ext/tabs: the Tabs page loads with no error, and its demo tabs link to real urls"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
