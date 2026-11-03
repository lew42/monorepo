# Brief: code the new controls as opt-in `--fig-*` CSS (2026-10-12, night)

The Figma design system now has Toggle, Checkbox, Radio, Dropdown and an icon set (pages `DS · 1.1 Icons`, `2.6 Dropdowns & menus`, `2.7 Toggles, checkboxes & radios` in file `QYN0G2URSBHYH5I06MOjxU`; reports [ds-toggles.md](ds-toggles.md), [ds-dropdowns.md](ds-dropdowns.md), [ds-icons.md](ds-icons.md)). Code them on the web the same way the buttons were: opt-in classes from `public/framework/ext/Figma/tokens/FigmaTokens.mjs` (run it to regenerate `tokens.css`), shown on the demo page `/framework/ext/Figma/tokens/`. Read `ext/Figma/readme.md`, `doc/token-sync.md` and `doc/figma-browser-loop.md` first.

## Rules
- **Never clobber the site.** Only `.fig-*` classes and `--fig-*` variables; nothing global changes. Scope `fig-` is registered in `styles/css-scopes.txt`.
- Read what exists first (`ux/Menu`, `ux/Popover`, `ui/menu`, any existing checkbox/toggle CSS). Reuse native `<input type=checkbox|radio>` and `<select>`/`<details>` where they work; style, don't rebuild.
- Classes: `.fig-toggle`, `.fig-check`, `.fig-radio`, `.fig-select` (closed trigger + open panel), `.fig-icon` (Material Symbols Rounded; sizes 16/20/24/32/48 as `.fig-icon-24` etc. or one size variable). 44 px touch target; on = accent + on-accent; off = 15% ink; focus = 2 px accent outline offset 2.
- Add a "Controls" section to the demo page: each control in each scheme (White, Light gray, Dark), and the settings screen from DS 2.7 rebuilt in code.
- Work in a worktree (`node Server/worktree-up.mjs fig-controls`, served at `fig-controls.localhost`), commit each working step, `check_page` the demo at 400/1200/1920/3440, compare against Figma screenshots (`get_screenshot`) side by side, then merge the way the repo says (merge.mjs + a review report). Remove the worktree after.

Report `kit/web-controls.md` (classes added, screenshots Figma vs page, what differs), committed by path.
