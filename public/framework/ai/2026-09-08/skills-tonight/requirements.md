# skills-tonight — apply tonight's fail-safe skill improvements, delete the entries (Sonnet, group `ai-ops`)

Three laws: less is more (ASAP); clear beats brief; prioritize. Length budget: each applied improvement is one or two lines in a SKILL.md; your report five lines.

Read first: `../mastermind-playwright/minion-rules.md`; `.claude/skills/mastermind/SKILL.md` §"Skills improve themselves" — the rule you apply: **fail-safe** = naming a trap that actually bit, with its evidence · correcting something factually wrong · adding a link to detail that exists · tightening wording without moving the decision. **Not fail-safe** (leave the entry, do not apply) = anything that changes what the skill decides, a new required step, relaxing or hardening a rule or a number the owner chose, deleting guidance you disagree with.

## Do

Tonight's minions appended entries dated 2026-09-08 to `.claude/skills/research/improvements.md`, `.claude/skills/new-page/improvements.md` (two entries: doc notes declared as bare `children:` names 404 three times per page — name the file in the config; and step 3 "add its name to the parent's children" is wrong for a blog post, which `public/blog/readme.md` says is deliberately never declared), `.claude/skills/code/improvements.md` (the MSYS path-conversion trap, which bit twice tonight), and possibly others — `rg "2026-09-08" .claude/skills/*/improvements.md` lists them all. For each entry: decide fail-safe or not, with the rule above. Fail-safe → write it into that skill's `SKILL.md` at the place a reader meets the trap (one or two plain sentences, the evidence in a parenthesis, in the skill's existing voice — read the surrounding section first), then delete the entry from `improvements.md`. Not fail-safe → leave the entry, and list it in your report as a proposal for the owner with one line of why.

Verify each SKILL.md still reads as one document afterwards (no duplicated warning; a trap named once, at the right place).

## Fences and budget

Write ONLY `.claude/skills/<name>/SKILL.md` and `.claude/skills/<name>/improvements.md` for the skills whose entries you handle, and this dir. Never `.claude/skills/mastermind/`, never `CLAUDE.md`, never `settings.json`. Budget ~60k tokens. Report in ≤ 5 plain lines: applied (skill · one phrase each), left as proposals (skill · why), nothing else.
