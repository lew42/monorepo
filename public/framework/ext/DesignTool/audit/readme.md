# audit — the whole site measured and ranked worst-first, for whoever fixes layouts

## Use

Open [/framework/ext/DesignTool/audit/](/framework/ext/DesignTool/audit/) — the saved run loads instantly; "Re-measure live" is 168 iframe loads. What `page.js` does:

```js
import { frame } from "../DesignTool.js";
import { worst_first } from "../score.js";

const { rows } = await fetch("/framework/ext/DesignTool/audit/findings.json").then(r => r.json());
rows.filter(r => r.width === 1280).sort(worst_first);   // the saved baseline
rank_shape(await frame(url, 1280));                      // one page, live — page.js's own shape
```

## Watch out

- The table is a **worklist**, not a quality ranking — there is no score or grade; the old one was anti-correlated with how pages look. `taste/` ranks quality. [doc/decisions.md](./doc/decisions.md)
- A saved row never has an `.issues` key — `open()` uses `row.issues?.length` to decide live vs cached; don't rename `.rules` to `.issues`. [doc/decisions.md](./doc/decisions.md)
- Live and saved rows must share `rules` + `leading_rule` (`rank_shape()` in `page.js`) or `problems()` reads them differently. [doc/decisions.md](./doc/decisions.md)
- `findings.json` is `{ generated_at, format, rows }` — `format` states its own rule; rows are uncapped `{rule,title,sev}` summaries, no detail (a cap once silently dropped the worst finding on 89 rows). [doc/decisions.md](./doc/decisions.md)
- `pages.js` is generated (a `**` + slash inside its comment once closed the comment and broke nine pages) — regenerate, don't hand-edit; its header says how.

## More

- [doc/decisions.md](./doc/decisions.md) — the score removal (evidence, numbers), the no-cap format, regenerating, the traps in full.
- Page: [/framework/ext/DesignTool/audit/](/framework/ext/DesignTool/audit/) · quality tier: [taste/](./taste/) · method: `ai/2026-08-16/audit-baseline/`
- Files: `page.js` (load, run, rank), `findings.json` (saved baseline), `pages.js` (generated url list), `twin.js` (before/after pane)
