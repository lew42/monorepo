# Decisions through a node process, not a prompt

**Card:** 2026/09/29/openrouter-brain-a-knowledge-base-that-o (part 4).
**Goal:** a decision is made by a node process that walks it step by step, so the AI can't forget a part. A decision is simple and concrete, ranked by how foundational it is, and nested by dependency: "choose A, then decide X and Y; choose B, then Z".

## The object (one `{"decision":{…}}` line in the card's page.jsonl)
`id, question (one plain sentence), rank (1 = most foundational), options:[{id, text, caveats:[…], then:[child decision ids]}], recommended, confidence (0–1), why, sources:[source ids], depends_on:{decision, option} or null, status (open|decided), decided_by`.
Reuse what exists: the decision shape in `Server/collab.mjs` (a decision line lists every option) and the `Decision` view in `public/framework/ux/Content/`. Extend them; don't fork them.

## The process: `Server/decide.mjs` (also exposed as a Servex tool if cheap)
`create` → question + rank → `options` (the AI may give several at once) → for each option, `caveats` and `then` (the child decisions) → `recommend` + confidence + sources → it validates and appends. Each call returns the next thing still missing, so it walks the AI through every part. A missing part is refused with the reason.
A skill `.claude/skills/decide/SKILL.md` is the contract, backed by this one tool.

## Land
Seed it with the OpenRouter decisions from `ai/sessions/2026/09/28/11e3ca4d-25f2-443f-bd31-a9f638890021/harness-research/plan.md` (proxy vs own loop, then provider field, cost source, fence) on the brain card, nested. A screenshot of the card showing them ranked and nested. Report on the card; run finish-task.
Model: Opus, medium. Fence: Server/decide.mjs, .claude/skills/decide/**, public/framework/ux/Content/Decision* (extend only).
