<!-- computed by node Server/PastWork.mjs --task; do not hand-edit. The judging step is in .claude/skills/past-work/SKILL.md -->
# Past work: "core Item  items save through their parent   verify  write the rule  test it" (words: core, item, save, through, their, parent, verify, write, rule, test)

## Tasks (8, best first)
- 2026-10-03 [core/Item+Page: no at key, List extends Item, id rules, all data in d…](/framework/ai/sessions/2026/10/03/list-events/drop-at-key/) — Four owner passes, one merge — [Item](/framework/core/Item/), [List](/framework/core/List/), [Page](/framework/core/Page/) drop the at key — get(key) resolves one name; nesting replaces the path; a line may be an array of deltas; old at lines still replay for… · paths 3/3 exist
- 2026-10-02 [core/Item: Page extends Item, live lists saved line by line](/framework/ai/sessions/2026/10/02/page-extends-item/page-extends-item/) — Page extends Item; lists save as lines (e44930ad) ![](/framework/ai/2026-10-02/page-extends-item/shots/live-second-tab-1920.png) one set(delta), replay flag: headless replay, add/add/move every page keeps working: smoke of 7 pages, 0 errors static Store, appe… · paths 4/4 exist
- 2026-10-15 [framework/ai: readme smoke-test rule, logging, tags, asked-for summary](/framework/ai/sessions/2026/10/15/voice-20261015/ai-system/) — Rule added to the mastermind skill; framework/ai readmes audited (3 fixes, rest listed); append.mjs now stamps every line; in-memory query exists (SessionIndex + ext/Query), tags recommended; node Server/Asked.mjs answers 'didn't I ask for X?'. · paths 1/1 exist
- 2026-10-12 [Property: bind an Item key live (Property.of)](/framework/ai/sessions/2026/10/12/session-87bec773/property-of/) — Property.of(item, name) is built, and the session detail's model, effort and cost line now redraws on a new turn. Property.of reads the Item, writes through item.set, listens only while bound: core/Property/Property.test.mjs, 36 checks, Item listener count ba… · paths 1/1 exist
- 2026-10-04 [Refine: a Try-it page to test clean() against any model](/framework/ai/sessions/2026/10/05/clean-test-page/clean-test-page/) — A 'Try it' page tests the real clean() step against any model, live. [Try it](/framework/ext/Refine/try/) — [linked from Refine](/framework/ext/Refine/). test box, model picker (local + cheap OpenRouter + Haiku), Clean/Run all, real $ and seconds — proven liv… · paths 2/2 exist
- 2026-10-04 [Models tab: added a one-row-per-model catalog with live pricing and o…](/framework/ai/sessions/2026/10/04/models-page/models-page/) — Live on /framework/ai/ → System → Models, above the fold. A 17-row sortable table — provider, context window, $/M in/out/cached, our docs/reasoning/refine test scores, seconds, tokens in/out, and a "typical minion $" column — plus five notes on why reads are … · paths 2/2 exist
- 2026-10-03 [core/Item: a field colliding with a method now throws, not silently s…](/framework/ai/sessions/2026/10/03/list-events/field-collision-throw/) — Fields are code-only; a collision throws — [Item](/framework/core/Item/) static fields stays code-only — nothing at runtime adds an accessor (already true; confirmed by reading apply()/set_one()) a name check walks the WHOLE prototype chain (methods, accessor… · paths 3/3 exist
- 2026-10-03 [core/Page: PageLog folded away, Page extends Item directly](/framework/ai/sessions/2026/10/03/list-events/page-no-log/) — PageLog is gone — Page extends Item directly (e7f5a714) the file/place/tab/settings verbs + the listing moved onto [Page](/framework/core/Page/): [Page.class.js](/framework/core/Page/Page.class.js) PageLog class deleted; Log.js is a one-line re-export for its… · paths 6/6 exist

## Modules that exist now (files outside the module that import it)
- [core/Item](/framework/core/Item/) — used by 39 files
- [ext/Saver](/framework/ext/Saver/) — used by 19 files
- [ui/item](/framework/ui/item/) — used by 14 files

## Docs and readmes
- [Item architecture — a headless data node, saved as one docu…](/framework/core/Item/doc/architecture.md) — Item is one persistent thing: an id, a data bag, one set(delta), and a place to save. It runs in plain node (no DOM, no transport). Main cl…
- [Item — an arbitrary persistent thing: an id, a data bag, on…](/framework/core/Item/readme.md) — When to reach for which: a List when something is ordered and needs watching (events are built in — there's no event-less variant any more)…
- [Item — decisions and record](/framework/core/Item/doc/decisions.md) — *moved from readme.md 2026-08-17; conclusive, not current guidance.* One node of a persistent document tree: a data bag, an ordered items […
- [Rules Notes](/framework/core/Layout/doc/rules-notes.md) — ## LayoutRules — the three rules Data on the layout page, one checker, one CSS class. No registry, no config file, no rules engine — a layo…
- [Adoption: how parent stays one hop](/framework/core/List/doc/adoption.md) — Every Item owns exactly one List, built as new List({ owner: this }). The owner reference is the entire mechanism behind a rule that spans …
- [Tests — twenty-three layouts with a declared verdict, so th…](/framework/ext/DesignTool/tests/readme.md) — ## Use js import cases from "/framework/ext/DesignTool/tests/cases.js"; // Each case declares what it IS: a "bad" case names the one rule i…
- [Saver architecture — one write queue under three methods, b…](/framework/ext/Saver/doc/architecture.md) — Saver is where a JSON document goes: save(item), load(), delete(). The base class holds only the write queue ([Saver.js](../Saver.js)); eac…
- [Relation to core/Item](/framework/ui/item/doc/core-item.md) — The owner's own words: "I know the item... class like core/item is based on persistence. However, those could be kind of merged together, b…

## Sessions tagged with these words
- 2026/10/13 [Core Item architecture](/framework/ai/sessions/2026/10/13/session-5d65b684/) — kind/agent model/haiku mod/core/item task/mastermind-repo-slim docs/architecture · $0.23
- 2026/10/16 [Inbox labels](/framework/ai/sessions/2026/10/16/session-e91fc031/) — kind/owner model/sonnet mod/core/page mod/servex mod/.claude/skills/mastermind task/inbox-labels · $1.45
- 2026/10/16 [Past-work task mastermind](/framework/ai/sessions/2026/10/16/session-1fe7009b/) — kind/owner model/sonnet mod/ai/sessions mod/core/page mod/ai/aisession task/past-work · $11.04
- 2026/10/15 [Standing rules for domain masterminds](/framework/ai/sessions/2026/10/15/session-7e1f2802/) — kind/owner model/sonnet work/read-only task/standing-rules framework/sessions · $0.57
- 2026/10/15 [Voice-20261015 page-instance requirements](/framework/ai/sessions/2026/10/15/session-74c14268/) — kind/owner model/sonnet mod/core/page task/page-instance framework/sessions · $1.25
- 2026/10/15 [Live presentation surface](/framework/ai/sessions/2026/10/15/session-2275eb6b/) — kind/owner model/sonnet mod/core/page mod/core/list mod/servex task/live-present · $1.22

## Owner asks
- 2026-09-30 Padding: percentage padding, a wrapper per grid item, the rule in the layout system (servex-mastermind-opus (spawn at the 10 PM reset), queued)
- 2026-10-18 Padding: percentage padding, a wrapper per grid item, the rule in the layout system (?, tracked)
- 2026-09-30 Logs: validated writes only; shell appends to .jsonl blocked (mastermind-servex (10 PM task, item 11): make the validated route the default, then wire the guard, queued)
- 2026-10-02 Page extends Item: one set, persistence in Item, list verbs (add/remove/move/order) as pa… (task-mastermind-page-extends-item, building)
- 2026-09-30 AI 2: importance score 1–100 on Needs you, ranked (mastermind-servex-9, routed)

## Commits
- 9f66f0dbb core/Item, List, Page: drop the at key, List extends Item, id rules, data lives in data

## If the title is not the thing's name

```
Brief for a throwaway Haiku searcher (about 47,219 tokens of reading, under the 100k limit).

Question: core/Item: items save through their parent — verify, write the rule, test it

Read these, in order, then follow at most 5 links that look relevant (a readme's own Docs line, a module's readme):
- CLAUDE.md
- readme.md
- public/framework/readme.md
- public/framework/ai/readme.md
- public/framework/ai/past-work-index.md

Also run: node Server/PastWork.mjs "core/Item: items save through their parent — verify, write the rule, test it"

Check live code with Grep before you trust a landed note. Reply in at most 12 lines, starting with one word:
- EXISTS at <path or url> (what it does, in one line; who uses it)
- PARTLY at <path or url> (what is there, what is missing)
- NEW (nothing found; the readmes you read, so the next searcher skips them)
```
