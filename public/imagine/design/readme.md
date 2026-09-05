# Design — a design review built from screenshots

**What.** One overnight program (2026-09-01) visited every page on the site and saved a
screenshot of each — that whole collection is `journey/`. Every other page here studies
those same screenshots to answer one design question: `padding/`, `scale/`, `layout/`,
`navigation/`, `color/`, `type/`, `controls/`, `vocabulary/`, `system/`, `themes/`.

**Use.** Open [/imagine/design/](/imagine/design/) and click any card — each study stands
alone, leads with pictures, and ends with a rule stated in one sentence.

**Watch out.** `page.js` used to render this index as a bare word list in the default
~40em column (no `width:`, no card wall) — the exact "can't tell what to click" failure the
studies below diagnose in *other* realms. Fixed 2026-09-04: `width: "full"` (every child
already wore it) + `index: true` + `previews()`, so the front door now uses the same tile
wall its own `layout/` study recommends. `public/framework/ai/2026-09-04/imagine-design/`
has the before/after screenshots.

**More.** Raw crawl data and task logs: `/framework/ai/2026-09-01/*-study/` (one dir per
study, named in each page's own doc). The sitewide layout critique that caught this page's
own failure: [`/imagine/paging/critique/`](/imagine/paging/critique/).
