<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Integration  builds A  B and C on one branch  tested together  NOT merged into michael dev" (words: integration, build, one, branch, tested, together, not, merged, into, michael, dev)

## Tasks (8, best first)
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist
- 2026-10-04 [Land sessions-tab-polish + data-grid: dead worktree servers, one real…](/framework/ai/sessions/2026/10/04/land-two-branches/land-two-branches/) — Both branches landed on michael/dev. sessions-tab-polish (8824068f), data-grid (ac28ba1e). Reviewed: size none, pass — both features were already built and reviewed twice by their own task masterminds; this task's job was landing them. land sessions-tab-polis… · paths 1/1 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-09-28 [Commit the live system: 326 uncommitted files into 12 named commits o…](/framework/ai/sessions/2026/09/29/1a4ab710-89f0-45d1-88ca-1f929880a2d1/commit-live-system/) — Landed — 326 uncommitted files went from git status --short down to about 10-12 (that count keeps moving; other agents are writing live), in 12 commits on michael/dev, none pushed. Groups + reasoning: [groups.md](/framework/ai/2026-09-28/commit-live-system/gr… · paths 1/1 exist
- 2026-10-26 [Agent-name links in chat go to a page that does not exist. ext/Mentio…](/framework/ai/sessions/2026/10/25/session-15fa7f56/mastermind-agent-name-links-resolve/) — Landed on michael/dev (ea637bcb4 + follow-up commit): agent-name links resolve to the agent's real dated task folder through AgentUrl (ai/index.json, no second index); /sessions/<name>/ redirects there; names with no record show 'Session not found'. Opened /s…
- 2026-10-25 [Dictation: why words arrive out of order — fixed on worktree/dictatio…](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/order/) — Fixed, awaiting merge. Step 1 (retag_piece changes the id only) is on michael/dev (ce1f45f58); steps 2-3 (one clock via Session.clock.offset, said_at sent and written, bubbles ordered by said_at ?? at, also on reload) are on worktree/dictation-order-2. A Serv…

## Docs and readmes
- [audio — three building blocks for anything with a microphone](/framework/audio/readme.md) — Three small classes, each a build block: [MicStream](./MicStream/) opens the microphone and hands out its live stream, raw samples, level, …
- [MicStream — opens a microphone, hands out its stream, sampl…](/framework/audio/MicStream/readme.md) — new MicStream() opens one microphone (a device_id, else ux/Dictate's remembered pick, else the system default) and gives everything else in…
- [One stream for the UI, node and the agents: a design (not b…](/framework/core/Item/doc/one-stream.md) — Status: design, 2026-10-22, by the system architect. Building waits: the owner put the full nested-items work behind sessions, tasks and pr…
- [Inbox — one ranked list of what wants the owner's attention…](/framework/core/Page/ext/Inbox/readme.md) — An inbox is a list of rows (notes, questions, landed tasks, cards that wait on the owner) sorted by one number, Inbox.rank. There are two v…
- [Owner notes, 2026-10-16 night: migrating old tasks into the…](/framework/core/Task/doc/owner-2026-10-16-migration.md) — ## The problem Most sessions reliably produce a requirements.md and old-style tasks (session-dir task.jsonl, TaskState index.jsonl, the ai/…
- [DevBar/says.js — history and reasoning](/framework/dev/DevBar/doc/says-notes.md) — ## The Mastermind Log design The owner's direction across five passes on 2026-09-19 — read in order, each one still true, the later ones co…
- [DevBar — a right-docked rail of dev chrome on every page, b…](/framework/dev/DevBar/readme.md) — ## Use js import devbar from "./framework/dev/DevBar/DevBar.js"; // public/app.js — the one caller render(){ …; devbar(this); }, navigated(…
- [Asks about dev: 1 open, 0 done](/framework/dev/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80

## Owner asks
- 2026-09-30 Worktrees: remove merged ones; Servex drops their subdomains (task-mastermind-dormant-idle, building)
- 2026-10-03 finish-task: integrations only where they make sense, each its own commit; costly ones be… (vscode-mastermind, done)
- 2026-10-15 Voice mastermind: answer within seconds every time (best guess or 'looking into it'), han… (?, held)
- 2026-10-18 Worktrees: remove merged ones; Servex drops their subdomains (?, tracked)
- 2026-09-30 Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (task-mastermind-dev-shell, routed)

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Integration: builds A, B and C on one branch, tested together, NOT merged into michael/dev

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Integration: builds A, B and C on one branch, tested together, NOT merged into michael/dev"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
