# Minion E — node 181-1456, wave 3

Verbatim ask (`figma/wave-3.md` + `figma/requirements.md` #3): "a set that sort of matches the
color scheme above. feel free to use existing colors in place of the ones used. feel free
(encouraged) to rewrite any text to express anything about our framework. these are mockups,
but don't have to be generic."

Survey claims seven screens: home, profile, settings, homepage, landing-page, about-page,
contact-page — flagged as unreliable (163-series was shifted by one elsewhere). Verify real
frame names via `get_metadata` first.

## Fences
- Own only my own layout dir(s) under `styles/layouts/` and one `BANDS` line in `layouts/page.js`.
- Never touch `framework.css`, `css-scopes.txt`, `ext/`, `styles/elements/`, or another minion's
  dir (`wire/ anatomy/ home/ toc-studio/ gallery/ set/`).
- Home for a new dir: `styles/layouts/screens/` — only if genuinely needed after checking the 30
  existing layouts.

## Steps
1. Verify node names via get_metadata + one screenshot
2. Check existing layouts for overlap
3. Plan pieces (seven screens is a lot — build pieces, then assemble)
4. Build
5. Rewrite copy to be true about the framework
6. Verify at 400/1280/1440/1920/3440, both scroll checks, zero console errors
7. Log questions/dilemmas
8. Documentation + finish-task
