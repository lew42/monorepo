# Figma troubleshooting: problems we hit and how they were solved

One dated entry per problem: what happened, why, the fix. Read this only when something goes wrong; the everyday recipe is [use-figma.md](use-figma.md).

## 2026-10-20 · An empty slot is 100 px tall in the main component

**What:** `Card / Session` and `Card / Project` ran ~300 px tall with nothing in them, and the project's accent edge ran far past its content.
**Why:** a SLOT with no children keeps a 100 px placeholder height; `layoutSizingVertical = 'HUG'` does not shrink it.
**Fix:** accept it on the main component (it is the drop area), and hide empty slots in every instance (`slot.visible = false`). Instances with content hug normally.

## 2026-10-20 · Checkbox labels clipped at 400

**What:** long task names in kit `Checkbox` instances ran past the card edge.
**Why:** the kit's label is `WIDTH_AND_HEIGHT` (hugs); a FILL instance does not make its label wrap.
**Fix:** set the instance and its `Label` text to FILL, then `textAutoResize = 'HEIGHT'`. Run it once over the finished frames and count how many changed: a fix inside a builder silently missed 13 of 140.

## 2026-10-20 · A faint fill rendered dark brown

**What:** segments and chips meant to be a faint grey (`dark` at 12% opacity) drew solid dark brown.
**Why:** `figma.variables.setBoundVariableForPaint(paint, "color", v)` returns a new paint, and the bound variable's colour replaced the paint's opacity in practice.
**Fix:** use a plain light grey for faint fills (or one of the approved alpha-overlay grounds from use-figma.md), not a variable at reduced opacity.

## 2026-10-14 · "The Figma tool call limit"

**What:** with six agents calling `use_figma` at once, three hit the limit within 40 minutes ([observations.md](observations.md)).
**Fix:** one Figma agent at a time.
