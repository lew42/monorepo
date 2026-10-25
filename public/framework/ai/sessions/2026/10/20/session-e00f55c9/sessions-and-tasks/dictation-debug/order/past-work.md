<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "Dictation  why words arrive out of order" (words: dictation, word, arrive, out, order)

## Tasks (8, best first)
- 2026-10-25 [Dictation: words stay in place, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/flicker/) — Dictation: words stay in place. Ready to merge: branch worktree/dictation-flicker (6 commits). Cause and proof: [doc/flicker.md](/framework/ux/Dictate/doc/flicker.md). reproduce the flicker: a pause emptied the words, then waited for refine and the send queue…
- 2026-10-13 [Chat bubbles in time order, and the Refine page hears the chat](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/bubble-order/) — Chat bubbles now land in time order, and the Refine page shows what the ✦ chat heard. order fix: [ext/Chat](/framework/ext/Chat/) place(), merged e7533ddfc. Scripted four sentences with replies in between: before [FAIL](/framework/ai/sessions/2026/10/13/sessi… · paths 2/2 exist
- 2026-09-28 [core/Page docs: Make a page + Layout tabs, tab order fixed](/framework/ai/sessions/2026/09/28/e269b131-e2d2-4712-a88d-b243d631bd04/organization/rewrite/) — Landed: [core/Page](/framework/core/Page/) has two new top tabs — [Make a page](/framework/core/Page/make/) (the four ways to build a page, code then live result) and [Layout](/framework/core/Page/layout/) (Choosing a layout: five shapes as icon items, each l… · paths 7/7 exist
- 2026-10-25 [Dictation: Debug tab, stalls fixed, no flicker](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/dictation-debug/) — Website dictation: a Debug tab, both stalls fixed, no flicker. Merged to michael/dev (146e37c73, then the flicker branch). Debug tab, routed at <page>/ai/debug/, five live rows with real errors: ![](flicker/shots/polish-debug-390.png) Stall fixed: 1 send in 2…
- 2026-10-13 [Dictation: New session really starts fresh, walked on phone and deskt…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/) — The dictation flow, walked on the phone and the desktop drawer: New session now really starts a new conversation. [Report](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/voice-e2e-review/review.md) ![](/framework/ai/sessions/2026/10/1… · paths 1/1 exist
- 2026-09-30 [Dictation: live chat bubble, streamed replies, answers on silence](/framework/ai/sessions/2026/09/30/dictation-stream/dictation-stream/) — Your words now grow as a bubble in the chat, and replies type themselves out. [Walkthrough](/framework/ai/2026-09-30/dictation-stream/#1) dictation creates the message in the chat: [shot](proof/1-words-growing.png) text box kept: gear, "dictation goes into" r… · paths 3/3 exist
- 2026-09-29 [Layouts: five questions that choose a layout, with column demos](/framework/ai/sessions/2026/09/29/0c6006c6-49c4-4579-842e-d7f4b6f34689/layout-system/) — Choosing a layout is now five questions, asked in order, with live demos: [/layouts/decide/](/layouts/decide/). ![The five questions at 1920](/framework/ai/2026/09/29/choosing-a-layout-five-questions-and-col/questions-1920.jpg) Ordered questions, worded as ju… · paths 1/1 exist
- 2026-09-29 [Dictation: shorter wait before a sentence sends and before the assist…](/framework/ai/sessions/2026/09/29/dictate-lag/) — Two timers made dictation feel slow, and both are shorter now. Everything else takes about 10 ms. 4-5 s before the words appear in the chat: the microphone waited 4 s of quiet when the words did not end in a full stop. It now waits 2.5 s, the same as after a … · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Layout](/framework/core/Layout/) — used by 33 files
- [core/Router](/framework/core/Router/) — used by 54 files
- [ext/layout](/framework/ext/layout/) — used by 19 files
- [ui/words](/framework/ui/words/) — used by 33 files

## Docs and readmes
- [Figma properties to framework layout words (2026-10-10, fir…](/framework/ext/Figma/doc/mapping.md) — Goal (the owner's): what you see in Figma is what the browser renders. This table says which Figma signal implies which of our words, and w…
- [Title layouts: where the words go (owner, 2026-10-12 night)](/framework/ext/Figma/doc/title-layouts.md) — A title card (Netflix / Prime Video key art, a video title slide, a T-shirt) is one of the most basic layout questions: given 2, 3, 4 or 5 …
- [The layout system — five words](/framework/styles/doc/layout-system.md) — Landed 2026-08-17. Measured cause and evidence: [ai/sessions/2026/08/17/layout-system/proposal.md](/framework/ai/sessions/2026/08/17/layout…
- [Masonry — a ragged wall with no gaps at the column bottoms,…](/framework/styles/layouts/masonry/readme.md) — ## Index - [packed](./packed/) — the same wall, reading left to right (no readme yet) ## Use js div.c("masonry", () => site.notes(24)).styl…
- [Words](/framework/styles/layouts/space/words/readme.md) — Every word the layout format accepts, pictured. Code: styles/layouts/space/words/page.js _Stub — more to come._
- [The corpus — every page the Router can reach, and how that …](/framework/core/Search/doc/corpus.md) — A search result is a promise: click it and you land on that page. So the corpus is not "every directory on disk" and not "every link anybod…
- [catalog — two arrangements of previews() patched onto Page,…](/framework/ext/catalog/readme.md) — ## Use js initialize(){ this.catalog(); } // rail — the page's own content() becomes the first card const BANDS = { Surfaces: "card toolbar…
- [Refine: dictation to cards and tasks — the six subtasks, in…](/framework/ext/Refine/tasks/refine-dictation-to-cards-and-tasks/readme.md) — Source: the owner's dictations of 2026-10-16 (ext/Refine/doc/card-types.md, including the night addendum "one assistant, one pass, by sente…

## Sessions tagged with these words
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f8558e65/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Typing sentences](/framework/ai/sessions/2026/10/16/session-f41b09a7/) — kind/owner model/haiku work/read-only dictation/clarity · $0.02
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-f38a887f/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-ecfd1667/) — kind/owner model/haiku work/read-only dictation/parse · $0.00
- 2026/10/16 [Kennedy inaugural address excerpt](/framework/ai/sessions/2026/10/16/session-e6df509c/) — kind/owner model/haiku work/read-only dictation/clarity · $0.00
- 2026/10/16 [Second line typed](/framework/ai/sessions/2026/10/16/session-e39150d7/) — kind/owner model/haiku work/read-only dictation/parse · $0.00

## Owner asks
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 AI 2: Inbox default, Log tab, heartbeats out, tabs left (minion-ai2-rescue-merge, building)
- 2026-09-30 Page: audit of every layout, priority pages, reuse by default (mastermind-page, building)
- 2026-09-30 Dictation: one configurable widget everywhere; widget first on the page (task-mastermind-audio-consolidate, building)
- 2026-09-30 Dictation: sheet shows the chat and mic; release the mic when hidden (minion-sheet-regression, building)

## Commits
- b56663d8d one-dictation/minion-core: fix the nav-before-push ordering bug behind the duplicated-lines/wrong-page bug, r…

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 43,806 tokens of reading, under the 100k limit).

Question: Dictation: why words arrive out of order

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "Dictation: why words arrive out of order"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
