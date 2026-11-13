# Modes: what a switch moves, and how to move less (owner, 2026-11-13)

Strategy summary: [Component strategy, item 6](../readme.md#component-strategy-current-2026-11-12). This page is the detail.

## The core fact

A mode switches **every variable in its collection**, on the layer you set it on and on everything inside it. One switch, all of them move together.

- That is the point when you want a whole card or section to resize (padding, gap, radius and button size follow Scale together).
- It is the risk when you only wanted one value (say padding but not gap): you can't get that from the mode alone.

## The escape hatches

- **(a) Override on the layer.** Unbind the value and type a number. Quick, but that layer no longer follows any mode.
- **(b) Give a child its own mode.** A child's explicit mode beats the parent's, so one part of a card can stay put while the rest switches.
- **(c) Split a value into its own collection** (e.g. `Pad`) for an independent switch. Cost: one more switch to set on every frame that needs it.
- **(d) Fixed named tokens** (`pad-sm`, `pad-md`, `pad-lg`) in a one-mode collection, bound directly. No mode, so no cascade; you pick the token per layer.

## Where to set a mode

**The nearest explicit mode above a layer wins**, whether it was set in the master or on the instance. An instance override on a layer beats later master edits to that same layer.

**Practice (owner, 2026-11-13): set NO modes on layers inside a master, and set the size mode only on an instance's OUTERMOST frame.** Keep labels outside the instance so they don't scale. Master edits, including newly added layers, then follow at the instance's size. Masters carry no explicit modes, so they render at the default.

**Superseded 2026-11-13:** "On the exact layer that should change (e.g. the card inside an instance), never on a wrapper that also holds labels." Setting the mode on an inner layer is what causes case 4 below.

## Scale in the v2 file

The v2 file's Scale is cut down to `pad-x`, `pad-y`, `gap`, `radius` and `squeeze` (`squeeze` is the max content width, formerly `content-max`). The aim is to try one padding set plus size modes first, and add escape hatches only where a layout breaks.

## Findings

**Mode cascade: who wins?** ([V2 Scale page, 5 cases](https://www.figma.com/design/ADpu9u2V0BlEZfR3rrMfER/Lew42-v2?node-id=19-449), 2026-11-13). The rule: the nearest explicit mode above a layer wins, set in the master or on the instance; an instance override beats later master edits to that same layer.

- **Case 4 (the surprise):** the master set SM on its inner cards, and the instance set LG on the Stack around them. The cards stayed SM, because their own mode is nearer.
- **Case 5 (the practice):** no modes inside the master; the size mode only on the instance's outermost frame, labels outside. Master edits, new layers included, follow at the instance's size.

Still open: which layouts break when everything switches together.
