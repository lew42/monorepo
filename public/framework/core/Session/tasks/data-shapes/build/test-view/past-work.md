<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Build H  watch a class s test run  drawn in the default view  from the integration branch  NOT merged" (words: build, watch, clas, test, run, drawn, default, view, integration, branch, not, merged)

## Tasks (8, best first)
- 2026-10-16 [Salvage: unmerged branch audit, dup-bubbles already on dev](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/) — Audit done; nothing needed merging. [audit.md](/framework/ai/sessions/2026/10/16/voice-20261016/salvage/audit.md) Audit every branch: 422 checked, 239 fully merged, 183 ahead, 75 pure noise (listed, nothing deleted) Top 5 for a human look: page-extends-item, …
- 2026-10-12 [Dictate: merged transcription asks, two small builds](/framework/ai/sessions/2026/10/12/session-d2954950/asks-transcription/) — Merged asks doc: [Transcription asks](/framework/ux/Dictate/doc/asks.md), 19 clusters (7 open, 4 partly, 8 done), linked from the [Dictate readme](/framework/ux/Dictate/). Two small builds: Refine keeps the latest 19,000 characters of a long prompt; the voice… · paths 1/1 exist
- 2026-10-03 [Content rows: a row can BE a page reference, drawn as its dark class …](/framework/ai/sessions/2026/10/03/list-events/ref-content-rows/) — Landed: a content row with ref draws as that page's own dark class card (#Mention's exact look, reused), linking to it, with the row's own text under it. the look + link: proven live on the Now card's new "Page" row text under the card: same row, same screens… · paths 1/1 exist
- 2026-10-25 [Build the session switcher in the dictate widget (also the mobile she…](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-session-switcher/) — Round 2 landed: owner live-testing found the dropdown reflowed the header (huge in-flow list pushed the title/chips/v2-chip down, "vertically centered" on desktop). Rebuilt session_switcher() on ux/Popover.menu() (top-layer popover, built-in height cap + scro…
- 2026-10-03 [ext/Mention: refs.js auto-syncs its icon, no sync.mjs run needed](/framework/ai/sessions/2026/10/03/list-events/mention-auto-sync/) — Landed: ext/Mention/maps/refs.js's icon rebuilds itself. [Server/plugins/MentionSync.js](/framework/servex/fs/?file=Server) sits on the dev server's shared watcher and rewrites a changed icon on its own — proved live by flipping core/Sidebar/page.js's icon an… · paths 2/3 exist, gone: framework/ext/Mention/md/doc/syntax/
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/
- 2026-10-01 [Voice: a new text-to-speech class, the fourth audio/ building block](/framework/ai/sessions/2026/10/01/voice-tts/voice-tts/) — What landed: Voice — text to speech, the output half of the mic pair Transcriber is the input half of — as the owner asked, named Voice, scoped as the fourth sibling in public/framework/audio/ next to MicStream/Recorder/Transcriber, same plain-model + static-… · paths 5/5 exist
- 2026-10-01 [llama-server as a local model provider: chat page, test ladder, two f…](/framework/ai/sessions/2026/09/24/servex-mastermind-opus/local-ai/build/) — Servex runs a model on this machine's own GPU — proven with real replies, not just wired up. start/stop/swap one llama-server model, idle unload: Servex/ext/local/llama.js a local provider for the SDK (local/<slug>): Servex/ext/local/provider.js, Agents.js, t… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Test](/framework/core/Test/) — used by 0 files
- [core/View](/framework/core/View/) — used by 323 files
- [ext/Classify](/framework/ext/Classify/) — used by 1 files

## Docs and readmes
- [Proposal (not built): re-run a page when its files change, …](/framework/ext/ErrorLog/doc/page-watcher.md) — The owner, 2026-10-24: errors are logged per page and per module, so we know the moment one happens, and the goal is pages with zero errors…
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/doc/readme-before-2026-10-19.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [The full-window view — a url, not a class](/framework/styles/layouts/doc/full-view.md) — Split out of readme.md. ## 3. "Maximize", with a router that only knows path segments Question. A layout wants to be seen without a docs co…
- [Draggable architecture — grab a View, hit-test the registry…](/framework/ext/Draggable/doc/architecture.md) — Draggable is grab-and-move for any View; Sortable reorders a collection, across lists and into nested containers, on the same code path. En…
- [is — fifteen one-line type checks, all booleans, so View.ap…](/framework/util/is/readme.md) — ## Use js import { is } from "/app.js"; // or: import is from "/framework/util/is/is.js"; if (is.pojo(arg)) // named children else if (is.a…
- [Catalog — every page with a demo as a live preview, plus ev…](/framework/catalog/readme.md) — Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones ma…
- [Objects — object-oriented design: every class ships a view …](/framework/code/objects/readme.md) — "I want to see as much of the data as possible to start trying to understand the internal workings" (the owner, 2026-09-29). A class here i…
- [Page.class.js — design notes](/framework/core/new/doc/notes.md) — ## Pages without filesystem overview A node: a url, some content, and children declared EITHER way — eager (imported with me) or lazy (impo…

## Sessions tagged with these words
- 2026/10/16 [Voice session review and refinement](/framework/ai/sessions/2026/10/16/session-da50b6af/) — kind/agent model/opus work/read-only task/refine-build · $0.89
- 2026/10/16 [Refine build](/framework/ai/sessions/2026/10/16/session-88b55b09/) — kind/owner model/sonnet mod/ext/refine task/refine-build framework/refine · $6.80
- 2026/10/15 [Class map page system](/framework/ai/sessions/2026/10/15/session-c6902aa6/) — kind/agent model/sonnet work/read-only task/page-system docs/classes · $0.14
- 2026/10/15 [Page system class map documentation](/framework/ai/sessions/2026/10/15/session-09f3c4b6/) — kind/owner model/sonnet task/page-system docs/classes · $0.38
- 2026/10/14 [Clarity architecture](/framework/ai/sessions/2026/10/14/session-b38b6926/) — kind/agent model/sonnet work/read-only task/mastermind-repo-slim docs/classes · $0.14
- 2026/10/13 [Core view architecture documentation](/framework/ai/sessions/2026/10/13/session-84fff8e8/) — kind/agent model/haiku mod/core/view task/mastermind-repo-slim docs/architecture · $0.29

## Owner asks
- 2026-09-30 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (mastermind-servex (next instance; spawn at the 10 PM reset), queued)
- 2026-10-13 Proposals: a Proposal class; review, decide, becomes a task; node-led loop; impact-weight… (?, queued)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, landed)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)

## Commits
- 705069662 ext/Mention: refs.js icon rebuilds itself — Server/plugins/MentionSync.js
- 4444b3b5e AI 2: finish the Needs you tab, the Needs review rail filter, and Reviewed control

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 44,327 tokens of reading, under the 100k limit).

Question: Build H: watch a class's test run, drawn in the default view, from the integration branch, NOT merged

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Build H: watch a class's test run, drawn in the default view, from the integration branch, NOT merged"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
