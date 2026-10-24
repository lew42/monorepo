<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Deputy mastermind  the owner s queue  one thing at a time" (words: deputy, mastermind, owner, queue, one, th, time)

## Tasks (8, best first)
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Inbox: one record per thing, and the inbox as a timeline of big things](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-data/) — [The inbox timeline](/framework/core/Page/ext/Inbox/timeline/) is live: 1,096 things built and 70 for you, newest and most urgent first, each opening beside the rail with its card's chat. ![detail with chat](shots/localhost-61253-framework-core-Page-ext-Inbox… · paths 1/1 exist
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-12 [Servex relay: owner messages reach a mastermind through the assistant](/framework/ai/sessions/2026/10/12/session-ac44c638/relay-2/) — Owner and tab messages to a mastermind now go through the root assistant; @name or direct: true still goes straight. Read the bypass log by script: it held 0 lines because Policy.kind() missed mastermind-* ids (fixed) Route through the assistant, direct kept …
- 2026-10-12 [Owner inbox: one owner_note path pinned to the top](/framework/ai/sessions/2026/10/12/session-d2fd8fab/owner-inbox/) — owner_note landed. Agents now tell the owner through one tool; the note sits first in the AI Inbox until the owner opens it. note reaches the owner and stays: score 100, no decay, first row; headless at 400/1200/1920/3440, no errors ([STATE.md](/framework/ai/…
- 2026-10-19 [AI dashboard: the Inbox is one list over the one state, with filter c…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-dashboard/) — The Inbox in [/framework/ai/](/framework/ai/) is now one list over state.json, with url chips: Live, New, Recent, Older, Needs you, and a Kind row. No agent writes anything; the list streams. one dashboard, no new page: the Inbox rail reads the state (DashSta… · paths 3/3 exist
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-13 [Chat bubbles in time order, and the Refine page hears the chat](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/) — Chat bubbles now land in time order, and the Refine page shows what the ✦ chat heard. order fix: [ext/Chat](/framework/ext/Chat/) place(), merged e7533ddfc. Scripted four sentences with replies in between: before [FAIL](/framework/ai/sessions/2026/10/13/sessi… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [ext/depth](/framework/ext/depth/) — used by 4 files
- [ext/Timeline](/framework/ext/Timeline/) — used by 5 files
- [ui/timeline](/framework/ui/timeline/) — used by 9 files
- [ux/Auth](/framework/ux/Auth/) — used by 2 files

## Docs and readmes
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Inbox — one ranked list of what wants the owner's attention…](/framework/core/Page/ext/Inbox/readme.md) — An inbox is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, Inbox.rank. There are two v…
- [Collab — a mastermind's members through phases to a vote, l…](/framework/ext/Collab/readme.md) — ## What One collaboration run — a mastermind fans a question out to a few cheap members, they work through ordered phases (facts, then brie…
- [Refined asks: one record per ask, a topic list per module, …](/framework/ext/Refine/doc/asks.md) — Code: class AskIndex in [Server/AskIndex.mjs](/Server/AskIndex.mjs), called by RefineQueue.one() after each prompt is refined. The owner's …
- [Saver architecture — one write queue under three methods, b…](/framework/ext/Saver/doc/architecture.md) — Saver is where a JSON document goes: save(item), load(), delete(). The base class holds only the write queue ([Saver.js](../Saver.js)); eac…
- [Saver — where a document goes: save / load / delete over on…](/framework/ext/Saver/readme.md) — > ⚠ Converge (the owner, 2026-10-02): file and saving code is scattered across [ext/Saver](/framework/ext/Saver/) (whole-JSON rewrites), [e…
- [Quotation — one owner prompt: words, time, how, and a link](/framework/ux/Content/Quotation/readme.md) — A [Content](/framework/ux/Content/) module: reads its log once, writes one line per action. Records: prompt — [shapes](/framework/ux/Conten…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Nav-model page with live demos](/framework/ai/sessions/2026/10/14/session-e9f013e5/) — kind/owner model/opus mod/core/page task/mastermind-repo-slim page/catalog · $13.00
- 2026/10/14 [R2 archive Cloudflare class](/framework/ai/sessions/2026/10/14/session-e88409a1/) — kind/owner model/sonnet work/read-only task/mastermind-repo-slim framework/tasks · $0.60

## Owner asks
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-10-02 Hamburger drawer: closing it sometimes doesn't give the page its space back (fixed itself… (task-mastermind-one-dictation, building)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,139 tokens of reading, under the 100k limit).

Question: Deputy mastermind: the owner's queue, one thing at a time

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Deputy mastermind: the owner's queue, one thing at a time"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
