verdict: fix
1. [fix] Both tests write to the live tree, which the brief forbids ("on scratch records, never the live tree"). `Servex/agents/child-links.test.mjs:219-220` and `ref-cache.test.mjs:345` create dot-folders under `public/framework/ai/sessions/2026/10/22/` and `sessions/tasks/`, and run a real `complete` there through `run_item`. A running Servex can see or index them before the `finally` removes them. Point `PUBLIC` and the resolvers at a temp root, or say in the readme why that isn't possible.
2. [note] The child cache can apply a parent's line to its child twice. `ref_scope` (`Servex/agents/page_tools.js:289`) hands the same child object back each time the parent is replayed, and `Task.replay` sends every parent line shaped `{"<child id>":{…}}` into that object (`Task.js` ~515). A plain field set does no harm, but a `tasks.add` or `reinforce` aimed at a child from the parent's log would be added again on every re-replay. The minion's own caveat calls this "idempotent", which holds only for plain sets. A safer cache key would be the child's own lines (cache those parsed lines, then replay them fresh), or the cache could be skipped for any child the parent's log addresses.
3. [note] The `kids` Map in `page_tools.js:288` is never pruned. In the long-running Servex process it holds every child ever replayed. Its key also leaves out the class that built the child (`Task.js:484`), so a `Session.from_ref` and a `Task.from_ref` for the same ref share one entry.
4. [note] Simpler: `Agents.js:175` re-derives `parent_session` with the same expression the registry write already uses (`Agents.js:83`). One helper, or reading the value off the row, keeps the two from drifting apart.
5. [note] `Server/ChildLinks.mjs:83` hard-codes `until = "2026-10-25T06:00:00.000Z"` and the e00f55c9 id as defaults. The brief asks for the e00f55c9 name match, so this is acceptable, but the cutoff date is unexplained. One comment saying why that date was chosen would cover it.
6. [note] The requirements are met in substance. Item 24: the spawn writes `{"task","as"}` and `add_ref` refuses a second copy; the backfill is a dry run by default with a manifest, the counts are in the report (102 children, 3 to append), and `--apply` is left to the deputy. Item 25: the readme states the rule and gives before and after times (about 115-130 ms → 12-20 ms). Item 26: `completion` is a query and the readme shows the call and its answer on e00f55c9. One gap: the readme's call shows only the `<uuid>` url, while the dated-folder url is mentioned in prose. That is fine.

## Requirements
- 24a "at spawn … also append {task, as} to the parent session's record" — yes — `Agents.js:193-195` calls `ChildLinks.link`, and the test at `child-links.test.mjs:230-234` checks one line, `as`, and never twice
- 24b "Server/ChildLinks.mjs, dry run by default, manifest, --apply" — yes — `ChildLinks.mjs:129-141`; the report gives the dry-run counts on the main tree
- 24c "parent's completion includes the child" — yes — `child-links.test.mjs:247-250` (0 → 0.5)
- 24 test "on scratch records, never the live tree" — no — the throwaway folders sit in the live store (finding 1)
- 25 "re-replay only the changed child" — yes — `ref-cache.test.mjs:364-381`; ancestors' totals are still computed on read
- 25 "measure before and after" — yes — readme line 413, and the report's evidence
- 25 "readme states the rule" — yes — `core/Session/readme.md`, "Recompute only what changed"
- 26 "item {completion:{}} answers tally + number for any session" — yes — `page_tools.js:310,317`; the test at `ref-cache.test.mjs:386-390`; the e00f55c9 answer is in the readme
- 26 "one line in open items about auditing past sessions" — yes — readme "Open items"
- Live-instances page for a new class (`ChildLinks`) — n/a — it is a stateless node tool with no live instances

## Words
- content: readme additions in plain sentences — yes — `core/Session/readme.md` lines 403-415 explain what, where and the exact call
- content: undefined jargon — no issues — "signature" is defined in place ("size and modified time")
