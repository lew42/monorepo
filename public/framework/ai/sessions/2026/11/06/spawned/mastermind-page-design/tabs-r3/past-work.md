<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "The  live  demos become live pages  header  breadcrumb  gear  no Files button" (words: live, demo, become, header, breadcrumb, gear, fil, button)

## Tasks (8, best first)
- 2026-10-20 [Whisper page: one live demo of every Whisper answer](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — [The Whisper page](/framework/audio/Whisper/) is one demo: each Whisper answer arrives as a row, guesses amend themselves, the final replaces them. Merged 4ccb14de3. ![](shots/4-max-1200.png) live object log, real dictation: fake-mic run, 6 guesses → 1 final … · paths 2/2 exist
- 2026-10-15 [live: /live/ becomes a feed of preview cards](/framework/ai/sessions/2026/10/16/voice-20261016/live-feed/) — live: /live/ becomes a feed of preview cards — closed out by mastermind-task-closeout: the task's own log says it finished and names its commit, but no landing line was written. Cost $0.55 (session 132c71e9). The log has the details.
- 2026-10-03 [Hotkeys: a flat, filterable, rebindable hotkey manager (key or mouse …](/framework/ai/sessions/2026/10/03/push-to-talk/push-to-talk/hotkeys-module/) — ux/Hotkeys built — a tiny, site-wide hotkey manager. Live: [/framework/ux/Hotkeys/](/framework/ux/Hotkeys/). one place, filterable, rebindable — hotkeys_section(): filter box + one row per action + "press a key or button…" a mouse button is a first-class bind… · paths 1/2 exist, gone: framework/ux/Hotkeys/doc/decisions/
- 2026-10-01 [The Dictate page becomes the workbench: chat() demo, keep option, int…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-workbench/) — The main Dictate demo is now a real, answered chat() mount — the same call every surface uses. item 1 — demo is a chat() mount, Widget options (level/source/debug) pass through: shot dictate-demo-1920.png item 2 — keep option added (true = global ✦ session, f… · paths 1/2 exist, gone: framework/ux/Dictate/doc/chat/
- 2026-11-06 [Page features from voice: tabs, columns, place, nav, previews — prove…](/framework/ai/sessions/2026/11/06/spawned/mastermind-page-design/page-features/) — What landed — Each of the 5 features tried live under [/live/demos/](/live/demos/), once as a LivePage sub-page and once as a plain Page: tabs: works on plain Page, broken on LivePage — [tabs-page](/live/demos/tabs-page/) vs [tabs](/live/demos/tabs/) columns:…
- 2026-10-16 [live-pointers: /live cards become pointers; their data moves to the l…](/framework/ai/sessions/2026/10/16/voice-20261016/live-pointers/) — The work landed as b9cf153f8 (its own log line says so; the landing line was never written because the agent was stopped): refine-build and overnight data in their task logs, ai/audits/index.jsonl + readme linked from ai/readme.md, transcripts line in past-wo…
- 2026-10-13 [Voice: Echo and the Refine buttons share one call](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-dedupe/) — Echo now calls run_refine, the same function the Refine buttons use. Echo and buttons share run_refine (9b25b1a80) ext/Ask/chat.js kept: about 15 importers conversation stores: the SDK session file is the record, decision on surfaces.md Dev shell chat tab tra…
- 2026-10-13 [Sessions page: compact header, scope filters, left rail](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sessions-page-layout/) — Sessions page layout landed. first row higher: y 464 → 270–370 at 1200, shot shots/sessions/1200.png footer a status line: ~125 px → ~50 px, same shot left padding + inbox link: gutter matched, link gone year/month/day scope, month default, newest first: ?sco…

## Modules that exist now (files outside the module that import it)
- [ext/demo](/framework/ext/demo/) — used by 62 files
- [ext/files](/framework/ext/files/) — used by 24 files
- [ext/filesystem](/framework/ext/filesystem/) — used by 32 files
- [ux/Filter](/framework/ux/Filter/) — used by 4 files

## Docs and readmes
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [Page overview demos — fifteen live Page trees, one director…](/framework/core/Page/old/overview/readme.md) — ## Use js /framework/core/Page/old/overview/<name>/page.js import { Page, demo, md } from "/app.js"; const hello = () => new Page({ title: …
- [Research architecture — append-only files, validated in cod…](/framework/ext/Research/doc/architecture.md) — Research lets several minions dig a question into append-only log files that a page renders as they grow. Two shapes share one module: a to…
- [Lab — small browser-feature experiments, each a live demo p…](/framework/lab/readme.md) — ## Index - [PWA and notifications: state today](doc/pwa-state.md) — what works, proven; [next steps](doc/next.md) - [notifications](notific…
- [Panel2 — standard shipping UI container: header toolbar, ma…](/framework/ext/panel2/readme.md) — A production layout container for shipping interfaces (unlike ext/Panel which is for wireframing). Header acts as a toolbar, main holds con…
- [Research — a question dug by several minions into append-on…](/framework/ext/Research/readme.md) — Two shapes, one module. A topic is one question argued to a verdict, then closed. A program is several subjects dug continuously and never …
- [Review questions — every question a fresh reviewer asks, pe…](/framework/ai/review/readme.md) — The review skill asks nine systems of questions, in order: requirements, page structure, navigation, layout, sizing, wrapping, spacing and …
- [Tasks — what is in flight, queued and landed, live](/framework/ai/tasks/doc/readme-before-2026-10-19.md) — See it: [/framework/ai/tasks/](/framework/ai/tasks/). It is no list of its own: it opens the Inbox ([/framework/ai/](/framework/ai/)) with …

## Sessions tagged with these words
- 2026/10/15 [Clarity live post](/framework/ai/sessions/2026/10/15/session-e9ea50e3/) — kind/agent model/sonnet work/read-only task/live-post page/live-cards · $0.14
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Live today voice feed](/framework/ai/sessions/2026/10/15/session-8f02ad12/) — kind/owner model/sonnet task/live-today page/live-cards · $1.20
- 2026/10/15 [Live-post helper agent](/framework/ai/sessions/2026/10/15/session-8853d8d6/) — kind/owner model/sonnet task/live-post page/live-cards · $0.98
- 2026/10/15 [Live post review](/framework/ai/sessions/2026/10/15/session-4a77ddf9/) — kind/agent model/sonnet mod/ai/sessions task/live-post page/live-cards · $0.23
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22

## Owner asks
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, building)
- 2026-09-30 Audio: six tools become three, one live demo (task-mastermind-audio-consolidate, landed)
- 2026-09-30 Icons: frames, buttons, rails, icon items aligned (task-mastermind-icon-system, building)
- 2026-09-30 Mentions: @Page becomes an icon link everywhere (task-mastermind-mentions, building)
- 2026-09-30 Shell: header, sidebars, footer; the dark dev shell on Ctrl+\ (task-mastermind-dev-shell, routed)

## Commits
- 3b1e344db4 drawer-chat: one AI tab, a clear session header, and a real composer panel
- 252ae82add Dictate composer: one action row, guess/error above it, plain New-session note
- 6c4d92f6aa Dictate page becomes the workbench: chat() demo, keep option, shared New session button, composer redesign
- 6c034bc46c AI 2's rail becomes a class: InboxRail (core/Page/ext/Inbox) + AIRail (ai2/rail.js), CSS into ux/Inbox
- 60595fee93 Paging goes straight into the demo: the stage starts 200px higher, the toolbars page becomes live arrangemen…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,988 tokens of reading, under the 100k limit).

Question: The /live/ demos become live pages: header, breadcrumb, gear, no Files button

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "The /live/ demos become live pages: header, breadcrumb, gear, no Files button"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
