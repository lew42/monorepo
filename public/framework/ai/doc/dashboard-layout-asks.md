# Known problem: the AI page layout — asked 7 times

The AI page ([/framework/ai/](/framework/ai/)) keeps coming back too crowded: a tall toolbar, tabs that stack, little scroll boxes inside the scroll. Before you rebuild this layout, read what was asked and what was decided. The words are in [ai2/owner-asks.md](ai2/owner-asks.md) (the owner's own, verbatim); the headings below are its sections.

| # | When | What was asked | Where (heading in owner-asks.md) |
|---|---|---|---|
| 1 | 2026-09-17 | a toolbar per column — later called "a lot of UI" | A toolbar per column (old v3 board) |
| 2 | 2026-09-21 | the sticky hour box "looks broken" | The sticky hour box (old v3 board) |
| 3 | 2026-09-22 | "way too much" chrome, 200 px of dead space on top | Declutter: dead space, clutter, a hovering scrollbar, card grounds |
| 4 | 2026-09-21 | cards too big, "I have to scroll a lot"; compact list | (compact list, same file) |
| 5 | 2026-09-22 | two scrollbars | The "talk to this card" footer; two scrollbars |
| 6 | 2026-09-24 | "I don't like these independently scrollable areas" | One column, no little scroll boxes |
| 7 | 2026-10-19 | "the worst page I've ever seen": header + tabs + sticky toolbar ate ~80% of the screen, "waiting on you" scrolled inside the scroll, tabs stacked on a phone, no link to the tasks view | this note |

## What the page is now (2026-10-19)

- **One short toolbar.** The chips are one line that scrolls sideways (`rail/rail.css`, the block scoped to `.page--ai`).
- **No scroll inside a scroll.** "Waiting on you" is a plain section of the list; its old 45vh box (`ux/Browse/Browse.css`) is switched off on this page only.
- **Phone: one normal page scroll.** The toolbar scrolls away; the tabs are one line that scrolls sideways under the title.
- **Tasks has a tab** (`tasks/page.jsonl` setting), so nobody types the URL.
- The main site template is untouched; every rule is scoped to `.page--ai`.

Rule for the next person: if the AI page needs more controls, put them on a tab or one click down, not in the toolbar.
