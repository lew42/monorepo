<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "ask_mastermind  every answer always arrives" (words: ask, mastermind, every, answer, alway, arriv)

## Tasks (8, best first)
- 2026-10-20 [ask_mastermind: late answers reach updates; wait:false ticket](/framework/ai/sessions/2026/10/20/voice-20261020/async-ask/) — ask_mastermind no longer loses an answer. When the one-minute wait ends (timeout or cancelled call) RemoteMCP.ask() keeps watching the reply file for 30 minutes and puts the answer in the voice-app inbox (from: voice-mastermind, reply_to = question id) plus i…
- 2026-10-17 [State: one structure for every task, with a self-check](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-state/) — Every task in both stores now has one bucket, in one file. class State (Server/State.mjs) folds 2,276 task logs through Task.js into ai/state.json: 2,065 tasks = 1,310 landed + 1 in flight + 275 idle + 37 stopped + 442 stale. Landed today 43 by the rules vs 4…
- 2026-10-15 [framework/ai: readme smoke-test rule, logging, tags, asked-for summary](/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/) — Rule added to the mastermind skill; framework/ai readmes audited (3 fixes, rest listed); append.mjs now stamps every line; in-memory query exists (SessionIndex + ext/Query), tags recommended; node Server/Asked.mjs answers 'didn't I ask for X?'. · paths 1/1 exist
- 2026-10-14 [Module inbox: an ask lands where it belongs, a fresh mastermind reads…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/module-inbox-loop/) — ModuleInbox + the module_inbox tool + ModuleReview --plan + Servex/doc/module-inbox.md landed (638c54e90). The tool is live after the next Servex restart. Landing line written by the parent from the task's own landed: log line.
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-13 [SessionIndex: 1,491 task rows in memory, 1–2 s load, raw-log path on …](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/session-index/) — One in-memory SessionIndex (extends ext/Query) holds 1,491 rows from 1,491 task files, loads in 1.1–2 s (+21–23 MB heap); PastWork and FollowUp read through it with identical output; ux/Dictate = 33 tasks, 32 with a raw transcript path. Commits c5a9864ba, ab0…
- 2026-10-12 [AI code as classes: every census bag under ai/ converted](/framework/ai/sessions/2026/10/12/session-971b7153/ai-classes-asks/) — Every function bag the census listed under framework/ai/ is now a class, one per commit, merged to michael/dev: Faces, the nine cards/ classes, the rail/ classes, AskFold, AskRows, PageTypes, SystemClasses, HealthDevbar and AIOverview. Classes, not function b… · paths 3/4 exist, gone: framework/ai2/live/
- 2026-10-12 [Page: open-work line on every page, weight on any object](/framework/ai/sessions/2026/10/12/session-a2bdd14b/page-context-asks/) — Every page now shows its open tasks, and any object can carry a weight. #6 open tasks per page: a "N open tasks on this page" line on every Page and Doc page, from computed ai/page-work.json — [page-work-line.md](/framework/core/Page/ai/doc/page-work-line.md)… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 514 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Ask](/framework/ext/Ask/) — used by 42 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme
- [ui/tasks](/framework/ui/tasks/) — used by 5 files, no readme

## Docs and readmes
- [The owner on sessions, tasks and losing work (2026-10-20, d…](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) — The essence of a long dictation, recorded here so it survives the chat. Each point is the owner's position; the answer or decision follows …
- [Question — an ask, a text field, the latest answer beneath](/framework/ux/Content/Question/readme.md) — A [Content](/framework/ux/Content/) module: reads its log once, writes one line per action. Records: question / answer — [shapes](/framewor…
- [Follow-up: every task of the last 10 days](/framework/ai/doc/follow-up-full.md) — 1035 tasks, flagged first. Summary: [follow-up.md](follow-up.md). | task | group | session | model | started | last log | step | state buck…
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/doc/readme-before-2026-10-19.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Asks](/framework/ai/asks/readme.md) — Every ask the owner made, who owns it, and whether it landed — the answer to "a lot of tasks are getting kind of left in limbo" (the owner,…
- [The corpus — every page the Router can reach, and how that …](/framework/core/Search/doc/corpus.md) — A search result is a promise: click it and you land on that page. So the corpus is not "every directory on disk" and not "every link anybod…
- [The first message forks; every later one resumes](/framework/ext/Ask/doc/fork.md) — A headless turn must never share a transcript that a human still has open in an interactive terminal — both processes would append to the s…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/15 [Voice mastermind MCP gateway](/framework/ai/sessions/2026/10/15/session-eda55316/) — kind/owner model/sonnet mod/servex mod/ux/dictate task/mastermind-repo-slim servex/voice · $1.28
- 2026/10/15 [Clarity voice mastermind](/framework/ai/sessions/2026/10/15/session-e1a13a37/) — kind/agent model/sonnet mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.25
- 2026/10/14 [Module inbox loop](/framework/ai/sessions/2026/10/14/session-ef693241/) — kind/owner model/sonnet mod/servex mod/server task/mastermind-repo-slim framework/inbox · $1.44
- 2026/10/14 [Dictate-next-4 review](/framework/ai/sessions/2026/10/14/session-eadb28a6/) — kind/agent model/opus mod/ai/sessions task/mastermind-repo-slim framework/ai · $0.83
- 2026/10/14 [Nav-model page with live demos](/framework/ai/sessions/2026/10/14/session-e9f013e5/) — kind/owner model/opus mod/core/page task/mastermind-repo-slim page/catalog · $13.00

## Owner asks
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-10-15 Servex restart plan: a restart must not drop the voice call; a fresh mastermind may answe… (?, noted)
- 2026-09-30 Inbox: priority 50+ only; Log everything; a priority filter; stalled asks readable (task-mastermind-inbox-ext, building)
- 2026-10-15 Servex remote MCP: voice-agent directives in the MCP server instructions + ask_mastermind… (?, queued)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)

## Commits
- 4d897a85d skills: sub-mastermind points to finish-task for the outcome checklist (was a copy); finish-task says who run…
- 949fa35ea skills: every-prompt drops the load-page-skill step that fights its 10-second job and the card_ask text that …
- 1ea84b4ee Feedback council: verify all 48 open asks against the live site
- f6d3b0abb ai2 Live card: a landed task never stays pinned
- c25c5a394 push-to-talk: site-wide push-to-talk dictation + a hotkey manager
- 1c6b89989 Sessions: no duplicate transcripts, date-path seam, Start/Stop/Duration
- f4837f0f9 Echo: fix read_item() missing the new nested wire format
- 545d9e20e Echo: fix read_item() missing the new nested wire format

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,342 tokens of reading, under the 100k limit).

Question: ask_mastermind: every answer always arrives

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "ask_mastermind: every answer always arrives"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
