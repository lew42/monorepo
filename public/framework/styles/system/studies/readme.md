# Studies — the evidence behind the design system's numbers

**What.** Ten finished studies, each answering one design question with real screenshots
from the site — not opinions: `size/`, `spacing/` (plus `audit/`, `ceilings/`, `nesting/`),
`padding/` (plus `one-rule/`), `scale/`, `type/` (plus `anchors/`), `color/` (plus `palette/`,
`sections/`), `themes/`, `system/`, `vocabulary/`, `lists/`.

**Use.** Open [/framework/styles/system/studies/](/framework/styles/system/studies/) and
click any card — each study stands alone, leads with pictures, and ends with a rule.

**Watch out.** A 2026-09-19 hard reset wiped this whole module (it was never committed); two
transcript searches gave up and marked all nine studies gone for good. They were wrong — an
overlooked `git stash` from the moment of the reset held every file, byte-identical to what
survived. Restored 2026-09-20, `ai/2026-09-20/studies-honest/`.

Moved here from `/imagine/design/` 2026-09-18
(`ai/2026-09-18/imagine-move-2/`, following
[the imagine-integration proposal](/framework/ai/2026-09-17/imagine-integration/proposal.md)).
Every old `/imagine/design/<name>/` address still answers — a one-line stub points back here
— down to every sub-study (`color/palette/`, `color/sections/`, `padding/one-rule/`,
`spacing/audit/`, `spacing/ceilings/`, `spacing/nesting/`, `type/anchors/`). Four sibling
studies did **not** move here: `controls`, `layout`, `navigation` and `journey` each proved a
rule for one specific module, so they joined that module instead —
[`/framework/ui/controls/study/`](/framework/ui/controls/study/) ·
[`/layouts/doc/studies/`](/layouts/doc/studies/) ·
[`/web/nav/doc/study/`](/web/nav/doc/study/) ·
[`/framework/ext/DesignTool/journey/`](/framework/ext/DesignTool/journey/).

**More.**
- [Overview](/framework/styles/system/studies/) — the ten, as cards
- [/framework/styles/system/](/framework/styles/system/) — the page these studies prove
- `.design-shot`, the class every study's own preview card wears, now lives in
  `core/Page/Page.css` beside `.page-preview-thumb` — it moved out of this realm's own
  `design.css` (deleted) once studies elsewhere started using it too.
