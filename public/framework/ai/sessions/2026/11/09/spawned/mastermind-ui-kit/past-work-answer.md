# Past-work answer: UI kit research

## (a) Design system / UI kit / "small set of components"

**EXISTS** at [/framework/library/](/framework/library/) (2026-10-12, landed) plus [/framework/ui/](/framework/ui/) (building, 19 components merged).
- [UI library: one browsable library of everything we built](/framework/ai/sessions/2026/10/12/session-87bec773/ui-library/) — three-column browser, siblings left, chosen middle, variants right
- [UI: System class; /framework/ui/ library of approved blocks](/framework/ai/sessions/2026/09/30/) — queued, covers icon system, UI hierarchy

Three-column library is live. Five card styles exist as draft (not merged). Page variants need expansion.

## (b) "Template tree" / templates / core/Page/Template

**EXISTS** at [core/Page/Template/](/framework/core/Page/Template/) (2026-10-12, landed).
- [core/Page: Template, live Property binding, binding.md](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/) — BigCard cloned, B drawn twice, both live-bound, binding.md complete
- [Templates: weight per use, use-template skill/tool, one library](/framework/ai/sessions/2026/09/30/) — queued, awaiting owner pick on template weight

`class Template extends Page`, `clone(data)` makes new instances with their own listeners. BigCard is the first template. No "template tree" as a hierarchy; each template is standalone.

## (c) Library three-column browser, arrow keys, variants

**EXISTS** (library) + **NEW** (arrow keys).
- [/framework/library/](/framework/library/) — siblings rail left, full-size center, variants rail right; `?at=ui/card/media` syntax live, back/reload work
- Arrow key handling: **grep -r "keydown\|ArrowLeft\|ArrowRight" public/framework/library/** = no results

Keys not implemented. Library.js, Rail.js ready for keyboard input.

## (d) DesignTool / PaddingContract at merge (merge.mjs, smoke.mjs, check_page)

**PARTLY** — DesignTool exists, PaddingContract exists, no auto-run at merge yet.
- [DesignTool — measures a layout numerically: what is BROKEN](/framework/ext/DesignTool/) — audit page live, diff tool, three tiers (Meter, Score, Taste)
- [Library/PaddingContract.js](/framework/library/PaddingContract.js) — checks `[data-needs-parent-padding]` items, marks `.padding-misuse` offenders
- **grep -r "DesignTool\|PaddingContract" Server/ Servex/** = only doc references, no smoke.mjs or check_page calls

DesignTool and PaddingContract are tools. Not wired into merge.mjs; smoke.mjs, or check_page yet.

## (e) "No ad-hoc CSS" / CSS census / local CSS in pages

**EXISTS** (CSS census, local CSS warnings).
- [Local Model Strategy: CSS rule counts](/framework/ai/local/doc/strategy.md) — four-layer CSS census, `Why four rungs`
- [audit — the whole site measured and ranked worst-first](/framework/ext/DesignTool/audit/) — flags pages with CSS below framework
- [Page: audit of every layout, priority pages, reuse by default](/framework/ai/sessions/2026/09/30/) — queued, rule exists but no enforcement at merge

CSS audit exists, page-local CSS warnings exist (DesignTool). Enforcement at merge not yet implemented.

---

**Summary:** Library and Template are built and live. Draft card styles exist (5 variants in `/live/demos/cards/` on branch, 4 in current page.js). Arrow keys are missing. DesignTool + PaddingContract tools exist but are not wired into the merge gate.
