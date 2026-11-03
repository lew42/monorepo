# Drag-and-drop builder: toolboxes matched to their target (owner, 2026-10-13)

The owner's idea: "for any two-column layout with different coloured backgrounds, put a panel to the left and to the right, the same width and colour as the layout's columns, with a large toolbox of pre-configured items that work well in that column. A dark empty left sidebar has a dark toolbox panel beside it; drag any child into the layout. On the right, a white or light-gray page area takes cards and text configured to that scheme… I think that's what I've been missing."

## How it works in Figma
- **A toolbox matches its target.** Each layout column gets a toolbox panel with the **same width, ground and Text mode** (and Resolution). Its items are built for that context: nav rows and a profile for a dark 280 sidebar, cards and prose for a light main.
- **Let modes inherit; don't set them on items.** An item that doesn't set its own Text mode takes its parent's, so an item dragged from a dark toolbox into a dark column looks right with no clicks. The only per-item choice left is the card's own fill, if it has one. This is simpler than a `Scheme` variant on every item. Use the variant only for an item that must carry its own ground (a card that stays light on a dark page).
- **Width class matters as much as colour.** A sidebar item is built for about 280–400; a main item fills 800+. Items stay FILL, so they also fit a slightly different width of the same class.
- **Drag:** Alt-drag copies from the toolbox (a plain drag moves the item out of it). Reorder by dragging inside the column.

## Open
Generalising to any colour and any width: the working rule for now is one toolbox per (ground, width class) pair. Whether a toolbox item should ever go to a mismatched target is still open; the owner leans towards "matched only".

## Verified (2026-10-13, [report](/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/builder.md))
On `Kit · Mobile builder` (`260:71518`): 27 blocks set no mode, so dragging them from a dark toolbox into the dark column (and from the gray and near-black ones) gives the right ink with zero clicks. **Play-well rule:** a change of ground is its own divider, so nothing goes between bands of different ground; bands of the same ground are separated by the blocks' own gap. Gaps found: a 280 sidebar is too narrow for Stat pair and Context pill.
