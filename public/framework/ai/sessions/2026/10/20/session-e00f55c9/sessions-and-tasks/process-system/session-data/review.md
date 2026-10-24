verdict: pass
1. [note] `counts.started` counts any task that is not idle, so a task stopped before it ever ran counts as started (Servex/agents/page_tools.js `counts`; the test's task `c` is stopped without a start and is counted in `started: 2`). That contradicts the comment "ran at least once"; if the owner means "began work", leave stopped-unstarted tasks out.
2. [note] `own_cost` reads the whole `cache.jsonl` and parses every `{"summary"}` line on every `item()` call (page_tools.js `own_cost`). For session-e00f55c9 that file is already 4 MB and grows with each index pass, which is most of the ~250 ms. Reading only the file's tail for the last summary line would keep it flat.
3. [note] The cost is only as fresh as `AISessionIndex` left it: `item()` reads the cache and does not advance it. It is stamped (`through`, `read_to`, `at`), which meets requirement 1's "stamped with where it read to", and the cache was 1 minute old when checked. Still, a session the indexer does not visit gets `own: null`, not a cost.
4. [note] `cost.total` is own plus children. If a Servex agent's own session folder ever ends up among its own `agents_under(dir)` results, it would be counted twice. That does not happen for VS Code tabs such as e00f55c9, but nothing guards against it.

## Requirements
- 1 "item() answers total cost … duration, every child session nested with its own cost, direct and descendant task counts (created, started, complete), and the biggest tasks" — yes — `session_state` returns `cost.{total,own,children,tasks}`, `own.active_ms` + `span_ms`, `children` nested by registry `parent` (Agents.js:1656 stores it) with `total` per subtree, `counts.{direct,all}`, `biggest` (top 5, one per folder)
- 2 "works for VS Code tab sessions" — yes — `class_of` now returns Session when line 1 is `{"session":{…}}`; e00f55c9's line 1 is exactly that (`kind:"vscode-tab"`)
- 3 "the sessions readme states what data exists, which tool writes it, which class reads it" — yes — core/Session/readme.md has a field / what / read-from (written-by) table; ai/sessions/readme.md links to it in one line
- 4 "Tested on session-e00f55c9" — yes — findings.md gives its real numbers ($882.55 = own $234.19 + 59 children $648.36, 158 tasks); the unit test `node Servex/agents/session-state.test.mjs` passes 13 checks (run here)
- 5 "find out why it was missing (findings.md)" — yes — findings.md: "built, but not wired", plus "never one requirement", each with its cause
- Class with live instances — n/a: no new class (Session gains fields, not a new class)

## Words
- content 1 (says what it is first) — yes — findings.md opens with its headline "built, but not wired"
- content (plain sentences, terms defined) — yes — readme table defines each field in plain words; `read_to` is explained as bytes read
- content (one screen) — yes — findings.md is one screen: four bullets and a six-row table
