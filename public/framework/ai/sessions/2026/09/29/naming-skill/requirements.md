# Naming mastermind: research naming practice and strengthen the `naming` skill

**The owner's words:** `ai/2026-09-29/item-ui/owner-words.md`. The current skill is `.claude/skills/naming/SKILL.md`, made today and short.
**The owner's asks, each a deliverable:**
1. **Their rule of thumb** leads the skill: simple, clear, and can't be misread as something else.
2. **Renaming can be a big improvement.** Say when to rename, and how to do it safely (a grep for callers; the "ask first" rule for a dozen-caller rename in CLAUDE.md).
3. **Naming covers the whole API**, not one word: the method names, the arguments, and how a call reads in flow. Add a step that writes the call site first (`thing.View`, `track(x)`) and reads it aloud.
4. **Several minions propose and vote.** Wire the skill to `Server/collab.mjs` and `Server/decide.mjs` (the `decide` skill), and don't hand-roll a vote.
5. **Where it lives:** its own skill, or a section of the `code` skill (the OOP section; item-ui adds `Thing.View` and `track` there)? Decide with `decide.mjs`, with a confidence, and name the alternative. It overlaps JS and CSS (`new-css-class`).

**Light web research** (the research skill §0): 4–6 good sources on naming practice, such as API design guides, Kent Beck and Martin Fowler on naming and renaming, the Google and Apple API guidelines, and "Naming Things" by Tom Benner. Save them to the source library as markdown with metadata. Record how it was decided: the sources, the votes and the decision line, in the task dir.

**Proof:** run the new skill once on a real open naming question (ask page-system or item-ui for one), and show the candidates, the vote and the pick. Land: finish-task, and one line on card live. Model: Sonnet, medium; minions Sonnet, low. Fence: .claude/skills/naming/**, one pointer line in .claude/skills/code/SKILL.md, public/framework/sources/** (new files only).
