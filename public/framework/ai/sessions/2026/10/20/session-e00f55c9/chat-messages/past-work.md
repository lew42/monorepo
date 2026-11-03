<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "One real chat list  session messages  dual written beside V1 s old lines  you are a mastermind " (words: one, real, chat, list, session, messag, dual, written, beside, old, lin, you, mastermind)

## Tasks (8, best first)
- 2026-10-26 [Chat V3 rough draft: a plain view over the session's tasks list, behi…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-v3-draft/) — Chat V3 is merged to michael/dev, behind its own v3 chip (not the default). Demo: [Chat v3](/framework/ext/Chat/v3/). Docs: [readme](/framework/ext/Chat/v3/readme.md). V3 draws the session's tasks list, Prompts at the root: ChatV3.test.mjs 19/19 Raw words gra… · paths 1/1 exist
- 2026-10-26 [Tasks stay in the filing session; one-replay plan for session.jsonl](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-ai-system-architect/) — Tasks now stay in the session that files them; restart Servex to activate. 1 Item tool nests new tasks in the filing session, module folder only with home; sweep off (item_tool 111 checks, prompt-tasks 23) 2 Docs say so: [tasks](/framework/ai/doc/tasks.md), […
- 2026-10-13 [Refine queue: Haiku refines your past prompts one at a time; each ses…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/refine-pipeline/) — Your past prompts are now refined one at a time by Haiku, and each session page has a Coverage tab listing every ask you made, with a click-through to your raw words. ([doc](/framework/ext/Refine/doc/refine-queue.md)) - ✅ Server/RefineQueue.mjs: one Haiku cal…
- 2026-10-26 [Agent-name links in chat go to a page that does not exist. ext/Mentio…](/framework/ai/sessions/2026/10/25/session-15fa7f56/mastermind-agent-name-links-resolve/) — Landed on michael/dev (ea637bcb4 + follow-up commit): agent-name links resolve to the agent's real dated task folder through AgentUrl (ai/index.json, no second index); /sessions/<name>/ redirects there; names with no record show 'Session not found'. Opened /s…
- 2026-10-17 [Sessions: one session.jsonl record per session folder, writers includ…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-rename/) — New session folders now start as session.jsonl, so nothing created after today needs the move script. one SessionRecord.start_file decides the file: the log that exists, else session.jsonl for a new session folder (directly under a day, own session_id on line…
- 2026-10-14 [Inbox: one list-and-detail view, waiting-on-you at the top](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/inbox-browse/) — The Inbox runs on one list-and-detail view, [Browse](/framework/ux/Browse/), and pins Waiting on you at the top. - ✅ The class architecture: [Architecture tab](/framework/ux/Browse/architecture/). Browse is the orchestrator, Inbox.Rail extends Browse, AIRail … · paths 2/3 exist, gone: framework/ux/Browse/architecture/
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/List](/framework/core/List/) — used by 26 files
- [core/Session](/framework/core/Session/) — used by 19 files
- [ext/Chat](/framework/ext/Chat/) — used by 14 files
- [ext/layout](/framework/ext/layout/) — used by 19 files
- [ext/Session](/framework/ext/Session/) — used by 14 files

## Docs and readmes
- [AI v2 — one dense, full-width board, written to live; a sec…](/framework/ai/v/2/readme.md) — ## Use page.js (about 300 lines) + v2.css — the whole board, one file each, so the mastermind can edit it by hand in a minute. It reads ONE…
- [files architecture — real files, fetched, beside the one yo…](/framework/ext/files/doc/architecture.md) — files(import.meta, names, opts) in [files.js](./files.js) draws a tree of real files on disk next to the source (and optionally prose) of t…
- [Sections — a layout with real content in it; fifteen bands …](/framework/styles/sections/readme.md) — ## Use js import { div, p } from "/app.js"; import { band } from "./tone.js"; export default (tone = "dark") => div.c("section-band", () =>…
- [Task folders: one home, inside the sessions store (2026-10-…](/framework/ai/doc/task-folders.md) — > The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder…
- [Chat v2: a session's chat, drawn from its tasks list](/framework/ext/Chat/v2/readme.md) — - ⬜ Goal: the owner calls the whole experience "chat": the first view ([ux/Dictate](/framework/ux/Dictate/readme.md)) and Chat v2 become on…
- [ErrorLog — a UI error becomes one log line a session can fo…](/framework/ext/ErrorLog/readme.md) — ErrorLog.watch(stateFn) catches a page's uncaught errors and rejections; app.js calls it once on every page (since 2026-10-24). ErrorLog.re…
- [One rolling voice session, or many](/framework/ux/Dictate/doc/sessions.md) — The browser voice chat is one session shared by every page (chat.js, kept in sessionStorage under lew42-voice-session). The question: shoul…
- [Switcher — one list-switches-content pattern, three skins](/framework/core/Page/layout/switcher/readme.md) — Vertical tabs, a file tree beside its code, and a plain left nav all do the same job: a list on the left, or above on a phone, routes the c…

## Sessions tagged with these words
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Dictate-next-4 review](/framework/ai/sessions/2026/10/14/session-eadb28a6/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.83
- 2026/10/14 [Catalog previews](/framework/ai/sessions/2026/10/14/session-e94e007a/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/sessions · $0.19
- 2026/10/14 [Voice-connector review](/framework/ai/sessions/2026/10/14/session-e5bbf063/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.62

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate (restart at 4:50 PM), queued)

## Commits
- 0bb6ca826 brief: one real chat list, dual-written beside V1's lines
- 9b4fe7c98 Voice sessions: real titles, folder tracks the title, no more "no session undefined"
- 8ede86afc chat-split-fixes: one shared cursor pair per bubble, Prompt-closed merge, shared cursors.js
- 6623aae7e V1: two moving cursors (fast + smart), replacing the old single sent tick
- 6e640ddc7 Chat: the open bubble stays last, never split by what lands in between
- 494e754de chat round 4: fix inverted cursor semantics, had_speech_q queue misalignment, stale text/docs
- 7217da3b5 chat round 3: two moving cursors replace the per-prompt stamp; fix the paragraph-gap renderer bug
- 71d2d7d48 chat round 2: fix review findings, moving cursor mark replaces standing ticks/per-node dots

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,684 tokens of reading, under the 100k limit).

Question: One real chat list: session messages, dual-written beside V1's old lines (you are a mastermind)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "One real chat list: session messages, dual-written beside V1's old lines (you are a mastermind)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
