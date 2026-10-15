# Pages hold their own UI pieces: a templates/ui subdirectory (captured, not started)

## The owner's words (voice, 2026-10-15, question d738360b, relayed)

> He's thinking every page (e.g. the Sessions tab of the AI page, which has its own left sidebar) should have a templates or UI subdirectory for its UI pieces. He recalls past work on using the page system as a template primitive (trees of templates that are pages, which can optionally save data to the filesystem, indexed in the parent page). He wants to see the documentation on that; please point to it.

## The record

- Templates doc: [core/Page/doc/templates.md](/framework/core/Page/doc/templates.md) — `Template extends Page`, `clone`/`copy`, `BigCard`; live demo [/framework/core/Page/Template/](/framework/core/Page/Template/); plan [page-templates/plan.md](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/plan.md).
- Page architecture: [core/Page/doc/architecture.md](/framework/core/Page/doc/architecture.md) — `Session.Page` as the shared template is not built yet; `page.jsonl` reshapes a template page.

## The ask

Decide (make skill: name, place) the convention for a page's own UI pieces, e.g. `<page>/ui/` holding Template subclasses that are themselves pages indexed by the parent's `children:`. Write it into the templates doc, then use it first for the usage meter variants. Ask first if it moves a responsibility in core/Page.
