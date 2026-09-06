# skill-hygiene — fold today's improvement entries into the skills (Opus)

Read first: `.claude/skills/mastermind/SKILL.md` § "Skills improve themselves — apply the fail-safe ones" (the rule you apply: **fail-safe** = naming a trap that actually bit, with its evidence · correcting something factually wrong · adding a link to detail that exists · tightening wording without moving the decision — apply straight to the skill and DELETE the entry; **not fail-safe** = changing what the skill decides · a new required step · relaxing or hardening a rule or a number the owner chose · deleting guidance you disagree with — leave the entry and list it as a proposal). Then `../../2026-09-04/mastermind-platform/minion-rules.md`. Skills: `new-task` (this dir, group `ai-ops`), `finish-task`.

## The work

Every `.claude/skills/*/improvements.md` carries entries dated 2026-09-05 (about thirty-five across code, css, documentation, finish-task, layout, mastermind, new-css-class, new-task, ui-test). For each entry:

1. Read the skill it names (`SKILL.md`, and `caveats.md` where the skill keeps one — css and layout do).
2. Decide fail-safe or not, by the rule above, in one line in your log.
3. Fail-safe → write it into the skill where it belongs, as one tight line with the evidence and the date (a trap goes in the traps/caveats list; a factual correction replaces the wrong text; three entries saying the same thing become one line that says "three agents, one night"), then delete the entry. Not fail-safe → leave the entry, and add it to a `## Proposals for the owner` list at the end of your log with the one-line reason.
4. Where several entries across skills describe ONE cause (the hidden-sibling/duplicate-selector trap has at least four shapes across ui-test entries; the `/c/...` path trap has three; the "kill by pid" rule; the "write plans with the Write tool" rule), write it ONCE in the right skill and delete all of them.
5. Two corrections you must make regardless: the layout and css skills still quote the 2026-09-01 clamps (`--pad-default: clamp(1em, 1.3%, 2em)` etc.) — the root now carries the three ramps and the three levels (read `framework.css` and `/imagine/design/spacing/decision.md`) — update the text and link the decision; and `new-css-class` needs the step three agents asked for tonight: census the VIEW CLASS NAMES you declare, because `classify()` mints a CSS class from every constructor name (`Stage` wore `.stage`, `Swapper` wore `.swapper`, `LayoutsPair` wore `.layouts-pair`) — that one is a new step, so write it as the strongest possible proposal at the top of your list AND add a one-line trap to the skill's existing text (the trap is fail-safe; the step is the proposal).

## Prove it

Every skill file you touched still reads top to bottom as one voice (no duplicated line, no entry pasted in raw). `git diff --stat .claude/skills` in your log. Counts that must agree: entries found = entries applied + entries left as proposals.

## Fences and budget

Write only `.claude/skills/**` and this task dir. Never `CLAUDE.md`. No server needed. Budget ~200k tokens. Report in ≤ 8 plain lines: entries found / applied / left, the proposals list (one line each), the two corrections.
