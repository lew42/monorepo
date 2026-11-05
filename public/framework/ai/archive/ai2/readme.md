# ai2 (archived 2026-11-04)

`public/framework/ai2/` is gone. AI 2 was merged into AI on 2026-10-09: its code is in [ai/cards](/framework/ai/cards/) and [ai/rail](/framework/ai/rail/), its docs in [ai/doc/ai2](/framework/ai/doc/ai2/history.md).

- `page.js.archived`: the old route page for `/framework/ai2/` (renamed so it never routes). `ai2.css`: its look.
- The 18 one-line import shims and the generated file listings were removed; git has them. Every old and new path: [manifest.json](/framework/ai/sessions/2026/11/04/session-5132a480/ai2-remove/manifest.json).
- Old links still work: `public/index.html` rewrites `/framework/ai2/…` to `/framework/ai/…` (and `/framework/ai2/YYYY/MM/DD/…` to `/framework/ai/sessions/YYYY/MM/DD/…`) before the app routes, so it also works on the static host.

Old addresses: a script in `public/index.html` rewrites `/framework/ai2/…` before the app routes it. A dated card (`/framework/ai2/2026/09/24/<card>/`) goes to `/framework/ai/2026/09/24/<card>/`. A session folder (`session-…` or a uuid) goes under `/framework/ai/sessions/`. The old `needs/` view goes to `/framework/ai/inbox/`, and anything else keeps its tail. 531 card `page.jsonl` files still name `"class": "/framework/ai2/card.js"`, so `core/Page/Jsonl.js` maps that one path to `/framework/ai/cards/card.js`.
