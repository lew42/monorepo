<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "One spoken sentence  end to end  a walkthrough note " (words: one, spoken, sentence, end, walkthrough, note)

## Tasks (8, best first)
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist
- 2026-10-17 [Phone sheet: one big mic that says its state, a Type button, no Send](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/sheet-controls/) — The phone sheet has the fewer-controls dictation bar. One big mic whose word is the engine's state, a Type button, no Send. [The bar](/framework/ux/Dictate/doc/refine-dictate-tasks.md) · [Dictate](/framework/ux/Dictate/) big mic says its state: DictationBar, … · paths 1/1 exist
- 2026-10-17 [Voice: one assistant places each sentence as you talk](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-assistant-plan/) — Your words stay where you said them; each sentence can be placed by one line. Plan: [voice-assistant.md](/framework/ux/Dictate/doc/voice-assistant.md). Review: reviewed: pass, 7 notes answered ([review.md](review.md)). plan first, with ask 1 answered: the pla…
- 2026-10-13 [How a page renders: one plain doc under core/Page, linked from the re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/page-rendering/) — core/Page/doc/how-a-page-renders.md answers the owner's question (classes + helpers write the DOM; page.jsonl deltas replay into blocks on top), linked from the Page and framework readmes (7e3c10b23). Landed by the mastermind from the agent's own answer and t…
- 2026-10-12 [Refine: Haiku by default, one chat input, live refine while you talk](/framework/ai/sessions/2026/10/12/session-cca8d997/refine-haiku-live/) — Refine runs on Haiku, the outline grows while you talk, and every chat area uses one input. Clean + refine on Haiku, OpenRouter only by the switch: RefineCall.model(); write openrouter in session-backend.txt to flip ([models.md](/framework/ai/doc/models.md)) … · paths 1/1 exist
- 2026-10-12 [Owner inbox: one owner_note path pinned to the top](/framework/ai/sessions/2026/10/12/session-d2fd8fab/owner-inbox/) — owner_note landed. Agents now tell the owner through one tool; the note sits first in the AI Inbox until the owner opens it. note reaches the owner and stays: score 100, no decay, first row; headless at 400/1200/1920/3440, no errors ([STATE.md](/framework/ai/…
- 2026-10-04 [Dictate: four owner-visible fixes — quad bubble, mic abort, instant s…](/framework/ai/sessions/2026/10/05/dictate-fixes/dictate-fixes/) — All four owner fixes landed on michael/dev (80cb509e, b4d31f83, 4cf347ad). Review: reviewed: 1 fixed, 3 noted — [review.md](review.md). Follow-ups it flagged (abort race untraced, a fast repeat silently drops, two "landed" checks) are in [decisions.md](/frame… · paths 2/2 exist
- 2026-10-01 [One widget: the demo and the sheet build the identical chat() call; a…](/framework/ai/sessions/2026/09/30/one-dictation/one-dictation/minion-onewidget/) — The Dictate page's demo and the ✦ sheet now build the exact same chat() call — only keep differs — and autosend after a pause is the only way a sentence goes out, everywhere. item 2, "one widget": ux/Dictate/page.js's demo_mount() is now chat($slot.el, {place… · paths 1/3 exist, gone: framework/ux/Dictate/doc/chat/ framework/ux/Dictate/doc/decisions/

## Docs and readmes
- [framework/audit — the 2026-08-15 doc audit: one report per …](/framework/audit/readme.md) — ## Use Start at [Priorities](/framework/audit/overview/priorities/). A module's report is doc/<core|ext|dev>-<Name>.md, served as the Docs …
- [Inbox — one class, two views: a page's rail, and its small …](/framework/core/Page/ext/Inbox/readme.md) — The rail is a [Browse](/framework/ux/Browse/) (2026-10-14): Inbox.Rail extends Browse, the one list-and-detail view the Inbox and Sessions …
- [ErrorLog architecture — one static class appends errors and…](/framework/ext/ErrorLog/doc/architecture.md) — ErrorLog turns an error on the page into one log line a session can follow. Entry: [ErrorLog.js](../ErrorLog.js). The error and a state sna…
- [The voice assistant: one assistant places each sentence as …](/framework/ux/Dictate/doc/voice-assistant.md) — What it is. One plain assistant, the voice assistant, listens to a voice session. Each time you finish a sentence, your words are already s…
- [AITask — the AI working log, rendered: one task's page, a d…](/framework/ai/AITask/readme.md) — ## Use - Moved verbatim to [doc/api.md](./doc/api.md): the API. - The Session tab is a chat: talk in the stream, every tool call folded to …
- [Templates — one layout, rendered many times, bound to live …](/framework/core/Page/doc/templates.md) — A template is a page that knows one layout and can draw it as many times as you like, each time with its own data. Instead of hand-building…
- [Markdown architecture — markdown is a View addon, parsed by…](/framework/ext/markdown/doc/architecture.md) — ext/markdown turns markdown into Views. It is not a class tree: it patches View.prototype.md and exports a md() factory, so any page can wr…
- [Research — a question dug by several minions into append-on…](/framework/ext/Research/readme.md) — Two shapes, one module. A topic is one question argued to a verdict, then closed. A program is several subjects dug continuously and never …

## Sessions tagged with these words
- 2026/10/15 [Minion handoff messages visibility](/framework/ai/sessions/2026/10/15/session-cce1ac2c/) — kind/owner model/haiku mod/ai/sessions task/loose-ends · $0.53
- 2026/10/15 [AI system requirements review](/framework/ai/sessions/2026/10/15/session-13eaee4d/) — kind/owner model/sonnet mod/ai/sessions mod/.claude/hooks/append mod/server task/ai-system · $3.08
- 2026/10/13 [Store framework refactor](/framework/ai/sessions/2026/10/13/session-9248043b/) — kind/owner model/opus mod/ai/sessions mod/server mod/.claude/hooks/append task/mastermind-repo-slim · $19.39

## Owner asks
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 Grip: show zone ~50px, grab zone 1px toward the scrollbar; names for grip, preview rail, … (task-mastermind-grip-zones, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Review: one review skill, system questions, screenshots at 4 widths (task-mastermind-review, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)

## Commits
- 88765fcf9 sheet step 10: the dictation redesign, mocks first
- 3c85befb3 voice rules + live readme: the answer goes on a /live card first, spoken reply one or two sentences, status a…
- 4963c7c6f Dictate: fix duplicate chat bubbles — drop a stale Whisper answer instead of committing it

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 46,892 tokens of reading, under the 100k limit).

Question: One spoken sentence, end to end (a walkthrough note)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "One spoken sentence, end to end (a walkthrough note)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
