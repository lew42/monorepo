// One nesting depth for every card-shaped thing on the site: levels 1
// through BOXED_LEVELS get a box (`.card`); anything deeper drops the box
// and becomes a plain, bigger heading at the same indentation instead — the
// owner's rule, "after the third level, you're maxing out your padding
// space" (2026-09-29). `nesting/page.js` (a plain card tree) and
// `log/LogView.js` (a Logger's nested groups) both import this single
// constant so the two can never drift apart again — they did, briefly: see
// `card/doc/system.md`'s Nesting table.
export const BOXED_LEVELS = 3;
