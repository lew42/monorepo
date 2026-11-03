39 lines, one `@layer theme` block — the smallest file in the module and the only
one with nothing outstanding against it.

## `--panel-height` is the seam with `ext/Panel`

`.editor` sets it once; `ext/Panel`'s workspace reads it to size the whole
five-region shell. The editor never touches panel layout beyond that one custom
property.

## Selection is an outline, not a border

`.editor-node.on` — chosen because an outline does not participate in layout, so
selecting a node cannot itself shift anything else on the canvas.

## Improvements

1. **None outstanding.** Five rules, each with a one-line comment saying why it
   exists, all inside the required `@layer theme`. Worth naming as the example
   other `.css` files in this module set (there are none — this is the only one)
   should match. *(n/a)*
