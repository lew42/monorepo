<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Whisper  a demo that shows the raw stream as objects  basics first  drill down" (words: whisper, demo, show, raw, stream, object, basic, first, drill, down)

## Tasks (8, best first)
- 2026-10-17 [checkup refine+voice: raw Whisper save, Placement, sessions decision](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/checkup-refine-voice/) — Raw Whisper replies saved to the whisper-raw log; Placement built and merged; New session button tested (demo key bug fixed); one rolling session chosen with the button as escape hatch; Servex restart still needed for the lag fix.
- 2026-10-12 [Voice: Echo mirror, To board cards, whisper stream, live clean](/framework/ai/sessions/2026/10/12/session-fb723164/voice-asks-2/) — Four of five voice asks built and live; duplicate-bubbles not reproduced. Details: [STATE](/framework/ai/2026-10-12/voice-asks-2/STATE.md), [Dictate asks](/framework/ux/Dictate/doc/asks.md), [review](/framework/ai/2026-10-12/voice-asks-2/review.md) (3 fixed, …
- 2026-09-30 [audio: three tools, one demo, one dictation widget](/framework/ai/sessions/2026/09/30/108a1b36-ed02-4728-bf82-20d7d7053d85/audio-consolidate/) — audio/ is three tools with one live demo, and one dictation widget runs the sheet, drawer and card pages. [/framework/audio/](/framework/audio/) · [/framework/ux/Dictate/](/framework/ux/Dictate/) · merged 5c1b7d15 ![](minion-audio/demo-live-1920.png) MicStrea… · paths 3/3 exist
- 2026-09-29 [audio/ done: index shows state, Transcriber sizes up top, Dictate/Par…](/framework/ai/sessions/2026/09/29/audio/audio/a-parts/) — Last phase landed (commit 3f155bc7, worktree/qf-6, not merged). ux/Dictate/variants/parts/ — Dictate rebuilt on MicStream + rolling-window Transcriber.Whisper, everything else (revise:, on_text, the log, the caption) inherited. v1 untouched; linked from the v… · paths 3/3 exist
- 2026-09-29 [Round 2: proved the flicker fix, showed cut markers, made ai2's mic a…](/framework/ai/sessions/2026/09/29/audio/audio/b-refine/) — Every ask from the second review round is done. Flicker proof: a real before/after (parent commit vs. this task's fix) shows the caption collapsing to 0px height mid-close BEFORE, never dipping AFTER. Frame strip: shots/flicker-frame-0..3.png Cut markers ('cl… · paths 4/4 exist
- 2026-09-29 [Object views: DefaultView, track(), the Page and App objects live](/framework/ai/sessions/2026/09/29/ca56812f-482f-482c-a2fb-e86ba479353a/item-ui/c-views/) — Landed — DefaultView, track(), and two real live object pages (Phase 2, deliverables 6–9 of item-ui). view(thing) draws any object as a click-to-expand item tree (ux/Content/Object/DefaultView.js); a class overrides it with its own Thing.View, shown side by s… · paths 4/5 exist, gone: framework/ux/Content/Object/doc/default-view/
- 2026-09-29 [Clean transcription mode: the composer's box shows tidied text, raw s…](/framework/ai/sessions/2026/09/29/audio/audio/next-clean-transcription/a-clean-mode/) — Clean transcription mode shipped in AI 2's composer — proof: shots/2..4 (a raw filler-heavy sentence typed in, cleaned in place, dug back with the raw toggle), shots/5-6 (playground's new Clean tab). clean mode is the composer's default: ai2/compose.js now se… · paths 3/3 exist
- 2026-10-20 [whisper-demo](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/requirements.md

## Modules that exist now (files outside the module that import it)
- [ext/demo](/framework/ext/demo/) — used by 62 files
- [ext/drawer](/framework/ext/drawer/) — used by 16 files
- [ext/Dropdown](/framework/ext/Dropdown/) — used by 5 files
- [ext/markdown](/framework/ext/markdown/) — used by 55 files
- [ext/sprawl](/framework/ext/sprawl/) — used by 1 files
- [ux/Objects](/framework/ux/Objects/) — used by 2 files

## Docs and readmes
- [Is the raw Whisper reply saved? (checked 2026-10-17)](/framework/audio/Whisper/doc/raw-log.md) — Short answer: before this change, no — except on one demo page. The owner's guess was right. ## What was saved - The sentence that is sent …
- [demo — show the code and run it from one source; the site's…](/framework/ext/demo/readme.md) — ## Index [shell](./shell/) — the page.demo() shell that every demo page on the site wears ## Use js import { demo } from "/app.js"; import …
- [Dropdown architecture — a trigger that shows its choice, an…](/framework/ext/Dropdown/doc/architecture.md) — Dropdown is one choice out of a short list: a button that shows the current option's picture and name, and a [popover] list that opens abov…
- [Dropdown — one choice out of a list: a trigger showing its …](/framework/ext/Dropdown/readme.md) — ## Use js import dropdown from "/framework/ext/Dropdown/dropdown.js"; dropdown({ options: [{ value: "flex", label: "flex", icon: "view_colu…
- [log — how objects write down what they do (ideas, not built)](/framework/log/readme.md) — The owner's direction (2026-10-05, dictated; the session page of VS Code tab 60d9def6 has the full words): any object can log anything, and…
- [Object — show a real object instead of explaining it](/framework/ux/Content/Object/readme.md) — Three ways in, all from one real object, a class, or a class instance: - object() (Object.js) — one small card: icon, class name, name = va…
- [Page storage and streaming — one line in a file, one redraw…](/framework/core/Page/doc/streaming.md) — A page keeps its data in plain text files inside its own folder. Anything can add a line to one of those files, and every open browser tab …
- [Refine — speak one prompt and watch it refine (raw → clean …](/framework/ext/Refine/readme.md) — Also here: the refine queue — every past owner prompt becomes a refined card on its session page's Coverage tab ([doc/refine-queue.md](doc/…

## Sessions tagged with these words
- 2026/10/15 [Live cards](/framework/ai/sessions/2026/10/15/session-b14b29a8/) — kind/owner model/sonnet mod/ext/markdown task/live-cards page/live-cards · $3.09
- 2026/10/15 [Live stream cards not updating in browser](/framework/ai/sessions/2026/10/15/session-1ca12342/) — kind/owner model/sonnet task/live-stream page/live-cards · $1.14
- 2026/10/14 [Figma Claude designs kit demo](/framework/ai/sessions/2026/10/14/session-c3c905da/) — kind/owner model/sonnet mod/ai/sessions task/figma-claude-designs page/demo · $2.29
- 2026/10/14 [Figma Claude designs kit demo](/framework/ai/sessions/2026/10/14/session-6fd116b6/) — kind/owner model/sonnet work/read-only task/figma-claude-designs page/demo · $2.07
- 2026/10/13 [Ext/Dropdown architecture](/framework/ai/sessions/2026/10/13/session-dc95c123/) — kind/agent model/haiku mod/ext/dropdown task/mastermind-repo-slim framework/tasks · $0.17
- 2026/10/13 [Page rendering architecture](/framework/ai/sessions/2026/10/13/session-c518b85d/) — kind/owner model/sonnet mod/core/page task/mastermind-repo-slim page/demo · $0.86

## Owner asks
- 2026-09-30 Selection: tap to select and drill down on mobile; the AI knows the element (servex-mastermind-opus (spawn after the 4:50 PM reset), queued)
- 2026-10-12 Pages as live streamed parts; each page shows its own tasks (asked 9x) (mastermind-page-ai-api, routed)
- 2026-10-18 Selection: tap to select and drill down on mobile; the AI knows the element (?, tracked)
- 2026-10-03 Drawer: tight header, one scroll area, composer footer flush with default padding (task-mastermind-drawer-cleanup, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)

## Commits
- 8b76ccc71 Fix round 2, Part Y: loading strip on the Overview, page_work() walks the real page tree

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,342 tokens of reading, under the 100k limit).

Question: Whisper: a demo that shows the raw stream as objects, basics first, drill down

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Whisper: a demo that shows the raw stream as objects, basics first, drill down"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
