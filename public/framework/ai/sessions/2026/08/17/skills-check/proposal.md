# skills-check — the skills are wired; the improvements loop needs a broom

## 1. Wiring — works, proven

`.claude/settings.json` → `ledger.mjs`, five entries: `SessionStart`(resume) · `PostToolUse`(`Edit|Write|NotebookEdit`) · `PostToolUse`(`Skill`) · `Stop` · `SessionEnd`. Skill lines are landing — 8 of 47 task dirs today carry `{"log":{"msg":"skill: …"}}` (`ai-rail devbar-structure panel-simplify readme-retreat report report-full task-status vision-browse`). A skill call has **no file path**, so it resolves by `cached_task(agent_id)` → newest task with a matching `session_id`; subagents inherit the parent's session, so a line can land on a sibling's task. Known, documented in the script, not worth fixing. **Two doc bugs in `.claude/hooks/readme.md`** (the code is right): L19–20 — inserting the Skill row **spliced the `Edit|Write` row's cell into it**, leaving that row empty; and the **Wiring JSON block omits the Skill matcher**, so rebuilding settings.json from this readme silently drops the hook. Stale too: it names one cache file, the code writes three.

## 2. Stale old-name references

| path:line | fix |
| --- | --- |
| `.claude/skills/css/SKILL.md:3` — "sizing a page → layout-design" | `layout` |
| `.claude/skills/css/caveats.md:12` — "`layout-design`." | `layout` |
| `memory/layout-design-skill.md:2,3,12` + `memory/MEMORY.md:17` — name, description, **a path to a deleted dir** | rename, or delete (superseded by `skills-2026-08-17.md`) |
| `memory/every-line-audit-method.md:13` — "code-architecture" | `code` |
| `finish-task/SKILL.md:43` — "Release any claimed tab" | `claim-tab` is gone; the how survives only in `layout/caveats.md:12` |

Memory auto-loads every session — **those three are the only ones that will misdirect an agent.** Today's landed `requirements.md` files also name old skills: history, do-not-rewrite.

## 3. Improvements — 8 entries, 6 already absorbed

| skill | n | act on |
| --- | --- | --- |
| css · documentation · finish-task · new-task | 1 each | **none — all four are already in the SKILL.md text** |
| layout | 4 | **"close the dev rail before you measure"** — an open rail displaced `.app` 272px and manufactured the top finding on 12 of 24 page-widths. Two others are absorbed; the fourth is below |
| the other six | 0 | none |

**Mtimes name the failure:** improvements 15:10, SKILL.md rewrite 15:12 — harvested, never pruned. Left there they get re-applied, or read as unfixed. **7 of 8 are clarifications or burden *removals*** (finish-task's "a subagent cannot sum its own tokens" deletes an impossible step). One is a new rule — layout's *"check `width-used` at 3440 in question 2"*. **Decline**: Q2 already names the four widths, and `width-used` is generator-tuning knowledge for `ext/DesignTool/knowledge/`. Mike's fear has not materialized.

## 4. Mastermind — one line missing

L88 says *"Improve this skill"* — its own only. Nothing tells a **minion** to log against the skill it used. Smallest change, in **Briefs**, after the `findings.md` bullet (not edited):

```diff
 - Findings go in the worker's own `task.jsonl` as `log` lines, never a `findings.md`.
+- A skill that misled you gets ONE evidence line in `.claude/skills/<skill>/improvements.md`;
+  when you apply one to a SKILL.md, delete the entry — six of eight are stale for want of that.
```

## 5. Skill health

11 skills, 1,104 lines. All point rather than explain; all but `new-css-class` link their `improvements.md`. Three duplications, ~4 lines, safe to delete: **`.page.full` zeroes `--measure`** (verbatim in `css/caveats.md:11` *and* `layout/caveats.md:11` — keep layout's); **`1fr` is not `minmax(0,1fr)`** (`css/caveats.md:10` restates layout's bounds rule); **the `` css(`…`) `` backtick trap** (three copies — `CLAUDE.md:34`, `code/SKILL.md:93`, `css/caveats.md:15`; drop `code`'s). Flagged not judged: `fork-claude-session` is **314 lines, 28% of the corpus**, the only skill the retreat never touched. One contradiction: `layout/SKILL.md:49` "`rate()` = how good" vs `layout/caveats.md:14` "a clean page scores 100" for `analyze()`.

## 6. Recommendation

1. **Memory first** — `layout-design-skill.md` + `MEMORY.md:17` point at a deleted path and load every session.
2. **Repair `.claude/hooks/readme.md`** — the table row, and add `Skill` to the Wiring block.
3. **Prune the six absorbed entries**; add the mastermind diff (§4) so pruning has an owner.
4. **Apply one improvement** ("close the dev rail before you measure" → `layout`), **delete the three duplicated caveats**, **decline** the `width-used` rule. **Leave alone**: the ledger code, six skills' text, the attribution weakness.

Net: two renames, one readme repair — **nine deletions, one addition, one new rule declined.**
