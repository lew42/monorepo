# Properties, variants, slots and grids: what Figma can do today (research, 2026-11-17)

This answers questions B and D of the [2026-11-17 brief](../brief-2026-11-17.md). It is research only: nothing in Lew42 v2 was changed. Each claim is marked **V** (verified in Figma's own docs or API reference), **T** (tested earlier in our own files, linked) or **R** (reported by a third party, not checked).

## The answer in five lines

1. **Properties give you variants without drawing them**, but only for four kinds of change: show or hide a layer (boolean), change a text (text), pick one component for a spot (instance swap) and fill an area freely (slot). A change to layout, structure or a style value needs a drawn variant, or a variable mode when the value can be bound.
2. **Variants do not inherit from each other** (V). The "base component" fix is real (T) but costs a layer, and big kits disagree on it.
3. **For icons, the native swap and the instance-swap property are the same swap.** The property only adds a dropdown on the parent. Kits use it; our rule 6 drops it, which is fine.
4. **Slots are finished and supported** (GA June 2026). Figma itself names cards and modals as the use case. A Card with one Content slot is the standard answer, not detaching.
5. **Grid gaps and padding bind to variables; column count and direction do not** (V). Kits switch column counts with wrap and a min width, or with one component per breakpoint, never with a variable.

## 1. What a property can express, and what needs a drawn variant

| Change | Property? | How |
|---|---|---|
| Show or hide a layer (icon, footer) | yes | boolean (V) |
| Different words | yes | text (V) |
| Which icon, which avatar | yes | instance swap, or a plain swap of the nested instance (V) |
| Any number of items, any content in an area | yes | slot (V) |
| Colour, padding, gap, radius, size | no property needed | a variable mode on the frame (V, see 6) |
| Layout direction, item order, alignment, Hug vs Fill, a different structure | **no** | a drawn variant, or a separate component (V: `layoutMode` is not bindable) |
| States (hover, pressed, disabled) | variant | Figma: variants are for "states or types" (V) |

Figma's own help says it plainly: "instead of creating variants for each state, apply a boolean property to the icon's layer visibility" (V). It also says teams once used variants as a "workaround to replicate slots", and slots now do that job better (V).

## 2. Variants don't inherit. Does the base component fix it?

- **True.** A new variant is "an independent copy … not linked" to the others (V, Figma forum answer). Selecting several variants and editing them at once is the everyday workaround (R).
- **Base component:** one master, placed as an instance inside every variant. An edit to the base reaches every variant and every instance. We tested it: setting the Image card base's radius to 32 changed the base, all 11 variants and every grid instance at once (T, [readme, Image cards](../../readme.md#image-cards-mine-2026-11-13)).
- **Its costs:** one more layer to dig through (the owner's own objection, readme Component strategy item 12). An override made inside one variant stops following the base for that property. A property of the nested base must be exposed to show on the parent. GitLab's Pajamas kit refuses base components on purpose, to keep the file small, keep updates isolated and keep overrides stable (V, their docs).
- **For us:** we have almost no variant sets (rule 6), so the problem barely exists. Use a base only for a set of 3 or more variants that share one shell.

## 3. Instance-swap property vs native swap

- **Native swap:** Ctrl/Cmd-click the nested icon, then swap it from the instance menu or Assets. It works on any nested instance and needs no setup (V).
- **Instance-swap property:** the same swap, moved up as a dropdown on the parent, with a short list of preferred values. It holds exactly one component, and its position can't change (V, Figma's tab-icon example).
- **What kits do:** Material 3, Untitled UI and shadcn put instance-swap properties on icons (R). For content areas, Material's kit used a placeholder "slot component" that you swap for your own local component before native slots existed (R). Kits are now moving content areas to native slots (R, [Nathan Curtis](https://nathanacurtis.substack.com/p/implementing-slots-in-a-figma-library)).
- **For us:** keep rule 6 (native swap only). It is one click deeper, but it adds nothing to the properties panel and nothing to maintain.

## 4. Slots today, and Card: slot, detach, or first-item master?

**Status (V):** open beta 5 March 2026, generally available on all plans in June 2026 ([plugin API update 2026-06-10](https://developers.figma.com/docs/plugins/updates/2026/06/10/update/)). Settings: preferred instances, "only allow preferred instances", minimum and maximum item counts, stretch an inserted child, start empty.

**Limits (V):**
- Slots can't nest inside slots.
- You can't add component properties to layers inside a slot, but instances you drop in keep their own properties.
- Structure (position, auto layout flow) changes only in the main component.
- Removing the slot property resets every instance's slot to the default.
- Count limits only warn; they never block.

**Limits we found ourselves (T):** a main component can't sit inside a slot. A Card can't contain a Card (Figma refuses the cycle). Loose layers edited in a slot make that instance own the whole slot, while an instance placed in the slot keeps following its master ([readme, Component strategy 3](../../readme.md#component-strategy-current-2026-11-12)).

| Option | Edit the shell once, all follow? | Freedom | Cost |
|---|---|---|---|
| **Card component with one Content slot** | yes (radius, padding, fill) | any content | one layer deeper |
| Default Card you detach | **no**, every copy is on its own | total | drift; exactly what Figma built slots to stop (V) |
| First item of a repeated grid is the master | yes, inside that one grid | as the master allows | a master on a working canvas; it can't sit in a slot |

**When something should be a component at all:** when it is placed twice or more, or swapped. A one-off is a frame (rule 6). Figma's slot guidance is the same: componentize the shell, leave the content free.

## 5. Grids

- **Grid auto layout** (Config 2025, now standard): you set the column and row count, tracks are Fixed, Fill (fr) or Hug, and items can span cells (V). There is no `auto-fill` / `auto-fit`, so it never changes its column count by itself (T).
- **Bindable (V, [VariableBindableNodeField](https://developers.figma.com/docs/plugins/api/VariableBindableNodeField/)):** `gridRowGap`, `gridColumnGap`, padding. **Not bindable:** `gridColumnCount`, `gridRowCount`, `layoutMode`. One blog claims column count takes a variable; the API list says it doesn't. On an instance, a changed column count is silently ignored (T, readme, Live responsive previews).
- **How kits switch 1/2/3/4 columns:**
  - layout guides for reference only (Untitled UI: 12 columns at 1440, 6 at 768, 4 at 375; V, their docs);
  - auto layout frames for the real layout;
  - a separate layout, or a `Breakpoint` variant, per size (R; Material's 5 breakpoints, V).
  - Wrap plus a min width is the one way that reflows by itself. In our test the same row went 1, 1, 1, 2, 4, 5, 6, 6 columns across 8 widths (T).

## 6. Padding, gap, radius: modes instead of variants

Confirmed (V): padding on each side, gap (`itemSpacing`, `counterAxisSpacing`), every corner radius, width and height, min and max sizes, stroke weight, opacity, visibility and text can all be bound to variables, so a mode switch changes them. It is what our Scale collection already does.

The limits:
- direction, wrap, alignment and Hug/Fill can't be bound;
- the nearest explicit mode wins (T, [modes.md](../modes.md));
- a text style overrides a bound font size (T);
- a collection caps its number of modes by plan (we hit 10, T).

## Use this / not this (Lew42 v2)

| Use this | Not this |
|---|---|
| Variable modes for colour and size | colour or size variants |
| Boolean for an optional part | a variant "with footer" / "without footer" |
| A slot for a content area | detaching the Card, or a variant per paragraph count |
| Native swap for icons | an instance-swap property per icon (rule 6) |
| Variants only for atom states (Button) | permutation grids |
| Wrap + min width bound to `card-min` for responsive rows | a column-count variable (doesn't exist), column-count variants |
| Grid layout when a fixed count and equal row heights matter | Grid layout to "be responsive" |
| A base component only for a set of 3+ variants sharing a shell | a base under every component |

## What this means for Lew42 v2

1. **Card stays a component with one Content slot.** Set the five `Content /` blocks as its preferred instances, with "only preferred" off. This is the case Figma built slots for, and it keeps radius, padding and fill editable in one place. Show it on the Index with default content. **Don't detach.** If a design needs a different shell, it is a one-off frame (rule 6), not a detached Card.
2. **Repeated grid: put one content master inside Card slots, and keep the first-item master only as a fallback.** Each grid item is a Card whose slot holds one instance of the same content master. Edit the content master and every item follows. This was tested on 2026-11-12 (option D, readme Component strategy 3). The first-item convention (readme item 8) is still fine for a repeat that lives in one design only, with two caveats: the master must sit in a plain layout frame, because a master can't sit in a slot, and it should be named "(master)" so an agent sees it. It is never used on the Index.
3. **No variant sets beyond atom states, and no base components for now.** Revisit only when a set reaches 3 or more variants sharing a shell.
4. **Grids:** keep wrap + min width as the default (rule 8). Use Figma Grid only for a fixed count. Don't wait for a column-count variable.

## Sources

- Figma Help: [slots](https://help.figma.com/hc/en-us/articles/38231200344599-Use-slots-to-build-flexible-components-in-Figma) · [slots vs instance swaps vs variants](https://help.figma.com/hc/en-us/articles/38741465279895-The-difference-between-slots-instance-swaps-and-variants) · [slots fundamentals](https://help.figma.com/hc/en-us/articles/39745565646871-Components-collection-Slots-fundamentals) · [component properties](https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties) · [grid auto layout](https://help.figma.com/hc/en-us/articles/31289469907863-Use-the-grid-auto-layout-flow)
- Figma API: [2026-06-10 update (Slots GA)](https://developers.figma.com/docs/plugins/updates/2026/06/10/update/) · [VariableBindableNodeField](https://developers.figma.com/docs/plugins/api/VariableBindableNodeField/)
- Figma forum: [variants are independent copies](https://forum.figma.com/ask-the-community-7/changes-to-default-variant-doesn-t-apply-to-other-variants-35611) · [grid gap variables](https://forum.figma.com/ask-the-community-7/variable-option-for-gap-in-grid-layout-40309) · [direction as a variable, requested](https://forum.figma.com/t/please-add-auto-layout-direction-as-a-variable/48086.rss)
- Kits: [GitLab Pajamas (no base components)](https://design.gitlab.com/get-started/uik-components) · [Untitled UI grids](https://www.untitledui.com/components/grids-spacing) · [Material 3 slot components](https://m3.material.io/blog/material-3-slot-components-figma) · [Material breakpoints](https://m3.material.io/foundations/layout/applying-layout) · [shadcn on slots](https://www.shadcndesign.com/blog/figma-slots-explained-better-design-systems) · [Nathan Curtis, slots in a library](https://nathanacurtis.substack.com/p/implementing-slots-in-a-figma-library)
- Our tests: [Figma readme](../../readme.md) (Component strategy, Image cards, Live responsive previews, Grids) · [modes.md](../modes.md) · [slot-vs-swap-demos.md](../slot-vs-swap-demos.md)
