# F: task pages that read at a glance

Read first: [../common.md](../common.md), [../requirements.md](../requirements.md) (ask 9), [../owner-words.md](../owner-words.md) (the last section, the first paragraph).

**The owner:** "The checkboxes on the framework/ai/date/task-name ... look disabled and they're grayed out. So instead of looking like green check marks, like they're done, it looks like disabled checkboxes ... we do have the progress bars that stretch across 3440 pixels, underneath the steps section ... These grayed out checkboxes, I'm not sure what these are ... they don't link anywhere ... self-evident should be number one priority ... I kind of think having arbitrary content is often a better way ... each report is going to be structured differently."

Where it lives (from the survey): `ext/AITask/AITask.js` builds the tabs (Asks · Requirements · Report · Session; Report at about line 196, `outcome()` at about 307 renders `md(m.outcome)`). The disabled boxes are marked's task-list items (`ext/markdown/marked.esm.js` line 67 emits `<input disabled type="checkbox">`), and nothing styles them. Steps: `checklist()` at about line 331 and `segments()` in `ext/AITask/card.js` at about 77; the CSS is in `ext/AITask/ai.css` at 481 to 497.

## Deliverables
1. **Task-list items read as what they are, site-wide:** in markdown, `- [x]` draws a green check and `- [ ]` an empty ring, never a disabled grey box. Fix it once in `ext/markdown` (a renderer override or a CSS rule in its stylesheet), so every page gets it. Keep the input in the DOM if a screen reader needs it.
2. **The Report tab is free content:** the outcome renders as written (headings, links, pictures), with no template forced around it. Anything the old template added that the outcome doesn't say goes below a fold, or is dropped if no one would miss it. The first screen answers: what was asked, what was delivered, where it is.
3. **The steps bar keeps a sane width:** the segmented bar is capped to the text measure (or to about 40em), never 3440 wide. Each step row links to its log line or its deliverable when it has one.
4. Before and after shots of `/framework/ai/sessions/2026/09/30/design-code/design-code/` and two older task pages at 400, 1200, 1920 and 3440.

## Fence
`ext/AITask/` and `ext/markdown/` (the task-list rendering only). Keep v1 reachable (`?v1`).

Model: Sonnet.
