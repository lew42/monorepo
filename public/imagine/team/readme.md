# Team — a sample kanban board, dragged with `ext/Draggable`

Six people, twelve tasks, four lanes. Pick a person on the left to see just their work;
drag a task between lanes on the board, or use the lane buttons on a person's own page.
The board is declared once and reused: it sits under every person as their own child, so
selecting someone opens *her* board rather than filtering a shared one.

## Use

Open [`/imagine/team/`](/imagine/team/) — there is nothing to import, it is a page tree.

## Watch out

- **The drag is `ext/Draggable`, not written here.** `page.js`'s `Chip` class supplies only
  the two things Draggable cannot know on its own: what a chip looks like mid-flight, and
  what a drop means (`assign_lane()`).
- **An empty lane needs `drag-items` for its min-height**, or a 0px lane can never take a
  card back — `page.js:229`.
- **Lanes and saved state persist per-browser** via `page.store()`, keyed on this page's own
  url — closing the tab loses nothing.

## More

- [`ext/Draggable/readme.md`](/framework/ext/Draggable/) — the drag mechanism itself.
- Files: `page.js` (the roster rail, the board, the `Chip` drag class), `team.css` (the
  board grid and lane styling).
