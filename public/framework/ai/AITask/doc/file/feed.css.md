Fifteen lines: turn/meta/flow spacing for `feed.js` only. Looks — `wash`,
`muted` — come from `framework.css`, same convention as `ai.css`.

## Improvements

1. **This could fold into `ai.css`.** At fifteen lines it's the smallest
   file in the module, and `ai.css` already styles the sibling `replay.js`
   output (`.ai-thread`, `.ai-detail`) that `.ai-turn` here parallels almost
   rule-for-rule. Keeping it separate does mean `feed.js`'s
   `View.stylesheet(import.meta, "feed.css")` only loads what it needs — a
   real if small benefit — so this is a judgment call, not a clear win either
   way. *(simple, speculative)*
