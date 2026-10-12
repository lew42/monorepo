# The skills — who loads what, and what it should cost

**The finding in one sentence: a minion today reads about 430 lines of skill text before it writes
anything, and two shrinks that were already written down in September would bring that to 128.**

There are 19 skill dirs and **2,802 lines** of skill text (SKILL.md plus every side file),
measured 2026-09-22. `CLAUDE.md` is another 43, and every agent gets those.

## Every skill

"Loaded by" is the role, under the six-role design. "When" is always-loaded (on spawn, before the
agent does anything) or on-demand. Verdicts continue the
[2026-09-19 audit](/framework/ai/2026-09-19/system-eval/), which ranked seven changes and applied
none of them.

| skill | lines | loaded by | when | verdict | one reason |
| --- | --- | --- | --- | --- | --- |
| `mastermind` | 405 | master-mastermind | always | **split in two** | most of it is how to run ONE task — that is the new `sub-mastermind` skill, not the executive's |
| `layout` | 336 | minion | on demand | **split** | the five questions and the measure cycle earn every line; six owner-dated design essays are documentation wearing a skill's clothes |
| `fork-claude-session` | 325 | mastermind tiers | on demand | **shrink to ~120, rename `sessions`** | half is cache economics and a stale model table; step 1 dies once a script mints every id |
| `ui-test` | 287 | minion | on demand | **shrink to ~130** | 120 of its lines are two trap sections; they become `traps.md`, loaded when a trap bites |
| `css` | 201 | minion | on demand | **shrink** | `strategy.md` restates the SKILL's own §2–§4; §1 is one 25-line paragraph stitching seven incidents |
| `code` | 184 | minion | on demand | **keep, shrink §7** | §1–§6 and §8 earn every line; §7 is ~90 lines of dated stories that belong in the task logs they came from |
| `every-prompt` (+4 files) | 150 | fast assistant | always | **keep** | the only skill re-read every prompt, and short on purpose; its doorbell should ring a session id, not a tab name |
| `research` | 129 | a research minion | on demand | **keep, −5** | one warning is from the in-process-subagent era |
| `new-task` | 114 | minion, task mastermind | always | **shrink to ~45** | 40 lines of BOM, heredoc and clock traps that `append.mjs` now handles mechanically |
| `check-claude-usage` | 106 | master-mastermind | on demand | **shrink to ~30, one copy** | two copies exist, its pacing rule contradicts the mastermind's, and every headless run reports the numbers for free |
| `documentation` | 94 | minion, task mastermind | on demand | **keep, shrink §3** | two route paragraphs are trivia for one caveat line |
| `finish-task` | 88 | minion, task mastermind | on demand | **keep, §3 → 3 lines** | §3 is the same encoding traps `append.mjs` replaced |
| `auditor` | 87 | master assistant | on demand | **merge into `master-assistant`** | one role wearing two skills, and nobody else ever loads it |
| `minion` | 86 | minion | always, first | **shrink to ~40** | nine incident stories, five of them written in another skill as well |
| `new-css-class` | 60 | minion | on demand | **keep, dedupe** | the `classify()` trap is written twice, in steps 3 and 4 |
| `master-assistant` | 60 | master assistant | always | **keep, rewrite three lines** | it says Opus and "never edits"; the owner said Fable, fixing the system when it fails |
| `new-page` | 48 | minion | on demand | **keep, shrink step 3** | three warning paragraphs are one line and a link |
| `skill-improvement` | 42 | every role | on demand | **keep** | cheap and right; the half that is not running is *applying* an entry and then deleting it |
| `assistant/` | 5, no SKILL.md | nobody | — | **retire** | a leftover forwarder; the 18 files naming it are all landed briefs and logs |
| `sub-mastermind` | **NEW ~75** | task mastermind | always | **create** | the role has no skill, so today it reads the 405-line executive skill and follows the wrong half |
| `log-assistant` | **NEW ~45** | log assistant | on conflict | **create** | the conflict-resolution role the owner named has nowhere to live |

## The lean always-loaded set, per role

The aim from the brief was a minion under 400 lines always-loaded. It is met — and comfortably —
by the two shrinks already specified above, and by nothing else.

| role | always loaded | lines | + `CLAUDE.md` |
| --- | --- | --- | --- |
| fast assistant | `every-prompt` + `tiers.md` | 74 | 117 |
| master assistant | `master-assistant` (with the auditor merged in) | ~75 | ~118 |
| master-mastermind | `mastermind`, executive half | ~150 | ~193 |
| task mastermind | `sub-mastermind` + `new-task` shrunk | ~120 | ~163 |
| **minion** | `minion` shrunk + `new-task` shrunk | **~85** | **~128** |
| log assistant | `log-assistant` | ~45 | ~88 |

For comparison, a minion today loads `minion` (86) + `new-task` (114) + `CLAUDE.md` (43) = **243
before it starts**, and `code` (184) the moment it edits a `.js` — **427**. Add a size and a
style and it is 964. The craft skills stay on demand under the new set, so a JS task is 128 + 184
= 312, still under the 400 aim with the whole `code` skill loaded.

## Proposals — changes to existing skills

Running minions are reading these files right now, so nothing here was edited. Each is a proposal
for the master assistant, which owns the skills.

1. **Split `mastermind` in two.** The executive half keeps: the budget rule, "decide, don't ask",
   prioritizing, the report and the cards, the step-back cadence, survival and boundaries —
   about 150 lines. Everything about running one task moves to `sub-mastermind`: the spawn verbs,
   the model ladder, "minions keep their context", and the whole `Briefs` section, which is the
   single biggest block in the file and is entirely about one task.
2. **Apply the four unapplied audit changes** — one script that starts, messages and forks
   sessions and writes the launch line before the process exists; deleting the in-process-subagent
   era from `mastermind`; `append.mjs` replacing ~55 lines of encoding prose; and the trap rule
   (name the trap, name the check, link the story), which is worth about −280 lines on its own.
3. **`minion` gains one line and loses several:** your parent is your task mastermind. Report to
   it, not to the owner and not to the board.
4. **`every-prompt`'s routing paragraph becomes the registry lookup** described in
   [coordination.md](coordination.md) — post the card, match `topics` and `page`, and route up on
   anything ambiguous.
5. **Retire `.claude/skills/assistant/`** once `ledger.mjs`'s marker string drops the old name.

## The two new skills, written

Both exist as real skill dirs, in the house voice, short:

- **`.claude/skills/sub-mastermind/SKILL.md`** — one task, end to end: read the page, decide the
  worktree, fence the minions, run them in the foreground or as events, judge against the owner's
  sentence, land, report three messages.
- **`.claude/skills/log-assistant/SKILL.md`** — woken only on a naming conflict, appends one
  `verdict`, never does a mechanical append.
