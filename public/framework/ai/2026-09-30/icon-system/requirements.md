# Icon system: one way to size, frame and lay out icons: requirements

The owner's words are in `owner-words.md`; read them in full. Suspected: too many custom implementations of icon layout CSS, and vertical alignment keeps breaking.

## Asks
1. **An audit** (cheap Sonnet or Haiku minions): every icon use on the site (Material Icons; the `icon()` factory and its callers), and the CSS that lays each out: padding on the icon or its parent, width and height, line-height, vertical-align or flex alignment, and background and hover. Group them into patterns, and count the one-off implementations. As a table, with screenshots of the misaligned ones.
2. **The facts first:** are Material Icons fixed width? When does an icon need a FRAME (a fixed em-sized box, centred both ways), and when not? The frame's size must come from the font size (em), so increasing the container's font size scales the icon, the frame and the padding together.
3. **One system, with a demo of each** (reuse ui/ and item-ui's icon items; keep new CSS minimal):
   - an icon alone (no frame / framed);
   - an icon BUTTON: flush (no background), with a background, a hover background, and a TOGGLE (on = lit background, off = dim);
   - a RAIL of icon buttons, mixed flush and backed;
   - ICON ITEMS in a list: with and without a background. With a background it needs padding; without one, gap only. The hover background's EDGE must line up with the parent's edges and padding.
   Everything aligned vertically and horizontally at 3 font sizes.
4. **Migrate the worst offenders** to the system (the top one-offs from the audit); list the rest.
5. A short "icons" section in the css skill (through the Servex architect; send it the text).

## Rules
Keep v1 reachable. Use a pool worktree, the smoke test, merge.mjs, one fresh reviewer, and screenshots at 400 and 1920. At most 2 minions; budget about $12, hard. Coordinate with task-mastermind-item-ui's icon items (it has landed; build on it).

