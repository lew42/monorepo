# properties.js — Inspector and Rail Design Notes

The inspector shows live controls for the FOCUSED panel's words. Every mutation via `item.set(key, value)` followed by `repaint()`.

## Key Design Points

- **Listener safety:** Checks whether still in workspace; unbinds if not (dead closure prevention).
- **Document block:** Only in drawer (tools.js), not in-workspace inspector.
- **Split handling:** One row with two pictures (column/row direction); no `apply()` (tree changes).
- **Close button:** Only when sibling exists to receive space.
- **Position word:** Always last (determines meaning of size rows: flex basis in flow, declared box out of flow).
- **Template dropdown:** Since 2026-08-19, lands in top layer (nothing clips it); shows label + icon.
- **Apply dispatch:** Sends panel-focus event; restores scroll position after fill.
- **Rail sharing:** Stops bubbling on rows (shared rail has ext/layout listener).

## Field Groups

- Root words: shown only on SPLIT
- Group words: grouped() toggle (no stored value, computed)
- Live words: tone, display, mode-specific (gap/wrap/justify, dense, align, position)
- Size words: width/height (two axes, live axes only clickable)
- Self words: panel placement in slot (3x3 grid, live axes only)
- Item words: flex/grid children properties (when cell selected)
- Hand words: split and close (tree changes, no repaint)
- Document block: delete button (name check, confirm)

## Presets and Knobs

- Sow words: nine starting arrangements + dice roll (space/presets.js)
- Knob (range slider): pad/gap numeric values; inherits from cascade if not stored
