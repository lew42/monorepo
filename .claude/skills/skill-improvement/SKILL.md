---
name: skill-improvement
description: Run the moment a skill lets you down — it told you something wrong, was silent about a trap that then bit you, cost you a wrong turn, or you worked around it. Also when anything surprises you and the surprise was preventable. Thirty seconds; one line appended to that skill's improvements.md. Trigger skill.
---

# Skill improvement

**Something unexpected happened. Ask why, then write the answer where the next agent reads it.**

An unexpected result is two defects: the thing itself, and whatever let you walk into it. Fix
the thing. Then spend thirty seconds on the second one — that is the only way this system gets
better instead of merely bigger.

## The one action

Append **one line** to `.claude/skills/<skill>/improvements.md`, in whatever shape the lines
already there take — read the last two first; the files have drifted and matching beats the
header. Most read `- YYYY-MM-DD (task): what should change, and the evidence.`

Evidence, not opinion: name the file, the measurement, the defect it would have prevented.
"the ladder should mention X" is worth nothing; "`pre > code` reset padding and background but
not box-shadow — the skill never says a reset must list every property the base rule sets"
is worth everything. A recurring line is a rule waiting to be written.

## Which skill

The one that **should** have warned you, not the one you happened to be running. A CSS surprise
goes to `css`; a naming collision to `new-css-class`; a page that 404'd to `new-page`. If no
skill covers it, put the line in the closest one and say a new skill may be needed — the owner
promotes.

## Then

- **Applied it to the SKILL.md? Delete the entry.** Six of eight were stale for want of this.
- Fail-safe changes may be applied straight to the SKILL.md — see `mastermind` for what counts.
- Anything that changes what a skill *decides* is a proposal, not an edit. Ask.

Improve this skill: append to [`improvements.md`](improvements.md).
