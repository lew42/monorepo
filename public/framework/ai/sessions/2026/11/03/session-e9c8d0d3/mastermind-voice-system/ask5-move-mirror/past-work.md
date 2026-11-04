<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Ask 5 6  a move must reach the chat screen as one line  and never split the owner s bubble" (words: ask, move, must, reach, chat, screen, one, line, never, split, owner, bubble)

## Tasks (8, best first)
- 2026-11-02 [Chat V1.2 scroll fix, Recite controls on tapped bubble only, V3 brain…](/framework/ai/sessions/2026/11/02/spawned/mastermind-v1-2-scroll-fix/) — Merged to michael/dev (eea72a24f). [Chat V1.2](/framework/ext/Chat/v1-2/) log scrolls: no more 30vh cap (max-height none; measured at 360x740) [Recite](/framework/audio/Recite/) control shows only on the tapped or playing bubble (test 43/43) [Chat V3](/framew… · paths 3/3 exist
- 2026-11-03 [Budget: $3. Load the minion skill first. Investigate only, read-only,…](/framework/ai/sessions/2026/11/03/session-f5eadae9/minion-mingled-chat/) — (no outcome logged)
- 2026-11-02 [Owner's ask, polished: In Chat v3 (public/framework/ext/Chat/v3, Chat…](/framework/ai/sessions/2026/11/02/session-00f6d159/mastermind-chatv3-remove-brain/) — (no outcome logged)
- 2026-10-20 [Sessions and tasks: the shape decided, the store on one Dated class, …](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/) — One session.jsonl per origin, tasks as lines, projects as folders; sessions and projects on one Dated class with a streamed index and a query; the voice door, the Whisper demo and the phone sheet fixed. fix and document sessions vs tasks: [ai readme](/framewo… · paths 3/3 exist
- 2026-10-14 [Voice chat can ask the mastermind: one tool, one token, a free tunnel](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-connector/) — The Claude app can now call one tool, ask_mastermind, that reaches the mastermind (Servex/ext/remote/RemoteMCP.js, Server/Tunnel.mjs). Curl-tested: no token is refused, the tool list has one tool, a question round-trips, and through the tunnel every other pat… · paths 0/1 exist, gone: framework/ux/Dictate/doc/voice-bridge
- 2026-10-20 [ask_mastermind: late answers reach updates; wait:false ticket](/framework/ai/sessions/2026/10/20/voice-20261020/async-ask/) — ask_mastermind no longer loses an answer. When the one-minute wait ends (timeout or cancelled call) RemoteMCP.ask() keeps watching the reply file for 30 minutes and puts the answer in the voice-app inbox (from: voice-mastermind, reply_to = question id) plus i…
- 2026-10-04 [Dictate round 2: mic-abort reload race, no mid-pause beeps, capped bo…](/framework/ai/sessions/2026/10/05/dictate-fixes-2/dictate-fixes-2/) — All five asks landed on michael/dev, proven headless and reviewed ([review.md](review.md): 1 fixed, 2 noted). reload's mic-abort race fixed: [Dictate.js](/framework/ux/Dictate/Dictate.js) retries once on AbortError. no mid-pause beeps: [Mic.js](/framework/ext… · paths 3/3 exist
- 2026-10-04 [Dictate: four owner-visible fixes — quad bubble, mic abort, instant s…](/framework/ai/sessions/2026/10/05/dictate-fixes/dictate-fixes/) — All four owner fixes landed on michael/dev (80cb509e, b4d31f83, 4cf347ad). Review: reviewed: 1 fixed, 3 noted — [review.md](review.md). Follow-ups it flagged (abort race untraced, a fast repeat silently drops, two "landed" checks) are in [decisions.md](/frame… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Task](/framework/core/Task/) — used by 792 files
- [core/tasks](/framework/core/tasks/) — used by 5 files, no readme
- [ext/AITask](/framework/ext/AITask/) — used by 5 files
- [ext/Ask](/framework/ext/Ask/) — used by 42 files
- [ext/Chat](/framework/ext/Chat/) — used by 16 files
- [ext/tasks](/framework/ext/tasks/) — used by 5 files, no readme

## Docs and readmes
- [Duplicate text in one chat bubble](/framework/ext/Chat/doc/duplicate-bubbles.md) — Symptom (owner, 2026-10-09): one bubble, one icon, the same line twice (up to four times): the first copy ends in a green ✓, the next ones …
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Phantom gate — a Whisper hallucination never reaches the ch…](/framework/ux/Dictate/doc/phantom-gate.md) — A stock Whisper hallucination ("Thank you.", "you"…) used to still post to the session: audio/Recite/BargeIn's owner_spoke() could stop it …
- [Projects: a folder with project.jsonl, moved into its modul…](/framework/ai/tasks/doc/projects.md) — A task is a line in its session's log. A project is a task with subtasks, requirements or a review, so it gets a folder holding project.jso…
- [Page.class.js comment blocks: what to do with each (DONE 20…](/framework/core/Page/doc/comment-plan.md) — Rule (owner, 2026-10-12): a comment is a pointer, not an essay: one line where the code would surprise, ideally pointing at a doc; history …
- [Chat V1.2: V1 drawn from session.messages, with a send curs…](/framework/ext/Chat/v1-2/readme.md) — V1.2 is V1 (../Chat.js, the bubbles you already know) fed from session.messages ([core/Session/Chat](/framework/core/Session/Chat/readme.md…
- [Echo and turn-taking: the assistant's voice must never beco…](/framework/ux/Dictate/doc/echo-and-turn-taking.md) — The problem. The read-aloud voice (Recite) leaks from the speakers into the mic, Whisper transcribes it, and it is sent as the owner's sent…
- [How a chat is made: mic to screen](/framework/ux/Dictate/doc/pipeline.md) — The whole path of one spoken sentence, with the file that does each step. Line numbers were read from the code on 2026-10-25; if one has dr…

## Sessions tagged with these words
- 2026/10/15 [Usage pace line](/framework/ai/sessions/2026/10/15/session-8f866486/) — kind/owner model/sonnet work/read-only task/usage-pace-line framework/ai · $0.34
- 2026/10/13 [Bubble-order fix and Refine mic source](/framework/ai/sessions/2026/10/13/session-8066bc31/) — kind/owner model/sonnet mod/ext/chat mod/ai/sessions task/mastermind-repo-slim page/ai-sessions · $2.31
- 2026/10/13 [Architecture documentation for ext/Chat](/framework/ai/sessions/2026/10/13/session-61d11498/) — kind/owner model/haiku mod/ext/chat task/mastermind-repo-slim docs/architecture · $0.26
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)

## Commits
- 13602e6f4 ask2b-newest-first round 4: skip_stale must not cut a reply already under way
- 6a7a7ed8e item_tool test: failing test, it must leave the real task-moves.jsonl byte-identical Co-Authored-By: Claude O…
- c1e352aa0 sessions: real token-based cost attempt surfaces a second cost-metering symptom; tighten regex; move detail t…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,895 tokens of reading, under the 100k limit).

Question: Ask 5/6: a move must reach the chat screen as one line, and never split the owner's bubble

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Ask 5/6: a move must reach the chat screen as one line, and never split the owner's bubble"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
