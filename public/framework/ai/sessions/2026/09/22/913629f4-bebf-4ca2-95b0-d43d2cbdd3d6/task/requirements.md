# skills-shrink-2 — apply the skill changes that have been written twice and applied never

Minion: Opus, effort high. Session id `913629f4-bebf-4ca2-95b0-d43d2cbdd3d6`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then phase-2 item
**10** in [`../tiers-design/doc/phases.md`](../tiers-design/doc/phases.md), the table and lean
sets in [`../tiers-design/doc/skills.md`](../tiers-design/doc/skills.md), and the seven changes
in `ai/2026-09-19/system-eval/changes.md`. The `skill-creator` skill is available if it helps;
the house rule is the `mastermind` skill's "Skills improve themselves" section — read it before
you cut anything.

⚠ **The Write and Edit tools refuse any path under `.claude/` in a headless session.** Write
each new file to your task dir or the scratchpad and install it with a small node script run
via Bash (the minion skill's never-list says exactly this). Verify every installed file by
reading it back.

## What the owner said

Section **H** of the brief: "Audit what exists. Define role skills loaded on spawn … Separate
always-loaded 'don't forget X' skills from on-demand ones, and keep the always-loaded set lean."
The audit exists twice (09-19 and today). A minion loads **427 lines** before it writes
anything; tiers-design's lean set is **128**. Nobody has applied anything.

## Deliverables

1. **Apply, in this order, and log each with before/after line counts:**
   - 09-19 change **4** — the append helper replaces the encoding/clock/re-parse prose in
     `new-task`, `finish-task`, `minion`, `code` §7 (each passage becomes one line naming
     `append.mjs`; the stories stay reachable by a link to the task that holds them).
   - 09-19 change **5** — every ⚠ paragraph in `minion`, `mastermind`, `new-task`, `code`
     becomes one sentence naming the trap and the check, plus a link to the task log that holds
     the story. **Detail is never deleted** — if a story has no task log to link, leave the
     paragraph.
   - 09-19 change **2** — the Agent-tool-era passages in `mastermind` (the foreground rule for
     Agent-tool sub-masterminds, `SendMessage` to parked workers, transcripts vanishing) become
     two lines pointing at `tiers-design/doc/roles.md` and the `sub-mastermind` skill — Servex
     now hosts sub-masterminds and the wake is proven (`sub-mastermind-live`).
   - 09-19 change **1** is **superseded**: the launch recipe is now `spawn_agent` on Servex's
     `/mcp` (`Servex/agents/readme.md`); the CLI recipe stays as the fallback. Rewrite the
     mastermind skill's "A minion is a CLI session" section to say so in under 15 lines.
   - tiers-design `skills.md`'s lean always-loaded set per role: make `minion` load only what
     it names as always-loaded, moving the rest behind a link ("read X when Y").
2. **Do not touch what a skill decides.** Rules the owner chose (numbers, never-lists earned by
   breakage), and 09-19 change **3** (who owns the improvements loop) are decisions — write a
   `decision` line with your recommendation and leave the text. Anything you are unsure is
   fail-safe: leave it, log it.
3. **The numbers, two that must agree:** lines loaded by a fresh minion before its first write
   (sum of `minion` + `code` + `new-task` + whatever `minion` still tells it to load), before
   and after — measured by `wc -l`, and again by a second method (a script that follows the
   load instructions). Target ≤ 200; say what stopped you if it is more.
4. **Prove nothing broke:** every edited `SKILL.md` still has valid frontmatter (name,
   description) and the Skill tool lists it (`claude -p "list your skills" --model
   claude-haiku-4-5-20251001 --effort low` with the CLI recipe from the run ledger — the names
   appear); one Haiku minion launched with the CLI recipe on a two-line brief in your task dir
   ("load the minion skill, write hello.txt in this dir, land") still lands correctly.
5. **One page — `ai/2026-09-22/skills-shrink-2/page.js`:** the before/after table per skill,
   the two load-line numbers, what was left as a decision. Link it from `ai/2026-09-22/page.js`
   `children:`.

## Fence

`.claude/skills/{minion,mastermind,new-task,finish-task,code}/SKILL.md` (via the install
script), each of their `improvements.md` (delete an entry you applied), your task dir,
`ai/2026-09-22/page.js` `children:`. Not `every-prompt`, `master-assistant`, `sub-mastermind`,
`log-assistant` (fresh today), not CLAUDE.md, not settings. Append-only to `.jsonl`.

## Length

Landing report: eight sentences with the two numbers.
