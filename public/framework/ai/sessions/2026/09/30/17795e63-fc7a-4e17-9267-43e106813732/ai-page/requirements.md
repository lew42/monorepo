# /framework/ai/: the home of the AI system: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step, because more may be appended.

## Asks
1. **Delete the current /framework/ai/ page content.** It is stale (the old V3 board). Don't audit it for things worth saving. Keep every route under it working (the date folders, `2026/`, `v/`, the effort and log routes), because task logs and cards live there. Only the level-1 content changes.
2. **Level 1 = the AI system, shown.** One screen: a row of linked icon tiles (the `Concepts` module in `ux/Content`), one per concept, most important first:
   - Assistants (fast and smart)
   - Masterminds
   - Minions
   - Tasks and cards
   - Asks (`ai/asks.jsonl`)
   - Page inboxes
   - Heartbeat
   - Review and merge

   Each tile opens a child page. The first line of each child page is its gist. Then a few items. Then links to the code that owns it.
3. **Servex is linked, not repeated.** The AI docs live here. Where a concept is implemented in Servex (spawning, the pool, the heartbeat, dev servers and the proxy), link to the Servex page, or to the Servex sub-page that owns it. Servex's own page shrinks to "the process that runs it", and its useless "It's parts" header goes.
4. **The old servex-docs task is ON HOLD** (flowcharts). Don't build diagrams. Reuse its notes in `ai/sessions/2026/09/30/servex-docs/` only if they help.
5. **Reference paths:** the owner wants mentions with paths, like `@Servex/Heartbeat` (parent/child). `task-mastermind-mentions` owns that syntax. Write the links as ordinary links for now.

## Additions (the owner, 2026-09-30, second message: see owner-words.md)
6. **Use the same top-tabs UI as the module docs** (Overview / Docs / …). It works, so lean into it.
7. **Make the Overview very visually structured.** Build a strong information hierarchy: title → heading → gist line → ordered and unordered lists, grids, and previews. Lists placed in the right context carry the weight: "one, two, three things, and you can click through or not".
8. **The system overview:** every part of the AI system, and how the parts work together. Click through to any one system. The parts include:
   - skills;
   - CLAUDE.md;
   - memory;
   - the task log and cards;
   - asks;
   - agents and roles;
   - voice sessions;
   - the pool, review and merge;
   - the heartbeat;
   - Servex (referenced, not duplicated).
9. **Document every Claude skill here** (`.claude/skills/*`): one child page each, with what it is for and when it runs. Build the pages from the SKILL.md files; don't copy them.
10. **Content authoring system:** the skill and the widgets for writing structured, familiar content (outlines, lists, grids, previews), documented here and actually used on these pages. Extend the `content` and `page` skills (through the Servex architect, mastermind-servex-9) rather than starting a new skill.
11. **Object-oriented UI:** each object in the AI system gets a view (an icon, a row, a panel), for example an Agent, a Task, a Skill or an Ask. Propose an **object-oriented design skill**, routed to the architect.
12. **Merge past system-design asks** into this one. Look through `ai/2026-09-2*` and `ai/2026-09-30/servex-docs` for the owner's earlier "overview of the entire system" asks, and fold them in. You own the merge.

13. **The readme system gets its own well-documented page here.** It covers:
    - what a readme is and what it points to;
    - the chain is read top-down from the root, again on a directory switch or in a fresh session;
    - how Servex loads it (`Servex/agents/readme-chain.js`, `load_module`);
    - the build order: docs are updated before review.
14. **After it's built, mastermind-servex-9 reviews the whole page and weighs in.** It owns the skills and the architecture. Message it with the link when the page is live, fix what it finds, and then land.

15. **A CLAUDE.md tab on the AI page.** Show the actual file right there, highlighted and live, and beside it a short discussion of what should and shouldn't go in CLAUDE.md. CLAUDE.md works like an automatically loaded skill, so every agent gets a little awareness of the most important systems and where to find more. Audit it: which systems are named, which are missing, and which lines belong in a skill instead. Post the audit as a proposal only. CLAUDE.md edits need the owner's OK, and mastermind-servex-9 drafts them. Try a layout; it can change later.
16. **Every system is shown by its effects**, from the simplest example to the complex ones: the iceberg. This is the principle behind clarity, content and navigation alike.

## Rules
- Tokens are nearly out. Budget: $15, hard (raised for the added scope).
- At most 1 minion (Sonnet), or do it yourself if that is cheaper.
- Pool worktree, `merge.mjs` (smoke test), and the review skill. Screenshots at 400 and 1920.
- Post one short card when it's live.

