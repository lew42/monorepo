# Proposed CLAUDE.md addition (needs the owner's approval)

Under "Cost and roles", add this one line:

- **One specific question per step** (the owner, 2026-10-15): AIs try to do too much at once; ask each agent one specific question or give it one small step. A readme is verified by a Sonnet minion that reads the code, asked one claim at a time. Detail: [ask-8f9c9d80](../ask-8f9c9d80.md).

The alternative was editing CLAUDE.md directly; it is edit-on-ask, so it waits here.

## Proposal 2 (voice 29c40ff7, 2026-10-15): rewording "Show the class"

Replace the "Show the class" paragraph (2026-10-08) with this; the old wording keeps its place in `claude-md-archive.md`. It drops "not a mass operation" as a limit and keeps it as a pace.

- **Every class gets a class page** (the owner, 2026-10-08, widened 2026-10-15): a link to a class shows the dark class card with its icon (`ext/Mention`), and the page shows the class name, core API and key properties beside a demo that instantiates it live, so its properties render in real time as you use it (`ux/Content/Object` instance view). A module page demos its real data structures (child pages, item lists, sentence lists), foundational modules first. Convert a class when you rebuild it, not in one mass pass. Detail: `.claude/skills/make/SKILL.md` section 4.
