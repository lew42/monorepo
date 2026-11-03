<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Close two cracks  unread inboxes  and waiting on anyone but the owner" (words: close, two, crack, unread, inbox, wait, anyone, but, owner)

## Tasks (8, best first)
- 2026-10-20 [cracks-inbox-wait](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/cracks-inbox-wait/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/cracks-inbox-wait/requirements.md
- 2026-10-15 [live: Today card shows done vs waiting on X](/framework/ai/sessions/2026/10/16/voice-20261016/task-closeout/) — Today has 4 tasks done and 3 waiting; two finished tasks are now closed. - Waiting: handover-query (snoozed until 2026-10-18 by mastermind-voice-20261016), task-closeout (in flight), voice-20261016 (parent, agent active). - Closed with a landing line: live-fe…
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-17 [never-wait-on-the-owner-decide-document](/framework/ai/tasks/never-wait-on-the-owner-decide-document/) — (no outcome logged)
- 2026-10-13 [Dictate: one New session button, one mic indicator](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-session/) — One New session button and one mic indicator on every mic surface. one New session: sheet, AI tab and Dictate page all call chat.js's button; the other two copies are gone. Proof: proof.mjs pressed it on the 400 px sheet and the 1200 px drawer, session id to … · paths 1/2 exist, gone: framework/ux/Dictate/md/doc/chat/
- 2026-10-12 [Owner inbox: one owner_note path pinned to the top](/framework/ai/sessions/2026/10/12/session-d2fd8fab/owner-inbox/) — owner_note landed. Agents now tell the owner through one tool; the note sits first in the AI Inbox until the owner opens it. note reaches the owner and stays: score 100, no decay, first row; headless at 400/1200/1920/3440, no errors ([STATE.md](/framework/ai/…
- 2026-10-04 [Dictate: four owner-visible fixes — quad bubble, mic abort, instant s…](/framework/ai/sessions/2026/10/05/dictate-fixes/dictate-fixes/) — All four owner fixes landed on michael/dev (80cb509e, b4d31f83, 4cf347ad). Review: reviewed: 1 fixed, 3 noted — [review.md](review.md). Follow-ups it flagged (abort race untraced, a fast repeat silently drops, two "landed" checks) are in [decisions.md](/frame… · paths 2/2 exist
- 2026-10-02 [core/Page/ext/Inbox: one class Inbox, two statics Rail + Compact](/framework/ai/sessions/2026/10/02/panel2-sessions/panel2-sessions/part1b-inbox-restructure/) — One class Inbox, two lazy views — inbox.rail and inbox.compact. Inbox.Rail = today's InboxRail (moved, unedited, into Rail.js's renamed Rail class, assigned as a static) — [Inbox.js](/framework/core/Page/ext/Inbox/Inbox.js) Inbox.Compact = new class merging D… · paths 6/6 exist

## Modules that exist now (files outside the module that import it)
- [ux/Inbox](/framework/ux/Inbox/) — used by 15 files

## Docs and readmes
- [The error colour: too close to prime, and unreadable on dar…](/framework/design/color/doc/error-colour.md) — The owner checked Figma's error (#CC0000) on the Dark ground and found it almost invisible (about 1.1:1) and jarring. It is also close to p…
- [Inbox — one ranked list of what wants the owner's attention…](/framework/core/Page/ext/Inbox/readme.md) — An inbox is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, Inbox.rank. There are two v…
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/doc/readme-before-2026-10-19.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [The Inbox tab: every page has one, unread first, archive to…](/framework/core/Page/doc/inbox-tab.md) — Ask (the owner, 2026-10-12): "Every core thing, every module should have an inbox ... a secondary tab ... read it, then archive or clear it…
- [The balancing algorithm, and the two things that look like …](/framework/ext/sprawl/doc/algorithm.md) — sprawl(sections) hands back a CSS grid — repeat(auto-fit, minmax(min(100%, 60rem), 1fr)), one column under ~60rem of room, about three at 3…
- [Inbox](/framework/ext/drawer/doc/inbox.md) — ![Two notes in the page's inbox, at the top of the AI tab: who left each (a mastermind wears the M), how long ago, Clear](/framework/ext/dr…
- [Video kit: planning videos in Figma (owner, 2026-10-12 nigh…](/framework/ext/Figma/doc/video-kit.md) — The idea: use the Figma file to plan videos the way it plans pages. A rough draft first (scenes, titles, graphics, motion notes), worked on…
- [Accordion — one panel open at a time, with no JS: native <d…](/framework/ui/accordion/readme.md) — ## Use js details.c("ui-accordion-item pad", () => { summary(question); p.c("muted", answer); }).attr("name", "faq") // the shared name is …

## Sessions tagged with these words
- 2026/10/15 [Task closeout](/framework/ai/sessions/2026/10/15/session-65eaa74e/) — kind/owner model/sonnet mod/server task/task-closeout framework/inbox · $1.30
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Refine topic index](/framework/ai/sessions/2026/10/14/session-c69fde26/) — kind/owner model/sonnet mod/server task/mastermind-repo-slim framework/inbox · $2.46
- 2026/10/14 [Inbox browse rebuild](/framework/ai/sessions/2026/10/14/session-6214b71d/) — kind/owner model/opus mod/ux/browse mod/core/page task/mastermind-repo-slim framework/inbox · $8.16
- 2026/10/13 [Inbox data timeline view](/framework/ai/sessions/2026/10/13/session-a589c9e9/) — kind/owner model/opus mod/core/page mod/ai/page task/mastermind-repo-slim framework/inbox · $30.72

## Owner asks
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, building)
- 2026-09-30 AI 2: Inbox read/unread, archive, auto-resolve, search; Needs you hidden (task-mastermind-ai2-inbox-read, landed)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)
- 2026-10-13 Prompts: each owner prompt becomes a refined Inbox card (?, dropped)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,093 tokens of reading, under the 100k limit).

Question: Close two cracks: unread inboxes, and waiting on anyone but the owner

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Close two cracks: unread inboxes, and waiting on anyone but the owner"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
