# Review: CLAUDE.md consolidation (87afbdd55 -> f830e4a08)

Checked the 24 reworded sentences against the old rules, plus drops, conflicts and strength. Most are faithful. These changed meaning or strength:

1. **L54.1 (Write classes) — stricter.** Old: "a small helper class may live in its parent's file". New: "one class per file", with no exception. Fix: restore the clause, or move it to `ai/doc/classes.md` and say so.
2. **L12.10/L12.11 (record the dictation) — narrower.** Old: write "notes, legitimate questions, tradeoffs or implications". New: only "the essence of the dictation". Questions and tradeoffs are no longer named. Fix: re-add "(notes, questions, tradeoffs)".
3. **L12.13 "Superceded docs can be deleted" — dropped on purpose.** The manifest notes a conflict with Never destructive, and the archive keeps the original. The weaker "files are what survive" stays. Fine, but the owner should know a rule was deliberately removed.
4. **L46.3 "Treat this file as the root readme; the core docs index every system" — dropped.** Nothing equivalent is left, though "Docs point" still says "This file and every readme.md". Fix: move it to `ai/doc/readmes.md`, or restore a short clause.
5. **L32.2 "(many AI-system pieces are not yet classes and should be)" — dropped.** It was an instruction to convert them, so the softer text ("prefer a class") loses it. Fix: restore the parenthesis.
6. **L56.2 debug view — less specific.** The "renders every property by type" and "watch the data change" detail is gone from CLAUDE.md. L56.3 is in `classes.md`. Fix: link or restore a clause.
7. **L42.2 Haiku chunking — shorter.** "Sized to fit with room for the reply" is dropped. Fix: re-add it.
8. **L30.2 — "(text link first; embedded previews later)" dropped.** It is a minor hint. Fix: optional.

No two kept rules conflict. No "never/always/must" got softer or harder, apart from item 1. "Link every mention" and "Everything is linked" merged cleanly. L97 References is covered by the `#Page @agent /path` clause.
