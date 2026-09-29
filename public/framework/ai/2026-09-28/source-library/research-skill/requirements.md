# The research skill: one rule for where a lesson lives

Load the `minion` skill first. Your parent task (read it, and its links, before touching
anything): `public/framework/ai/2026-09-28/source-library/requirements.md` — piece 3 of that
brief is yours. Background: `.../agent-work-on-every-page-sanity-checks-c/design.md` — the
`Lesson` row of the "Added" table: *"filed in the `doc/` of the module it is about, citing
its sources."*

**Work in the shared worktree:** `C:\Code\lew42\worktrees\source-library`. This is a small,
low-risk text edit — you don't need the dev server for it, but do your edit there so the
mastermind's single merge covers everything.

## Your fence

- `.claude/skills/research/SKILL.md` — one new section
- Nothing else. Don't touch `ext/Research/`, don't touch any module's `doc/`.

## The rule to add

A short section, right after "## 5. The presentation picks it up by itself" (ends around
line 106) and before "## Traps" (line 108) — read both neighbors first so your section's
voice matches (short, plain sentences, an example over an explanation, per this repo's
root `CLAUDE.md`: "clear beats brief"). State:

- A lesson learned while researching — something worth remembering, not just a source to
  cite — goes in the `doc/` of the module it's ABOUT, as a normal doc page, citing the
  source(s) it came from (link to `public/framework/sources/<topic>/<slug>.md` when the
  source was saved there — that's the sibling task building the library; if it isn't there
  yet, a plain url is fine).
- Only a lesson with NO module to belong to — a cross-cutting finding, a fact about the
  world rather than about this codebase — goes to
  `public/framework/sources/<topic>/lessons.md` (append, one lesson per heading; don't
  rewrite the whole file for one addition).
- One sentence on why: a lesson buried in a research log is read once, by whoever wrote it;
  a lesson in the module's own `doc/` is read by the next agent who touches that module,
  which is the actual point of writing it down.

Keep it to 5-10 lines. This is a pointer, not an essay — the file's own opening line says
"docs point, they don't explain" and this skill file already keeps every section that
short.

## Proof

- [ ] the new section reads naturally between its neighbors (paste the 3 section headings
      around it in your report)
- [ ] a `grep` of the file afterward shows no other section broken (headings still
      `## 1.` … `## 5.` … your new one … `## Traps`, in order)

When done, log a `log` line to `task.jsonl` beside this file with what you added, and tell
your mastermind (`task-mastermind-source-library`) rather than merging yourself.
