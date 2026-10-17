# Pages hold their own UI pieces: a templates/ui subdirectory (captured, not started)

## The owner's words (voice, 2026-10-15, question d738360b, relayed)

> He's thinking every page (e.g. the Sessions tab of the AI page, which has its own left sidebar) should have a templates or UI subdirectory for its UI pieces. He recalls past work on using the page system as a template primitive (trees of templates that are pages, which can optionally save data to the filesystem, indexed in the parent page). He wants to see the documentation on that; please point to it.

## The record

- Templates doc: [core/Page/doc/templates.md](/framework/core/Page/doc/templates.md) — `Template extends Page`, `clone`/`copy`, `BigCard`; live demo [/framework/core/Page/Template/](/framework/core/Page/Template/); plan [page-templates/plan.md](/framework/ai/sessions/2026/10/12/session-87bec773/page-templates/plan.md).
- Page architecture: [core/Page/doc/architecture.md](/framework/core/Page/doc/architecture.md) — `Session.Page` as the shared template is not built yet; `page.jsonl` reshapes a template page.

## The ask

Decide (make skill: name, place) the convention for a page's own UI pieces, e.g. `<page>/ui/` holding Template subclasses that are themselves pages indexed by the parent's `children:`. Write it into the templates doc, then use it first for the usage meter variants. Ask first if it moves a responsibility in core/Page.

## Verdict (checkup, 2026-10-17): PARTLY exists

- **Exists:** a page is already a tree node: `children:` indexes sub-pages and a `page.jsonl` can reshape one (`core/Page/doc/jsonl-pages.md`, `architecture.md`). `Template extends Page` renders one layout many times with `clone`/`copy`, and `BigCard` is the first template, with a live demo (`core/Page/Template/`, `core/Page/doc/templates.md`). Nothing needs to move in `core/Page`.
- **Does not exist:** the *convention* that a page keeps its own UI pieces in `<page>/ui/`, one `Template` subclass per file named for the class, listed in the parent's `children:`. No page has a `ui/` folder today; the Sessions tab keeps its pieces beside `page.js`. And `Session.Page` as a shared template is not built.
- **Decision:** a small step, done now by the checkup, not a todo: the convention is written in `core/Page/doc/templates.md` ("Where a page's own UI pieces live"). It moves no responsibility, so nothing to ask. **Alternative:** a single global `ui/` library for all pages (rejected: that is `public/framework/ui/`, which is the shared catalogue; a page's own pieces belong beside it, law 6 only asks that a shared one is not copied). **Next, when someone has the hour:** use it first for the usage meter variants (`ai/AITask/dashboard.js`), as the brief says.
