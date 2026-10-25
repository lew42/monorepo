<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Chat scroll fix is committed on branch worktree qf 7  2 commits  files public framework ext Chat Chat js  Chat css  ux D" (words: chat, scroll, fix, committed, branch, worktree, commit, fil, public, framework, ext, cs)

## Tasks (8, best first)
- 2026-10-25 [Chat scroll fix is committed on branch worktree/qf-7 (2 commits, file…](/framework/ai/sessions/2026/10/25/session-53d50878/task-mastermind-3/) — (no outcome logged)
- 2026-10-01 [The Dictate page becomes the workbench: chat() demo, keep option, int…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-workbench/) — The main Dictate demo is now a real, answered chat() mount — the same call every surface uses. item 1 — demo is a chat() mount, Widget options (level/source/debug) pass through: shot dictate-demo-1920.png item 2 — keep option added (true = global ✦ session, f… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-10-01 [Mobile rail fullscreen chat: fixed the thread's leftover 22em cap](/framework/ai/sessions/2026/10/01/d32d9965-08f0-4c35-9c32-13763889a3b0/rail-fullscreen-textarea/) — Fixed the mobile rail's fullscreen chat void. The chat thread was capped at 22em (Widget.css), sized for a normal page; rail.css lifted that cap for the card in fullscreen, but not the thread one level deeper, so it stopped growing early. That left empty spac… · paths 2/2 exist
- 2026-09-30 [Voice sessions: fixed the doubled chat line, plus 10 second-review fi…](/framework/ai/sessions/2026/09/30/voice-sessions/voice-sessions/f-dupe-line/) — What landed: commit 1486ea2 in C:/Code/lew42/worktrees/voice-fixes. Part A, the double line on the ✦ sheet: fixed in rail.js (own_ats Set), proved with a headless run — the sentence shows once, not twice. B1 New session always starts fresh (fresh: true throug… · paths 2/2 exist
- 2026-09-28 [Commit the live system: 326 uncommitted files into 12 named commits o…](/framework/ai/sessions/2026/09/29/1a4ab710-89f0-45d1-88ca-1f929880a2d1/commit-live-system/) — Landed — 326 uncommitted files went from git status --short down to about 10-12 (that count keeps moving; other agents are writing live), in 12 commits on michael/dev, none pushed. Groups + reasoning: [groups.md](/framework/ai/2026-09-28/commit-live-system/gr… · paths 1/1 exist
- 2026-10-16 [Sessions and accounting checkup: commit rule, cost fix proven, usage …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-sessions/) — Four tasks finished, one closed; one Servex restart needed. accounting R1-R17: closed, one verdict each, recorded in the AISession module cost fix: recost of 2026-10-16 is 86.3706 before and after over 219 sessions; needs a Servex restart to be live usage pac… · paths 1/1 exist
- 2026-10-12 [Sessions detail: tabs, hourly cost, fixed chat](/framework/ai/sessions/2026/10/12/session-f90a4e29/sessions-detail/) — Session detail is now tabs (Conversation, Cost, Models and tokens, Related) — [layout decisions](/framework/ai/sessions/doc/ui/detail-layout.md), [models and cost](/framework/ai/sessions/doc/cost/models-and-cost.md), [state](/framework/ai/2026-10-12/sessions-…
- 2026-10-05 [Voice cards: types, amend, icon chip, proposals, model-switch context](/framework/ai/sessions/2026/10/05/voice-chat-cards-and-model-context/) — Proposal written: voice cards and model-switch context ([report](/framework/ai/2026-10-05/voice-chat-cards-and-model-context/report.md)) card types: 5 picker types + the line kinds, report §2 amending a card: every part can be amended except a message, so the…

## Modules that exist now (files outside the module that import it)
- [ext/Chat](/framework/ext/Chat/) — used by 13 files
- [ext/CSSDoc](/framework/ext/CSSDoc/) — used by 2 files
- [ext/files](/framework/ext/files/) — used by 23 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 31 files
- [ux/Filter](/framework/ux/Filter/) — used by 4 files

## Docs and readmes
- [Chat — a scrolling chat log, composer, and conversation wid…](/framework/ext/Chat/readme.md) — Follows new messages while scrolled to bottom, formats Markdown bubbles with avatar icons, and supports threading and reactions. ## Use js …
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Smart scroll](/framework/ext/Chat/doc/scroll.md) — The log keeps one true-or-false fact, locked (talk.locked() reads it). It starts true, which means "stay at the bottom". - Scrolling up unl…
- [Doc — a module documented as a page (Overview · API · Docs …](/framework/ext/Doc/readme.md) — ## Index [overview](./overview/) — the urls the Overview tab uses ## Use js export default new Doc({ meta: import.meta, title: "View", subj…
- [Context loss: a session's work survives only in files](/framework/ai/doc/context-loss.md) — When a Claude session ends, its context window is gone: everything it read, reasoned and was told. The next agent starts cold and knows onl…
- [ext/files](/framework/audit/doc/ext-files.md) — files() is a small, well-scoped file browser — a tree of real, fetched files and the one you clicked — and it earns its place doubly now: i…
- [CSSDoc — every CSS rule that lands on one element, read out…](/framework/ext/CSSDoc/readme.md) — A human writes *why a rule exists*. A human must never write a declaration, a selector, a layer, a file name or a computed value — those ar…
- [Doc architecture — a module is a page with four fixed tabs](/framework/ext/Doc/doc/architecture.md) — Doc turns a module into a browsable page: Overview, API, Docs, Files, plus any declared children. It is a class, [Doc.js](../Doc.js), that …

## Sessions tagged with these words
- 2026/10/13 [Architecture md filesystem module](/framework/ai/sessions/2026/10/13/session-6bd8fba7/) — kind/agent model/sonnet mod/ext/filesystem task/mastermind-repo-slim docs/architecture · $0.28
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Refine audit](/framework/ai/sessions/2026/10/15/session-6089bb2b/) — kind/owner model/sonnet mod/ext/refine task/refine-audit framework/refine · $5.93
- 2026/10/15 [Refine explain](/framework/ai/sessions/2026/10/15/session-1e34cf8f/) — kind/owner model/haiku mod/ext/refine task/refine-explain framework/refine · $0.57
- 2026/10/14 [Figma MCP skill design systems](/framework/ai/sessions/2026/10/14/session-f155ecbd/) — kind/owner model/opus mod/ai/sessions mod/ext/figma mod/ux/dictate framework/figma · $107.72

## Owner asks
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-10-03 Page: AI cost line broke /framework/ai/ title (fixed db0e77af); links styled everywhere; … (task-mastermind-layout-gate, building)
- 2026-09-30 Chat: reactions, threaded replies, assistant icons, M logo (minion-chat-reactions, building)
- 2026-09-30 Servex docs: the agent system as flowcharts (task-mastermind-servex-docs, routed)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)

## Commits
- 51186894a quick fix: chat scroll lock unlocks only on reader gestures, 40px pin zone
- 191409455 quick fix: newest button lands last message at bottom; no side scroll in chat
- 2ab331348 Dictate round 2: mic-abort reload race, no mid-pause beeps, capped box, one status line
- 60900e3f4 Voice-session fixes from 2026-10-01, committed as they stand in main

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Chat scroll fix is committed on branch worktree/qf-7 (2 commits, files public/framework/ext/Chat/Chat.js, Chat.css, ux/D

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Chat scroll fix is committed on branch worktree/qf-7 (2 commits, files public/framework/ext/Chat/Chat.js, Chat.css, ux/D"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
