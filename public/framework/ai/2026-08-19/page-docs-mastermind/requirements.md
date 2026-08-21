# page-docs-mastermind — run task (group ai-ops)

The owner, 2026-08-19 (verbatim, condensed where it was thinking aloud):

> this seems way too complicated … generally speaking, a page could just be a normal div, fill all horizontal space. and if it wanted the grid, it adds ".grid.standard" … with the standard grid, we get the main (--measure), wide, and bleed? i'm not sure about full, etc..
> I kept asking you to document, show me how this works… my current core/Page pages are absolute trash… 12 simple examples on Overview that are all basically the same, slight syntax variants. Get those out of there. make a left inner navbar (.tabs.vertical, like the classdoc system).
> Move all these current pages (overview, navigation, children, previews, shell, page flow) to a new tab: "old". we're going to rewrite the page docs… pages ARE navigation. you navigate children. these are all core concepts… but we need a better overview of --measure, .$pages, --page-pad, all these things that actually matter…
> spawn minions, don't do it yourself, we're running out of weekly usage. work autonomously, mastermind style… you can stop when you think it's better.
> do a thorough audit (spawn a minion) to scan all site pages, and document the variants for each of these properties. tell each minion: imagine you're a new user. how do we want organize the docs?
> demo.app() is a great tool, but the catalog preview bar just didn't work very well (the scrollbar on the rail just hovers there). I like the left inner nav… settle on top tabs -> left inner rail. that gives us 3 levels of navigation. a 4th level of "top tabs" could work, but you'd need to switch the inner and outer colors. try that out.
> convert all `.page-<pagename>` to `.page--<pagename>`, so that `.page-previews` doesn't clash with a page named "Previews".
> focus the core/Page (overview) on a visual, browsable grid(s) of page examples. look at the styles/layouts/?
> i want to be able to find everything page related when i come to this core/Page page. i'm less concerned with js code examples… the problem is the CSS and layout. maybe pay attention to "full" (screen? viewport? app.$pages (no sidebar), framework pages (with framework sidebar)… on the ext/Panel and Workspace pages, we have these workspaces that can't seem to go fullscreen. I don't think I want to remove the framework sidebar…
> watch token usage, stay under pace so we don't hit the wall.

## Plan

Wave 1 (parallel): `page-layout-audit` (Opus, read-only) · `page-stamp-rename` (Sonnet) · `page-docs-restructure` (Sonnet).
Wave 2 (after the audit lands): `page-docs-rewrite` — the visual overview + concept pages, per the audit's proposal.
The "page is a plain div, grid opt-in" change is RULE#1 surgery → a written proposal from the audit, never an autonomous edit.

## Fences
- Another mastermind (run-4, Panel) is live in a parallel session: nobody here touches `ext/Panel/**`.
- rename owns `core/Page/Page.class.js`, `ext/Doc/Doc.js`, and selector edits anywhere else.
- restructure owns `core/Page/**` except those two, plus link-only edits in the 35 inbound files.
- audit edits only its own task dir.
