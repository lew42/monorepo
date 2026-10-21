# Figma troubleshooting: problems we hit and how they were solved

One dated entry per problem: what happened, why, the fix. Read this only when something goes wrong; the everyday recipe is [use-figma.md](use-figma.md).

## 2026-10-20 · A faint fill rendered dark brown

**What:** segments and chips meant to be a faint grey (`dark` at 12% opacity) drew solid dark brown.
**Why:** `figma.variables.setBoundVariableForPaint(paint, "color", v)` returns a new paint, and the bound variable's colour replaced the paint's opacity in practice.
**Fix:** use a plain light grey for faint fills (or one of the approved alpha-overlay grounds from use-figma.md), not a variable at reduced opacity.

## 2026-10-14 · "The Figma tool call limit"

**What:** with six agents calling `use_figma` at once, three hit the limit within 40 minutes ([observations.md](observations.md)).
**Fix:** one Figma agent at a time.
