# Animation and prototyping through the Plugin API (2026-11-16)

Tested in Lew42 v2 on the page "Explore – 2600 layouts" ([node 34:475](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER?node-id=34-475)), through `use_figma` (the remote MCP, [mcp-servers.md](./mcp-servers.md)). Everything below was run, not read from docs.

## What works

- **Clicks that change a variant, with Smart Animate.** Wired and working for the Miller desktop set (Closed/Open), the Miller mobile set (List/Detail) and the Sidebar Layout Set (Open/Closed). Press play in Prototype mode to see them.
- **Reactions are written with `node.setReactionsAsync([...])`.** One reaction, one action:

```js
await node.setReactionsAsync([{
  trigger: { type: 'ON_CLICK' },
  actions: [{
    type: 'NODE',
    destinationId: dest.id,            // a SIBLING variant of the set the node sits in
    navigation: 'CHANGE_TO',
    transition: { type: 'SMART_ANIMATE', easing: { type: 'EASE_IN_AND_OUT' }, duration: 0.4 },
    resetVideoPosition: false,
  }],
}]);
```

- **Build the set.** Make each state a component, then combine them. Variant names are `Property=Value`:

```js
const set = figma.combineAsVariants([openComp, closedComp], page);   // names 'State=Open', 'State=Closed'
set.name = 'Sidebar Layout Set';
```

- **Put the reaction on a child inside the variant** (a button instance named "Toggle"), not on the whole variant. Instances of the set inherit it. An instance can override or clear its own reactions without touching the master (`node.setReactionsAsync([])` on the instance; restore with `node.setReactionsAsync(master.reactions)`).
- **Read what is wired:** `node.reactions` (a plain array you can log and diff).

## What does not work (exact errors)

| Tried | Error |
|---|---|
| `transition: {type: 'SCROLL_ANIMATE', ...}` | `Invalid enum value` (not a valid transition type through the API) |
| `CHANGE_TO` or `SCROLL_TO` to a node that is not a sibling variant | rejected: the destination must be a variant of the same component set (a different frame is `NAVIGATE`, not `CHANGE_TO`) |
| `SET_VARIABLE` with a value of the wrong type | type mismatch error (variable type and value type must agree) |
| `destinationId` that does not exist | `Invalid destination` style error |
| the old `action: {...}` field | rejected: use `actions: [...]` |
| a reaction with no `trigger` | rejected: `trigger` is required |
| `figma.currentPage.flowStartingPoints` entry on a variant | rejected: flow starting points must be top-level frames, not variants |

The exact wording varies slightly between calls; the shape of each failure above is stable. `setReactionsAsync` throws before changing anything, so a failed probe leaves the old reactions in place (one slip: calling it with `[]` on an instance clears that instance's own copy, which looks like losing the master's wiring; restore it from the master).

## How to structure variants so Smart Animate works

Smart Animate matches layers by **name and hierarchy**. So:

1. Every variant has the **same layers, same names, same order, same nesting**. Only sizes, opacity and positions differ. A layer missing in one variant fades in or out instead of moving.
2. **Open/close a sidebar** by keeping the sidebar layer in both states: a fixed-width, clipped wrapper going `width 480 → 0` and `opacity 1 → 0`. Do not remove the layer in Closed.
3. **Inner regions carry their own Scale mode in the master** when the set is cloned or combined, because the variants are not instances of one master. The instance placed on the page then carries XL on its outermost frame, per [modes.md](./modes.md). (This is an exception to "no modes inside a master": it is only needed where a combined set's inner regions must differ from the outer one.)
4. **Static layouts must not depend on animation.** Each state is a complete layout on its own. Sections 1–5 of the exploration page are static frames; the animation is an extra on top, and a reader who never presses play still sees every state.
5. Remaining quirk: in `State=Closed` the empty sidebar column (width 0) still adds half a gap to the neighbouring column because the parent's `gap` stays on. Wrap the sidebar in a clip frame that owns the gap, or animate the gap too.

## Notes from building it

- `figma.combineAsVariants` needs components as input; frames fail. Create variants with `figma.createComponent()` first.
- Auto layout after a set is combined can hold stale sizes: toggle `layoutSizingHorizontal` FIXED → FILL on the siblings and read sizes in a **later** `use_figma` call.
- `overflowDirection = 'VERTICAL_SCROLLING'` fails (`Expected 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'BOTH'`); the scrollable page card uses `'VERTICAL'`.
- Variables still bind normally inside variants (`squeeze` on `maxWidth` works).

## Recommendation

Use component sets named "<Layout> Set" with `State=...` variants and one `CHANGE_TO` + `SMART_ANIMATE` reaction on a named child. Keep the static state as the default variant. Do not rely on SCROLL or variable-driven animation through the API; set those up by hand in the Figma UI if ever needed. When a layout gets a toggle, build both states from the same builder function so layer names cannot drift.
