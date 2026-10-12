# Page.class.js split plan (plan only, no code moves)

**Owner (2026-10-12):** "What exactly is 2,000 lines in the Page class? That might be a mistake."

**Measured:** `core/Page/Page.class.js` is 2,270 lines: 926 comment (40%), 317 blank, 1,027 code, 151 methods. Biggest areas by section markers: page.jsonl replay and the three file steps (lines ~72-500), the six words, roles, link opening (~907), rendering (~1238, `render_content_list` 101 lines), related aside (~1474), columns, the Finder shape (~1526-1973, ~450 lines), preferences (~1973).

**Done when (tick each with proof):**
- [ ] The measuring script exists and its output answers the owner's question: what the 2,270 lines are (code vs comment vs blank).
- [ ] `core/Page/doc/split-plan.md` fits one screen and shows the target class tree in code, with a target size for `Page.class.js` (for example under 600 lines).
- [ ] Each move names its risk (callers) and its order, lowest risk first.
- [ ] The core/Page readme links `doc/split-plan.md`.
- [ ] `Page.class.js` is unchanged (`git diff` empty for it).

## Do (write, do not move code)
1. A script that measures each section and method (code vs comment lines) and lists which other files call each group of methods (a cheap import/call grep).
2. `core/Page/doc/split-plan.md`, one screen: for each group, keep in Page / move to a composed helper class (one file named for it, e.g. `Page.Columns`, `Page.Links`, `Page.Jsonl`, attached as statics or held by reference) / move to an extension. Aim for a Page class whose file a reader can scan. Show the target as a class tree in code. Name the risk per move (callers) and an order (lowest risk first). Comments: flag ones that are history, not explanation (candidates to move to `doc/`).
3. Link it from the core/Page readme. No changes to Page.class.js in this task; executing the split is a later task.

Sonnet 5.5; Haiku under 60k tokens for counting; commit; one-sentence chat replies; land with `finish-task`.
