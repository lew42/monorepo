<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Page  one helper per page  made once  a narrower Page  step 1 of 3 " (words: core, one, helper, per, made, once, narrower, step)

## Tasks (8, best first)
- 2026-10-13 [How a page renders: one plain doc under core/Page, linked from the re…](/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/page-rendering/) — core/Page/doc/how-a-page-renders.md answers the owner's question (classes + helpers write the DOM; page.jsonl deltas replay into blocks on top), linked from the Page and framework readmes (7e3c10b23). Landed by the mastermind from the agent's own answer and t…
- 2026-10-12 [core/Page: Template, live Property binding, binding.md](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/) — One Template drawn many times from its own data, with live bound fields ![](template-1920.png) plan with every design question decided: [plan.md](plan.md) architecture page: [templates.md](/framework/core/Page/doc/templates.md) BigCard cloned, B drawn twice, … · paths 2/2 exist
- 2026-10-12 [Performance: batching benchmark, Batch helper, session buckets](/framework/ai/sessions/2026/10/12/session-87bec773/perf-system/) — Performance system landed — [code/performance](/framework/code/performance/) with a measured benchmark, one helper, and session buckets that the grid now uses. performance docs linked from Code: [readme](/framework/code/performance/), [batching.md](/framework… · paths 2/2 exist
- 2026-10-04 [Models tab: added a one-row-per-model catalog with live pricing and o…](/framework/ai/sessions/2026/10/04/models-page/models-page/) — Live on /framework/ai/ → System → Models, above the fold. A 17-row sortable table — provider, context window, $/M in/out/cached, our docs/reasoning/refine test scores, seconds, tokens in/out, and a "typical minion $" column — plus five notes on why reads are … · paths 2/2 exist
- 2026-09-29 [AI 2: Inbox · Overview tabs, one big card per concept](/framework/ai/sessions/2026/09/25/546c308f-a944-4905-95a1-68d84991524f/ai2-overview/) — AI 2 has two tabs, Inbox and Overview. The [Overview](/framework/ai2/overview/) shows one big icon card per familiar concept, each with its open asks and its finished ones folded. ![](live-1920.png) tabs at the root, like a class doc page: shot ui/inbox-1920.… · paths 2/2 exist
- 2026-10-20 [Servex keeps the tunnel up; connector URL shown](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/tunnel-keeper/) — Servex now keeps the tunnel up. keeper at boot and every 60 s, adopts a live tunnel: node Server/Tunnel.test.mjs ok; after a Servex restart Tunnel.mjs status says up, edge answers 405 (not 502/404) URL findable: handover NOW block shows Connector: library-tri…
- 2026-10-20 [Whisper page: one live demo of every Whisper answer](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/whisper-demo/) — [The Whisper page](/framework/audio/Whisper/) is one demo: each Whisper answer arrives as a row, guesses amend themselves, the final replaces them. Merged 4ccb14de3. ![](shots/4-max-1200.png) live object log, real dictation: fake-mic run, 6 guesses → 1 final … · paths 2/2 exist
- 2026-10-16 [Refine: sentences stay tracked, one per send](/framework/ai/sessions/2026/10/16/voice-20261016/refine-build/) — Refine keeps every sentence and sends them one at a time. Merged as c82cae958; reviewed: 4 fixed, 3 noted. Sentences go into the tracked structure: [Refine](/framework/ext/Refine/), shots/refine-sentences-kept-400.png - [~] Real-time refinement: instant clean… · paths 2/2 exist

## Modules that exist now (files outside the module that import it)
- [core/Property](/framework/core/Property/) — used by 3 files

## Docs and readmes
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — ## One persistence system with Page Page extends Item: [core/Item](/framework/core/Item/) and [core/Page](/framework/core/Page/) are one sy…
- [Property — one live value you can bind to](/framework/core/Property/readme.md) — class Property extends Events(Object): get(), set(v) (emits change(value, old) only if it changed), bind(fn) (calls fn now and on every cha…
- [Page overview — the palette: one card per building block, a…](/framework/core/Page/overview/readme.md) — Four bands, declared as BANDS in [page.js](../page.js) — the source of truth for what's on the wall and in what order. The first band is th…
- [App — boot, and the one container pages mount into; a site …](/framework/core/App/readme.md) — new App() → config() → render() → await load() → initialize() → inject() → app.ready settles. An element with a lifecycle attached, not a c…
- [Weight — one number per page, 1 by default, that says how m…](/framework/core/Page/weight/doc/design.md) — Live: [/framework/core/Page/weight/](/framework/core/Page/weight/). Code: weight.js (~25 lines), Server/page-refs.mjs (the writer). Prior w…
- [Weight — one number per page, 1 by default, that says how m…](/framework/core/Page/weight/readme.md) — A page's AI cost lives right beside weight, same file, same convention. ai-cost.js reads it ({ usd, tasks } or null); node Server/page-ai-c…
- [Property architecture — one live value, one event](/framework/core/Property/doc/architecture.md) — Property is a simple event-emitting value container. Main class: [Property](../Property.js). Two variants: Property.Map for template bindin…
- [Asks about Property: 10 open, 0 done](/framework/core/Property/doc/refined-asks.md) — Generated by node Server/AskIndex.mjs from the refined asks in each session's asks.jsonl; never hand-edited. Newest first. Open ones are al…

## Sessions tagged with these words
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22
- 2026/10/15 [Sessions subpages](/framework/ai/sessions/2026/10/15/session-0c3e83dd/) — kind/owner model/sonnet mod/core/page task/subpages framework/refine · $1.34
- 2026/10/14 [Nav-model page with live demos](/framework/ai/sessions/2026/10/14/session-e9f013e5/) — kind/owner model/opus mod/core/page task/mastermind-repo-slim page/catalog · $13.00

## Owner asks
- 2026-09-30 Merge candidates: one minion per core dir (later, when tokens allow) (ai/todo.md, parked)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-one-dictation, building)
- 2026-09-30 Dictation: ONE system everywhere (rail, sidebar, drawer, card) on the fast/smart pair; ol… (task-mastermind-audio-consolidate, building)
- 2026-09-30 Templates: weight per use, use-template skill/tool, one library (mastermind-servex-9, routed)
- 2026-09-30 Templates: weight per use, use-template skill/tool, one library (mastermind-servex (proposal-flow, 10 PM), queued)

## Commits
- 648a05b65 task-folders: TaskMove.mjs moves day folders into the sessions store
- 7be399a55 refine.mjs prep: export askOnce from ask-each.mjs, guard its main(); add collab.mjs's given hook

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 42,753 tokens of reading, under the 100k limit).

Question: core/Page: one helper per page, made once (a narrower Page, step 1 of 3)

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Page: one helper per page, made once (a narrower Page, step 1 of 3)"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
