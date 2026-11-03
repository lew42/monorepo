# Inbox scrollbar — state
- Done: `.inbox-rows` scrollbar thin and transparent until hover (Firefox/Chrome `scrollbar-color` + `::-webkit-scrollbar`), rows white on the `--tint` rail, in `ux/Inbox/Inbox.css` (the one shared rail).
- Phone (400px): rail is a screen, row opens detail with "← all cards" back; verified by shot.
- Decision: the detail ground is `--surface` (white), not gray, so the rail keeps `--tint`; changing the detail's ground was out of scope.
- Left alone: detail column-paging header border. Hover shot and 1920/3440 before/after not taken.

## Update (owner: detail ground in scope)
- `.inbox-detail` is now `--tint` too: one gray ground, white rows/head/cards. Shots `after-400/1920/3440.png`, `hover-1920.png` here (`hover.mjs` makes them).
- "Before" shots not taken; the before state is commit 7fad40dc9^ in git. Headless hover shows no thumb (overlay scrollbars), so the hover look is unproven in real Chrome.
