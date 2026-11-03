<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Session page  fit a phone  stats bar and tab row " (words: session, fit, phone, stat, bar, tab, row)

## Tasks (8, best first)
- 2026-10-13 [ext/drawer: the phone sheet's full state is the sidebar's tabs](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/dictate-sheet/) — The sheet's full state mounts the drawer tab row and body under the chat; mic keeps listening; mic-proof passes; merged 6441b0642 (change 4cb0adf91). 400 px shots only; 1200/1920/3440 layout-check not run.
- 2026-10-25 [Sessions: real span and active time; the VS Code tab row recognisable](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/running-for/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/running-for/requirements.md
- 2026-10-24 [Session page on desktop, from the Figma session frames](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/session-desktop/) — A session's page on desktop follows the Figma session frames (bands E and F) and reuses the phone version's rows (54842b802). a sticky stats bar: cost from the item tool, model, running for, done X of Y ([shot](shots/1920.png)) tabs Overview · Tasks · Chat; o…
- 2026-10-23 [Sessions: phone pages, as the mobile variant](/framework/ai/sessions/tasks/code-the-approved-mobile-picks-as-routed/) — Four phone pages, ready to merge (branch worktree/mobile-picks, 11 commits, today's dev merged in, merges cleanly; the merge is yours). four pages at 400 px, real data, tap through: day-400.png, session-400.png, task-400.png children nested under their parent…
- 2026-10-20 [Tab session record: tab folders get session.jsonl and their prompts](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tab-session-record/) — Scope cut to the SessionStart hook only (owner: DRY). prompt-relay.mjs, Echo.js, DayPromptsRefine.mjs and context-loss.md are back to their earlier versions; .claude/hooks/session-page.mjs still writes session.jsonl line 1 once; the sessions readme row says s…
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist
- 2026-10-12 [Sessions: rows come from a node query, not every file](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/) — Sessions now asks node for the rows it shows — default on the dev socket; ?source=files keeps the old path. node holds the data, socket query API: [ext/Query](/framework/ext/Query/), 30–40 ms per query client gets only what it shows: heap 33 → 17 MB, socket 9… · paths 1/1 exist

## Modules that exist now (files outside the module that import it)
- [core/Session](/framework/core/Session/) — used by 15 files
- [core/Sidebar](/framework/core/Sidebar/) — used by 22 files
- [ext/Session](/framework/ext/Session/) — used by 11 files
- [ext/tabs](/framework/ext/tabs/) — used by 37 files
- [ui/row](/framework/ui/row/) — used by 7 files
- [ui/stats](/framework/ui/stats/) — used by 26 files

## Docs and readmes
- [Next: make the phone sheet the sidebar's collapsed form (br…](/framework/ux/Dictate/doc/next.md) — Owner's design: on mobile a small sheet holds only the transcribe button and the text area, resizable; expanded, it becomes the whole sideb…
- [Claim — a tab claimed by an agent: a ring around the viewpo…](/framework/dev/Claim/readme.md) — ## Use mcp__site__claim tab: "3e83f2c0", note: "<task-slug>" — ring the tab you drive mcp__site__release tab: "3e83f2c0" — when the task la…
- [The chat tab, the path bar, and the mastermind log — 2026-0…](/framework/dev/DevBar/doc/chat.md) — ⚠ STATUS after the 23:16 reset (ai/sessions/2026/09/19/reset-recovery/): the path bar and the mastermind log below are live again; the chat…
- [Refine queue — the owner's past prompts, refined one at a t…](/framework/ext/Refine/doc/refine-queue.md) — The owner dictates long prompts; an agent condensing one can drop a specific suggestion. The refine queue turns every past owner prompt int…
- [Dev — the local-only tier: live reload, the DevBar rail, ta…](/framework/dev/readme.md) — ## Index [Claim](./Claim/) — a ring and label around a browser tab an agent has claimed, so you can see which tab is theirs [DevBar](./DevB…
- [Session architecture — the browser is a thin client, Servex…](/framework/ext/Session/doc/architecture.md) — ext/Session is the browser half of a voice session: one ✦ press is one session, and its whole conversation is one JSONL file that Servex wr…
- [item architecture — one row, markup only, the browser holds…](/framework/ui/item/doc/architecture.md) — ui/item is one function and one CSS class. item() in [item.js](../item.js) draws a row: an optional icon, a name, and an optional right-sid…
- [Try it on your phone — voice to session page](/framework/ux/Dictate/doc/try-it.md) — You talk (or type); five stages appear live on a page, one under another. That page is the feedback loop. ## Steps 1. On the phone, open ht…

## Sessions tagged with these words
- 2026/10/20 [Ultracode](/framework/ai/sessions/2026/10/20/session-730e8a7b/) — kind/owner mod/ai/sessions mod/.claude/skills/voice-mastermind framework/digest · $646.14
- 2026/10/17 [Voice mastermind Opus session](/framework/ai/sessions/2026/10/17/session-0368b7c5/) — kind/owner model/opus mod/ai/sessions task/voice-opus servex/voice · $20.90
- 2026/10/16 [Owner check: voice session 2026-10-16 items](/framework/ai/sessions/2026/10/16/session-4a4fea68/) — kind/agent model/sonnet mod/ai/sessions task/owner-words.md framework/sessions · $0.27
- 2026/10/16 [Voice session 2026-10-16](/framework/ai/sessions/2026/10/16/session-24f68eac/) — kind/owner model/opus mod/ai/sessions task/voice-20261016 servex/voice · $18.12
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Past-work-map session directory logs](/framework/ai/sessions/2026/10/15/session-e5f06b7c/) — kind/owner model/sonnet mod/ai/sessions task/past-work-map · $0.53

## Owner asks
- 2026-10-02 ext/panel2 (header toolbar, main with sides, footer) + AI dashboard: Sessions view (every… (task-mastermind-panel2-sessions, building)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)
- 2026-09-30 Agents never take over the owner's tabs (mastermind-servex-8, landed)
- 2026-09-30 AI 2 tab leak: pollers pause while hidden (minion-ai2-soak, landed)
- 2026-09-30 Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (task-mastermind-dev-shell, routed)

## Commits
- 87a6ff21d sessions: phone grid fits the screen

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,853 tokens of reading, under the 100k limit).

Question: Session page: fit a phone (stats bar and tab row)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Session page: fit a phone (stats bar and tab row)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
