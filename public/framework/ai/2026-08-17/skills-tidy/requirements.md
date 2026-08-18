# skills-tidy — apply the skills-check verdicts

Laws: less is more · clarity · prioritize. **Edits only; no new rules beyond the two named. Final message ≤ 15 lines.**

Source of truth: [`../skills-check/proposal.md`](../skills-check/proposal.md) (Opus, 2026-08-17). Mike: *"Be careful running away with new rules."* Net here is nine deletions, one addition, one promotion.

## Do exactly this

1. `.claude/hooks/readme.md` — repair the two doc bugs: the `Edit|Write|NotebookEdit` row lost its cell when the Skill row was inserted (L19–20); the Wiring JSON block omits the `Skill` matcher — add it so the readme matches `.claude/settings.json`.
2. Stale names: `.claude/skills/css/SKILL.md:3` and `.claude/skills/css/caveats.md:12` say `layout-design` → `layout`; `.claude/skills/finish-task/SKILL.md:43` "release any claimed tab" → delete that clause (`claim-tab` is gone).
3. `.claude/skills/*/improvements.md` — delete the six entries the proposal marks **absorbed** (already in the SKILL.md text). Keep the two open `layout` entries until step 4.
4. `.claude/skills/layout/SKILL.md` — apply "close the dev rail before you measure" (one line, in the measuring step; the evidence: an open rail displaced `.app` 272px on 12 of 24 page-widths). Then delete that improvements entry. Leave the `width-used at 3440` entry in place, marked `— declined 2026-08-17: Q2 already names the widths; belongs in ext/DesignTool/knowledge/`.
5. `.claude/skills/mastermind/SKILL.md` — add one bullet in **Briefs**, after the `findings.md` line:
   `- A skill that misled you gets ONE evidence line in .claude/skills/<skill>/improvements.md; when you apply one to a SKILL.md, delete the entry — six of eight were stale for want of that.`
6. Delete the three duplicated caveats the proposal names (`.page.full` verbatim in both caveats files — keep one, link the other; the `1fr`-is-not-`minmax` restatement; the backtick trap stated in three places — keep CLAUDE.md's, link it).

## Rules

- Files you may edit: `.claude/hooks/readme.md`, `.claude/skills/{css,finish-task,layout,mastermind}/SKILL.md`, `.claude/skills/*/improvements.md`, `.claude/skills/*/caveats.md`, this dir. Nothing else; never CLAUDE.md.
- Log each file touched as `{"log": {"at","msg"}}` in `task.jsonl` here (bash `printf`, never Out-File). Land: `{"assign": {"step": 6, "landed_at": "<ISO>", "outcome": "**skills tidied** — …", "tokens": null}}` + a `landed —` line in `../day.jsonl`.
- If a proposal item is ambiguous when you open the file, do the smaller edit and log the doubt — do not invent.
