# Figma "Sept 2026" frame → cards

The owner, verbatim (2026-09-28): "try to create a new task that's you know converting this uh, this frame that I'm linking to here in Figma convert that frame into a card basically uh, well so put each there's a bunch of sections in there put each of those sections into a card so that you know when the task is done I can see this UI in the card"

Source: https://www.figma.com/design/QYN0G2URSBHYH5I06MOjxU/Sept-2026?node-id=43-12913 (frame "Darken" heading + 7 sections, 856 wide).
Pulled for you by the VS Code tab (SDK agents may not have the Figma MCP): `frame.png`, `sections/*.png` (each section at 1x), `metadata.xml` (every layer: id, type, name/text, x, y, w, h), `variables.json` (the file's tokens: Montserrat type scale, accent #72c4ff, darken/lighten, pads). Need more (e.g. get_design_context on one node)? Post the node id on the card; the VS Code tab relays it.

## Deliverables
1. One AI 2 card per section, 7 total, grouped under one group card "Figma: Sept 2026" (create via POST http://127.0.0.1:8090/card/create; group line per the card system):
   1 Typography · 2 Lists · 3 Form Elements · 4 2-Col: Pricing · 5 2-Col: Sidebar + Content · 6 UI Controls · 7 Task Management & AI Patterns
2. Each card DRAWS the section as live UI (a placed .js view built from the site's own components/classes, the tokens mapped onto the site's variables — not a screenshot), with the Figma screenshot beside or under it for comparison.
3. Reuse existing ui/ux components and CSS words first (css + layout + page skills); minimal new CSS; anything new that's reusable goes in ui/ or ux/, not the card folder.
4. Proof: screenshot of each card at 1920 next to its Figma section; list per section what matches and what doesn't.

## Rules
Pool worktree (take_worktree) or your own; smoke test with links followed; node Server/merge.mjs; fresh-eyes review before landing; every Playwright launch hidden. Post progress on the task's card two sentences at a time.
