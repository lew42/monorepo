# Brief: build the site's UI as a Figma kit (shared by three minions)

The owner wants Figma and the site to share one design system: design in Figma, approve, then code. Your job is ONE group of the site's components, drawn in Figma as reusable pieces, mobile first. Read this whole brief, then `public/framework/ext/Figma/doc/use-figma.md` (the rules we learned today; follow them).

## Where

- Figma file `QYN0G2URSBHYH5I06MOjxU` (Sept-2026). Work ONLY on your own page (create it, named in your prompt). Never edit other pages, the variables, or the text styles.
- The site source you study: `public/framework/ui/<name>/` (markup + CSS) and `public/framework/ux/<Name>/`. Read, never edit. Screenshot a live page if useful: `mcp__site__shot` with `http://monorepo.localhost/framework/ui/<name>/` at width 390.
- The repo: write only your report, `public/framework/ai/sessions/2026/10/12/session-f155ecbd/figma-claude-designs/kit/<your-page-slug>.md`. Commit it by path (`git commit -- <path>`); never `git add -A`.

## Before the first `use_figma` call

Load the skill: `ReadMcpResourceTool` server `figma`, uri `skill://figma/figma-use/SKILL.md` (load the tool with ToolSearch `select:ReadMcpResourceTool` first). Pass `skillNames: "resource:figma-use"` on every call. If you cannot reach the Figma tools at all, stop and say so in your report; do not fake it.

## The system (non-negotiable)

- **Tokens only.** Colors: variables `prime` `dark` `light` (collection Colors) and `text` `muted` (collection Text, modes `Light BG`/`Dark BG`). Spacing: collection Resolution, modes Default/Mobile/Mega: `pad-x` `pad-y` `gap` `radius` `small-pad-x` `small-pad-y` `btn-pad-x` `btn-pad-y` `section-pad-x` `section-pad-y`. Text styles: `h1 h2 h3 h4 body` (never `code`: its font is missing; code text is Cousine Bold 14 by hand).
- **Grounds are the approved stacks only:** white; white + 10% black (inset); prime + 25% black (Text mode Dark BG); dark; dark + 10% black; dark + 10% white; dark + 50% black. A dark or prime frame sets Text = Dark BG so bound text turns white.
- **Components are always Resolution `Default`** (set it on the component). Containers (a screen, a column) take the context mode; a phone screen is `Mobile`.
- **Hug or fill.** A fixed size only for: viewport (phone 390×844), icon glyphs (20/24), touch-target min height 44, image/thumbnail boxes, bars. Name a fixed node with its reason: `Thumb (fixed 120: image)`.
- **Text through properties.** Every component exposes its text as TEXT properties (`Label`, `Sub`, `Meta`, `Icon`...) wired with `componentPropertyReferences = {characters: key}`; instances are filled with `setProperties`, never by editing text.
- **Icons:** font `Material Symbols Rounded` / `Regular`, the ligature name as text (`search`, `close`), size 20 or 24, fill bound to `muted` or `text`.
- **Containers use slots.** A component that holds arbitrary content (card, panel, dialog, sheet, accordion body) gets `const k = comp.addComponentProperty('Content','SLOT','')` and a child auto-layout frame bound with `frame.componentPropertyReferences = {slotContentId: k}`. In an instance that child is a `SLOT` node; `slot.appendChild(anything)` fills it. (Verified 2026-10-12.)
- **Reuse before you build.** The UI Kit page (`126:15264`) already has: `Row` set `139:1095` (Size Compact/Two-line × State Default/Hover/Selected; props Label, Sub, Meta, Icon), `Tree row` set `139:1120` (Open × State Default/Hover/Selected/Current; Label, Icon), `Section header` `139:1121` (Label), `Button` set `139:1132` (Kind Primary/Secondary/Ghost; Label, Icon), `Logo` `142:1245`, `Nav link` set `132:1068`. Use instances of these; do not rebuild them.

## Shape of your page

1. One component set per site component, laid out in a column on the left, each with a small `Section header` above it naming the site path (`ui/badge`).
2. A **section card** per component (a white frame, `pad-y`/`pad-x`): the component's variants, then the same component inside a 390-wide `Mobile` phone strip, so we see it works on a phone.
3. At the end, 1–3 phone screens (390×844, `Mobile`) composed only from your instances plus the existing kit, showing the pieces in use.

Work in small, retry-safe `use_figma` calls (one component per call is fine), return node ids, and take a screenshot after each section; fix what looks wrong (clipped text, a fixed height, an off-system grey) before moving on.

## Report (your `<slug>.md`, under 40 lines)

What you built (component name → node id → site path), anything on the site you could not map and why, every place you needed a value no token gives (that list is the most useful thing you can return), and one screenshot-backed sentence on what still looks off. Then commit it and stop.
