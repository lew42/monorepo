# Past work: page templates and instant page operations

## What exists

| What | Path | What it does | Live? |
|---|---|---|---|
| **Template class** | `public/framework/core/Page/Template/Template.js` | `class Template extends Page`: render() draws many times, clone(data) links copies, show(name) binds fields, set/unset/drop(view) keep it live | ✅ Used: BigCard (1 hit), template demos, template tests |
| **BigCard template** | `public/framework/core/Page/Template/BigCard/BigCard.js` | First template: the Figma palette card — mark, heading, lead, column grid | ✅ Used: /framework/core/Page/Template/ page, Template tests |
| **Property class** | `public/framework/core/Property/Property.js` | One live value: get(), set(v), change event, bind(fn) for live binding | ✅ Used: Property tests, Template bindings, binding.md measured 1,000 rows |
| **Template docs** | `public/framework/core/Page/doc/templates.md` | Design, decisions, binding flow (why Property not Item), convention for ui/ folders | ✅ Linked from Template/readme.md, core/Page/ index |
| **Binding measurement** | `public/framework/core/Page/doc/binding.md` | 1,000-row benchmark: Property binding 5× faster than re-render, 2.4× less memory than Property-per-cell | ✅ Live doc with results.txt |

## The owner's words on templates

- **2026-11-09** (relayed voice-app on 2026-11-09): "I kept asking for a template system. I don't know if we ever figured out how to do that." ([requirements.md line 7](#past-work-brief.md))
- **2026-10-13** (session-87bec773/page-templates/requirements.md:1): "Page templates: pages as the building block, `class Template extends Page`, and property binding"
- **2026-10-12** (page-templates/plan.md:6): Template already has a url, a title, a demo — "A page already draws parts, owns a page.jsonl, and has events through Item. Nothing new is needed underneath."
- **2026-10-07** (asks.jsonl): "Confirm naming the class Template extends Page rather than Layout" — decided yes, verified in core/Page/Template/Template.js:6

## Past plans: built or open

| Plan | What | Built? |
|---|---|---|
| [page-templates/requirements.md](../../../2026/10/12/session-87bec773/page-templates/requirements.md) | Five steps: name (Template extends Page), Property class, Template class, BigCard demo, binding doc | ✅ All landed: commits 7bbdf220e, aff047c73, e45085cf2, 0ffbd4763 and after; merged |
| [page-templates/plan.md](../../../2026/10/12/session-87bec773/page-templates/plan.md) | Decisions per question (naming, bind, clone, template per kind, don't precache views) | ✅ Matched against code in Template.js and binding.md |
| [mastermind-repo-slim/templates-live-proof/requirements.md](../../../2026/10/13/session-730e8a7b/mastermind-repo-slim/templates-live-proof/requirements.md) | Prove Template runs in headless (1,000-row measurement) | ✅ Done: results.txt on disk, probe.mjs and screenshots |

## Instant page operations today

The **item** tool (all these work now):

| Operation | Delta | File:line |
|---|---|---|
| **New page** | `{"pages":{"add":{"name":"notes","title":"Notes","icon":"📝","description":"One line."}}}` | [page_tools.js](../../../../../../../../Servex/agents/page_tools.js) (routes), [core/Page/doc/ai-api.md](../../../../../core/Page/doc/ai-api.md:56) |
| **Add tab** | Not a separate verb; subpages ARE tabs: `{"pages":{"add":{…}}}` creates one | [ai-api.md:56](#subpage) |
| **Full screen** | `page.full_screen(true)` (not a delta; a method on the page's Item) | [AISessionDetail.js:274](../../../../../core/../../../AISession/AISessionDetail.js:274), [ai-api.md](../../../../../core/Page/doc/ai-api.md) (not in the delta table) |
| **Add card** | `{"content":{"add":{"type":"part-card","title":"Cache","text":"Hit rate 92%."}}}` | [ai-api.md:45](../../../../../core/Page/doc/ai-api.md:45) |
| **Add heading** | `{"content":{"add":{"type":"part-heading","text":"Findings"}}}` | [ai-api.md:44](../../../../../core/Page/doc/ai-api.md:44) |
| **Add paragraph** | `{"content":{"add":{"type":"part-text","text":"Some **markdown**."}}}` | [ai-api.md:46](../../../../../core/Page/doc/ai-api.md:46) |

**Proof:** [ai-api.md](../../../../../core/Page/doc/ai-api.md) line 92–100 (headless Chromium, Haiku agent, 0 wrong deltas, $0.19, each step live with no reload).

---

**Summary.** The template system exists and is live. Template is a page that renders many times with its own data; BigCard is the first template. Binding is measured and optimized. All instant page operations work: new page, tabs (as subpages), full screen (a method call outside the delta model), and add any card type. Everything the brief asked for is built.
