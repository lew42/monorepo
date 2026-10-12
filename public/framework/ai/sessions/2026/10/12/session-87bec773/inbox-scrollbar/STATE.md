# Inbox scrollbar — state
- Done: `.inbox-rows` scrollbar thin and transparent until hover (Firefox/Chrome `scrollbar-color` + `::-webkit-scrollbar`), rows white on the `--tint` rail, in `ux/Inbox/Inbox.css` (the one shared rail).
- Phone (400px): rail is a screen, row opens detail with "← all cards" back; verified by shot.
- Decision: the detail ground is `--surface` (white), not gray, so the rail keeps `--tint`; changing the detail's ground was out of scope.
- Left alone: detail column-paging header border. Hover shot and 1920/3440 before/after not taken.
