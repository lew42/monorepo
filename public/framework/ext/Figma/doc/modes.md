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

On the exact layer that should change, never on a wrapper that also holds labels (a mode cascades into the labels too). **Masters carry no explicit modes**, so they render at the default.

## Scale in the v2 file

The v2 file's Scale is cut down to `pad-x`, `pad-y`, `gap`, `radius` and `squeeze` (`squeeze` is the max content width, formerly `content-max`). The aim is to try one padding set plus size modes first, and add escape hatches only where a layout breaks.

## Findings

Open question: which layouts break when everything switches together. To be tested; nothing recorded yet.
