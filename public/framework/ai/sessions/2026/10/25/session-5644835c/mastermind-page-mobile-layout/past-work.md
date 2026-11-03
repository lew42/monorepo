<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Owner reports  framework core Page  looks broken on mobile  its cards are clearly not aligned properly  1  Take headless" (words: owner, report, framework, core, look, broken, mobile, card, clearly, not, aligned, properly, take, headles)

## Tasks (8, best first)
- 2026-10-25 [Owner reports /framework/core/Page/ looks broken on mobile: its cards…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-page-mobile-layout/) — (no outcome logged)
- 2026-10-23 [Figma: mobile cards for sessions, projects, tasks and processes](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/figma-cards/) — New Figma page, mobile first, real data: seven bands and a What to pick card. [Open the page](https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/?node-id=324-54823) · [notes and picks](/framework/ai/sessions/doc/mobile-cards.md) session card variants: band C…
- 2026-10-12 [Owner inbox: one owner_note path pinned to the top](/framework/ai/sessions/2026/10/12/session-d2fd8fab/owner-inbox/) — owner_note landed. Agents now tell the owner through one tool; the note sits first in the AI Inbox until the owner opens it. note reaches the owner and stays: score 100, no decay, first row; headless at 400/1200/1920/3440, no errors ([STATE.md](/framework/ai/…
- 2026-10-03 [core/Item: a field colliding with a method now throws, not silently s…](/framework/ai/sessions/2026/10/03/list-events/field-collision-throw/) — Fields are code-only; a collision throws — [Item](/framework/core/Item/) static fields stays code-only — nothing at runtime adds an accessor (already true; confirmed by reading apply()/set_one()) a name check walks the WHOLE prototype chain (methods, accessor… · paths 3/3 exist
- 2026-10-02 [Framework cards: size follows weight, unread badges scaffolded](/framework/ai/sessions/2026/10/02/framework-home/weight-badges/) — Landed. /framework/ cards now size by weight (core/Page/weight/weight.js, reused): a heavy module shows its readme's own live ## Architecture excerpt, everything else is icon + name only. big card shows live architecture excerpt — [Page/Item/List cards](/fram…
- 2026-10-02 [Framework home: sections from the sidebar's own tree, dark class card…](/framework/ai/sessions/2026/10/02/framework-home/) — Landed. /framework/ is a wall of sections, one per sidebar group, read from the sidebar's own tree. Classes get dark cards, columns balance by height, old page kept at /framework/old/. back up the old page — [/framework/old/](/framework/old/) sections in side… · paths 4/4 exist
- 2026-09-30 [Cards: a card system at core/Page/card, and logs shown as nested cards](/framework/ai/sessions/2026/09/30/cards-and-logs/cards-and-logs/) — The card system and an object log landed (3d4aa09a). ![](wire/card-1920.png) "a core page card system": [/framework/core/Page/card/](/framework/core/Page/card/) light gray, dark, strong hue, nested: [grounds](/framework/core/Page/card/grounds/) "after the thi… · paths 7/7 exist
- 2026-09-30 [core/Page: card wired in, its index page finally shows itself](/framework/ai/sessions/2026/09/30/cards-and-logs/cards-and-logs/wire/) — Wired card into Page, and made its index page show, not tell. card added to core/Page/page.js children, after weight one readme line under "The sub-systems" in core/Page/readme.md [card/page.js](/framework/core/Page/card/): live sample (4 grounds, 3 cards dee… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [ui/card](/framework/ui/card/) — used by 23 files
- [ux/Card](/framework/ux/Card/) — used by 3 files

## Docs and readmes
- [Inbox — one ranked list of what wants the owner's attention…](/framework/core/Page/ext/Inbox/readme.md) — An inbox is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, Inbox.rank. There are two v…
- [Owner notes, 2026-10-16 (evening): compositing tasks (dicta…](/framework/core/Task/doc/owner-2026-10-16-composition.md) — Companion to owner-2026-10-16-task-system.md. The other voice session's vocabulary is in public/framework/ext/Refine/doc/card-types.md (Tas…
- [Owner notes, 2026-10-16: the task system (dictated, capture…](/framework/core/Task/doc/owner-2026-10-16-task-system.md) — Not a plan, not approved. Before building: look at what exists, write a plan, get it approved. If the owner does not approve, follow up; th…
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/…
- [Owner notes, 2026-10-16 (late): the node side of tasks (dic…](/framework/core/Task/doc/owner-2026-10-16-node-side.md) — Fifth note of the day. Facts verified 2026-10-16 ~20:30: Servex/TaskLoop.js and Server/TaskState.mjs import core/Task/Task.js and replay ta…
- [Owner notes, 2026-10-16 (night): the task system read top-d…](/framework/core/Task/doc/owner-2026-10-16-top-down.md) — Third note of the day; read owner-2026-10-16-task-system.md and owner-2026-10-16-composition.md first. Where the owner said "I'm not sure",…
- [Owner notes, 2026-10-16 (night): seeing tasks (dictated; ca…](/framework/core/Task/doc/owner-2026-10-16-ui.md) — Fourth note of the day. The point of the task system: see what was asked for, see what is done, keep working on what is not. Read the three…
- [Owner notes, 2026-10-17: routine procedures in the task sys…](/framework/core/Task/doc/owner-2026-10-17-node-driven.md) — Sixth note. The owner's words are verbatim in [requirements-15.md](../../../ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/re…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/15 [Sessions subpages](/framework/ai/sessions/2026/10/15/session-0c3e83dd/) — kind/owner model/sonnet mod/core/page task/subpages framework/refine · $1.34
- 2026/10/14 [Figma MCP skill design systems](/framework/ai/sessions/2026/10/14/session-f155ecbd/) — kind/owner model/opus mod/ai/sessions mod/ext/figma mod/ux/dictate framework/figma · $107.72

## Owner asks
- 2026-10-02 framework: new home page, dark class cards, sprawl layout (task-mastermind-framework-home, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 Inbox: core/Page/ext/Inbox extension; AI 2 Inbox to /framework/ai/; Needs you a filter; L… (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (servex-mastermind-opus (by hand until built), building)
- 2026-09-30 Prompts: each owner prompt becomes a refined Inbox card (task-mastermind-inbox-ext, dropped)

## Commits
- c1e352aa0 sessions: real token-based cost attempt surfaces a second cost-metering symptom; tighten regex; move detail t…
- 61b10007a AI rail: fix the "your-prompts" 404 at the root (bug 4)
- 3b1e344db drawer-chat: one AI tab, a clear session header, and a real composer panel
- a34539f98 ai2/ext/drawer: card measure edge, phantom chat-column void, inspect-mode gate
- c2d25ec3a ai2: pause the live board's pollers while the tab is hidden

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Owner reports /framework/core/Page/ looks broken on mobile: its cards are clearly not aligned properly. 1) Take headless

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Owner reports /framework/core/Page/ looks broken on mobile: its cards are clearly not aligned properly. 1) Take headless"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
